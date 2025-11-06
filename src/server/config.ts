import 'dotenv/config';

type RequiredEnv = 'SUPABASE_URL' | 'SUPABASE_SERVICE_ROLE_KEY' | 'WORLDCHAIN_RPC_URL' | 'WFANS_CONTRACT_ADDRESS';

type OptionalEnv =
  | 'WORLDID_APP_ID'
  | 'WORLDID_ACTION'
  | 'WORLDID_API_KEY'
  | 'SERVER_PORT'
  | 'SERVER_HOST'
  | 'RELAYER_PRIVATE_KEY';

const getEnv = (key: RequiredEnv | OptionalEnv, fallback?: string) => {
  const value = process.env[key];
  if (!value && !fallback && isRequired(key)) {
    throw new Error(`Missing required environment variable ${key}`);
  }

  return value ?? fallback ?? '';
};

const isRequired = (key: RequiredEnv | OptionalEnv): key is RequiredEnv => {
  return ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'WORLDCHAIN_RPC_URL', 'WFANS_CONTRACT_ADDRESS'].includes(key);
};

export const config = {
  host: getEnv('SERVER_HOST', '0.0.0.0'),
  port: Number.parseInt(getEnv('SERVER_PORT', '4000'), 10),
  worldId: {
    appId: getEnv('WORLDID_APP_ID', ''),
    action: getEnv('WORLDID_ACTION', ''),
    apiKey: getEnv('WORLDID_API_KEY', ''),
  },
  supabase: {
    url: getEnv('SUPABASE_URL'),
    serviceRoleKey: getEnv('SUPABASE_SERVICE_ROLE_KEY'),
  },
  worldchain: {
    rpcUrl: getEnv('WORLDCHAIN_RPC_URL'),
    wfansAddress: getEnv('WFANS_CONTRACT_ADDRESS'),
  },
  relayer: {
    privateKey: getEnv('RELAYER_PRIVATE_KEY', ''),
  },
} as const;

export type AppConfig = typeof config;
