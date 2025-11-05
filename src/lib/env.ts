const booleanEnv = (value: string | undefined, fallback = false) => {
  if (value === undefined) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const pickEnv = (keys: string[], fallback?: string) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.length > 0) {
      return value;
    }
  }
  return fallback;
};

export const env = {
  app: {
    name: pickEnv(['NEXT_PUBLIC_APP_NAME', 'VITE_APP_NAME'], 'WorldFans'),
    enableWldy: booleanEnv(pickEnv(['NEXT_PUBLIC_ENABLE_WLDY', 'VITE_ENABLE_WLDY']), false),
  },
  worldChain: {
    chainId: Number(pickEnv(['NEXT_PUBLIC_WORLDCHAIN_CHAIN_ID', 'VITE_WORLDCHAIN_CHAIN_ID'], '480')),
    rpcUrl: pickEnv(
      ['NEXT_PUBLIC_WORLDCHAIN_RPC', 'NEXT_PUBLIC_WORLDCHAIN_RPC_URL', 'VITE_WORLDCHAIN_RPC'],
      'https://rpc.sepolia.worldchain.xyz',
    )!,
  },
  contracts: {
    token: pickEnv(['NEXT_PUBLIC_WLDY_ADDRESS', 'VITE_WFANS', 'VITE_WLDY_ADDRESS']) as `0x${string}` | undefined,
    treasury: pickEnv(['NEXT_PUBLIC_TREASURY_ADDRESS', 'VITE_TREASURY_ADDRESS']) as
      | `0x${string}`
      | undefined,
    pay: pickEnv(['NEXT_PUBLIC_PAY_ADDRESS', 'VITE_PAY_CONTRACT']) as `0x${string}` | undefined,
    data: pickEnv(['NEXT_PUBLIC_TOKEN_DATA_ADDRESS', 'VITE_DATA_CONTRACT']) as `0x${string}` | undefined,
  },
  supabase: {
    url: pickEnv(['NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL']),
    anonKey: pickEnv(['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY']),
  },
};

export const ensureAddress = (address: `0x${string}` | undefined, fallback: `0x${string}`) => {
  if (address?.startsWith('0x')) {
    return address;
  }
  return fallback;
};
