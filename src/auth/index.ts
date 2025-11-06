import { LOGIN_ACTION_ID, SESSION_LIMITS, isSessionDurationValid } from '@/auth/config';
import { sessionStore } from '@/lib/session-store';
import { verifyCloudProof, type ISuccessResult, VerificationLevel } from '@worldcoin/idkit';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const FALLBACK_PROFILE = (seed: string) =>
  `https://avatar.vercel.sh/${encodeURIComponent(seed)}.svg?text=ID`;

const formatWalletLabel = (wallet: string | null | undefined) => {
  if (!wallet) {
    return 'World ID User';
  }

  const normalized = wallet.trim();
  if (!normalized.startsWith('0x') || normalized.length < 10) {
    return normalized;
  }

  return `${normalized.slice(0, 6)}…${normalized.slice(-4)}`;
};

const parseVerificationLevel = (level?: string | null): VerificationLevel => {
  if (!level) {
    return VerificationLevel.Orb;
  }

  const normalized = level.toLowerCase();
  const available = Object.values(VerificationLevel) as string[];
  return available.includes(normalized)
    ? (normalized as VerificationLevel)
    : VerificationLevel.Orb;
};

const parseSessionDuration = (value?: string | null) => {
  if (!value) {
    return SESSION_LIMITS.min;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || !isSessionDurationValid(parsed)) {
    throw new Error('Invalid session duration requested');
  }

  return parsed;
};

declare module 'next-auth' {
  interface User {
    walletAddress: string;
    username: string;
    profilePictureUrl: string;
    worldNullifier: string;
    sessionExpiresAt: number;
    sessionDurationMinutes: number;
  }

  interface Session {
    user: {
      walletAddress: string;
      username: string;
      profilePictureUrl: string;
      worldNullifier: string;
    } & DefaultSession['user'];
    sessionDurationMinutes: number;
  }
}

// Auth configuration for Wallet Auth based sessions
// For more information on each option (and a full list of options) go to
// https://authjs.dev/getting-started/authentication/credentials
export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'World ID',
      credentials: {
        proof: { label: 'Proof', type: 'text' },
        merkleRoot: { label: 'Merkle Root', type: 'text' },
        nullifierHash: { label: 'World Nullifier', type: 'text' },
        verificationLevel: { label: 'Verification Level', type: 'text' },
        walletAddress: { label: 'Wallet Address', type: 'text' },
        sessionDuration: { label: 'Session Duration (minutes)', type: 'text' },
      },
      authorize: async (credentials) => {
        const appId = process.env.NEXT_PUBLIC_APP_ID as `app_${string}` | undefined;

        if (!appId) {
          throw new Error('NEXT_PUBLIC_APP_ID is not configured');
        }

        if (!credentials) {
          throw new Error('Missing World ID credentials');
        }

        const {
          proof,
          merkleRoot,
          nullifierHash,
          verificationLevel,
          walletAddress,
          sessionDuration,
        } = credentials as Record<string, string | undefined>;

        if (!proof || !merkleRoot || !nullifierHash) {
          throw new Error('Incomplete World ID payload received');
        }

        const durationMinutes = parseSessionDuration(sessionDuration ?? null);
        const verificationPayload: ISuccessResult = {
          proof,
          merkle_root: merkleRoot,
          nullifier_hash: nullifierHash,
          verification_level: parseVerificationLevel(verificationLevel ?? null),
        };

        const verification = await verifyCloudProof(
          verificationPayload,
          appId,
          LOGIN_ACTION_ID,
        );

        if (!verification.success) {
          throw new Error(verification.detail ?? 'World ID verification failed');
        }

        const expiresAt = Date.now() + durationMinutes * 60_000;
        await sessionStore.save({
          worldNullifier: nullifierHash,
          walletAddress: walletAddress?.trim() || null,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(expiresAt).toISOString(),
        });

        const normalizedWallet = walletAddress?.trim() || '';

        return {
          id: normalizedWallet || nullifierHash,
          walletAddress: normalizedWallet,
          username: formatWalletLabel(normalizedWallet || nullifierHash),
          profilePictureUrl: FALLBACK_PROFILE(normalizedWallet || nullifierHash),
          worldNullifier: nullifierHash,
          sessionExpiresAt: expiresAt,
          sessionDurationMinutes: durationMinutes,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.walletAddress = user.walletAddress;
        token.username = user.username;
        token.profilePictureUrl = user.profilePictureUrl;
        token.worldNullifier = user.worldNullifier;
        token.sessionExpiresAt = user.sessionExpiresAt;
        token.sessionDurationMinutes = user.sessionDurationMinutes;
        token.exp = Math.floor(user.sessionExpiresAt / 1000);
      }

      if (token.sessionExpiresAt && Date.now() >= (token.sessionExpiresAt as number)) {
        return {};
      }

      return token;
    },
    session: async ({ session, token }) => {
      const expiresAt = typeof token.sessionExpiresAt === 'number' ? token.sessionExpiresAt : null;

      if (!expiresAt || Date.now() >= expiresAt) {
        return null;
      }

      if (token.userId) {
        session.user.id = token.userId as string;
        session.user.walletAddress = (token.walletAddress as string) ?? '';
        session.user.username = token.username as string;
        session.user.profilePictureUrl = token.profilePictureUrl as string;
        session.user.worldNullifier = (token.worldNullifier as string) ?? '';
      }

      session.expires = new Date(expiresAt).toISOString();
      session.sessionDurationMinutes = (token.sessionDurationMinutes as number) ?? SESSION_LIMITS.min;

      return session;
    },
  },
});
