import { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { config } from './config.js';
import { supabase } from './supabase.js';
import {
  buildSubscribeTransaction,
  buildTipTransaction,
  maybeCreateRelayer,
  publicClient,
} from './worldchain.js';

const relayer = maybeCreateRelayer();

const worldIdSchema = z.object({
  nullifier_hash: z.string(),
  merkle_root: z.string(),
  proof: z.string(),
  verification_level: z.string().optional(),
  signal: z.string().optional(),
  action: z.string().optional(),
});

const paymentBaseSchema = z.object({
  from: z.string(),
  creatorAddress: z.string(),
  gasPriceGwei: z.number().optional(),
  useRelayer: z.boolean().optional().default(false),
});

const tipSchema = paymentBaseSchema.extend({
  amount: z.string(),
  comment: z.string().optional(),
});

const toBigInt = z.preprocess((value) => {
  if (typeof value === 'string') {
    return BigInt(value);
  }
  return value;
}, z.bigint());

const subscribeSchema = paymentBaseSchema.extend({
  tierId: toBigInt,
  months: toBigInt,
});

const sessionSchema = z.object({
  refreshToken: z.string(),
});

const policyUpdateSchema = z.object({
  policyId: z.string().uuid(),
  rules: z.record(z.unknown()),
});

export const registerRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.log.info(
      {
        route: request.routerPath ?? request.routeOptions.url,
        method: request.method,
        user: request.headers['x-user-id'] ?? null,
        ip: request.ip,
      },
      'audit:start',
    );
  });

  app.addHook('onSend', async (request, reply, payload) => {
    request.log.info(
      {
        route: request.routerPath ?? request.routeOptions.url,
        method: request.method,
        statusCode: reply.statusCode,
        user: request.headers['x-user-id'] ?? null,
      },
      'audit:complete',
    );
    return payload;
  });

  app.post('/auth/worldid/verify', async (request, reply) => {
    const parsed = worldIdSchema.parse(request.body);

    if (!config.worldId.appId || !config.worldId.action || !config.worldId.apiKey) {
      reply.code(500);
      return { error: 'World ID configuration missing' };
    }

    const response = await fetch('https://developer.worldcoin.org/api/v1/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.worldId.apiKey}`,
      },
      body: JSON.stringify({
        nullifier_hash: parsed.nullifier_hash,
        merkle_root: parsed.merkle_root,
        proof: parsed.proof,
        verification_level: parsed.verification_level ?? 'orb',
        signal: parsed.signal,
        action: parsed.action ?? config.worldId.action,
        app_id: config.worldId.appId,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      app.log.warn({ payload }, 'world-id verification failed');
      reply.code(400);
      return { error: 'verification_failed', details: payload };
    }

    const verification = await response.json();
    return { verification };
  });

  app.get('/user/me', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      reply.code(401);
      return { error: 'missing_authorization_header' };
    }

    const accessToken = authHeader.replace('Bearer ', '');
    const userResult = await supabase.auth.getUser(accessToken);
    if (userResult.error || !userResult.data?.user) {
      reply.code(401);
      return { error: 'invalid_session', details: userResult.error?.message };
    }

    const userId = userResult.data.user.id;

    const [profile, posts, dms] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase
        .from('posts')
        .select('*')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    if (profile.error) {
      reply.code(500);
      return { error: 'profile_lookup_failed', details: profile.error.message };
    }

    return {
      profile: profile.data,
      posts: posts.data ?? [],
      directMessages: dms.data ?? [],
    };
  });

  app.post('/payments/tip', async (request, reply) => {
    const parsed = tipSchema.parse(request.body);

    const txRequest = buildTipTransaction({
      creatorAddress: parsed.creatorAddress as `0x${string}`,
      amount: parsed.amount,
      comment: parsed.comment,
      from: parsed.from as `0x${string}`,
      gasPriceGwei: parsed.gasPriceGwei,
    });

    if (parsed.useRelayer) {
      if (!relayer) {
        reply.code(400);
        return { error: 'relayer_not_configured' };
      }

      const serialized = await relayer.signTransaction(txRequest);
      const hash = await publicClient.sendRawTransaction({ serializedTransaction: serialized });

      return {
        txRequest,
        relay: {
          hash,
          relayer: relayer.account.address,
        },
      };
    }

    return { txRequest };
  });

  app.post('/payments/subscribe', async (request, reply) => {
    const parsed = subscribeSchema.parse(request.body);

    const txRequest = buildSubscribeTransaction({
      creatorAddress: parsed.creatorAddress as `0x${string}`,
      tierId: typeof parsed.tierId === 'bigint' ? parsed.tierId : BigInt(parsed.tierId),
      months: typeof parsed.months === 'bigint' ? parsed.months : BigInt(parsed.months),
      from: parsed.from as `0x${string}`,
      gasPriceGwei: parsed.gasPriceGwei,
    });

    if (parsed.useRelayer) {
      if (!relayer) {
        reply.code(400);
        return { error: 'relayer_not_configured' };
      }

      const serialized = await relayer.signTransaction(txRequest);
      const hash = await publicClient.sendRawTransaction({ serializedTransaction: serialized });

      return {
        txRequest,
        relay: {
          hash,
          relayer: relayer.account.address,
        },
      };
    }

    return { txRequest };
  });

  app.post('/session/extend', async (request, reply) => {
    const parsed = sessionSchema.parse(request.body);

    const result = await supabase.auth.admin.refreshSession({ refresh_token: parsed.refreshToken });

    if (result.error || !result.data?.session) {
      reply.code(401);
      return { error: 'session_extend_failed', details: result.error?.message };
    }

    return {
      session: {
        accessToken: result.data.session.access_token,
        expiresAt: result.data.session.expires_at,
        refreshToken: result.data.session.refresh_token,
        user: result.data.session.user,
      },
    };
  });

  app.get('/treasury/policy/current', async (_, reply) => {
    const { data, error } = await supabase
      .from('treasury_policies')
      .select('*')
      .eq('active', true)
      .order('effective_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      reply.code(500);
      return { error: 'policy_fetch_failed', details: error.message };
    }

    return { policy: data };
  });

  app.get('/treasury/policy/history', async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;
    const limit = Number(query?.limit ?? '20');

    const { data, error } = await supabase
      .from('treasury_policies')
      .select('*')
      .order('effective_at', { ascending: false })
      .limit(Number.isNaN(limit) ? 20 : limit);

    if (error) {
      reply.code(500);
      return { error: 'policy_history_failed', details: error.message };
    }

    return { policies: data ?? [] };
  });

  app.post('/treasury/policy/update', async (request, reply) => {
    const parsed = policyUpdateSchema.parse(request.body);

    const { data, error } = await supabase
      .from('treasury_policies')
      .update({ rules: parsed.rules })
      .eq('id', parsed.policyId)
      .select()
      .single();

    if (error) {
      reply.code(500);
      return { error: 'policy_update_failed', details: error.message };
    }

    return { policy: data };
  });
};
