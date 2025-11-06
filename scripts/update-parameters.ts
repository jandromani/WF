import { createPublicClient, createWalletClient, defineChain, http, parseEther } from 'viem';
import type { Abi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import PayWFANSAbi from '../src/abi/PayWFANS.json' assert { type: 'json' };
import WorldFansDataAbi from '../src/abi/WorldFansData.json' assert { type: 'json' };
import WorldFansTreasuryAbi from '../src/abi/WorldFansTreasury.json' assert { type: 'json' };

type Hex = `0x${string}`;

type Action =
  | { kind: 'fee'; value: number }
  | { kind: 'minTip'; value: bigint }
  | { kind: 'price'; creator: Hex; value: bigint }
  | { kind: 'activate'; creator: Hex; active: boolean }
  | { kind: 'authorizePay'; target: Hex }
  | { kind: 'revokePay'; target: Hex }
  | { kind: 'authorizeSubscription'; target: Hex }
  | { kind: 'revokeSubscription'; target: Hex }
  | { kind: 'authorizePrice'; target: Hex }
  | { kind: 'revokePrice'; target: Hex }
  | { kind: 'supply'; circulating: bigint; target: bigint }
  | { kind: 'emission'; value: bigint };

const ensure = <T>(value: T | undefined, message: string): T => {
  if (!value) {
    throw new Error(message);
  }
  return value;
};

const isHex = (value: string): value is Hex => value.startsWith('0x');

const nextArg = (args: string[], index: number, message: string): [string, number] => {
  const nextIndex = index + 1;
  const value = args[nextIndex];
  if (!value) {
    throw new Error(message);
  }
  return [value, nextIndex];
};

const parseActions = (args: string[]): Action[] => {
  const actions: Action[] = [];
  for (let i = 0; i < args.length; i += 1) {
    const flag = args[i];
    switch (flag) {
      case '--fee': {
        const [value, next] = nextArg(args, i, '--fee requires a bps value');
        actions.push({ kind: 'fee', value: Number(value) });
        i = next;
        break;
      }
      case '--min-tip': {
        const [value, next] = nextArg(args, i, '--min-tip requires an amount');
        actions.push({ kind: 'minTip', value: parseEther(value) });
        i = next;
        break;
      }
      case '--price': {
        const [creator, idx1] = nextArg(args, i, '--price requires a creator address');
        if (!isHex(creator)) throw new Error('creator must be a hex address');
        const [amount, next] = nextArg(args, idx1, '--price requires a value');
        actions.push({ kind: 'price', creator: creator as Hex, value: parseEther(amount) });
        i = next;
        break;
      }
      case '--activate': {
        const [creator, next] = nextArg(args, i, '--activate requires a creator');
        if (!isHex(creator)) throw new Error('creator must be a hex address');
        actions.push({ kind: 'activate', creator: creator as Hex, active: true });
        i = next;
        break;
      }
      case '--deactivate': {
        const [creator, next] = nextArg(args, i, '--deactivate requires a creator');
        if (!isHex(creator)) throw new Error('creator must be a hex address');
        actions.push({ kind: 'activate', creator: creator as Hex, active: false });
        i = next;
        break;
      }
      case '--authorize-pay': {
        const [target, next] = nextArg(args, i, '--authorize-pay requires an address');
        if (!isHex(target)) throw new Error('target must be a hex address');
        actions.push({ kind: 'authorizePay', target: target as Hex });
        i = next;
        break;
      }
      case '--revoke-pay': {
        const [target, next] = nextArg(args, i, '--revoke-pay requires an address');
        if (!isHex(target)) throw new Error('target must be a hex address');
        actions.push({ kind: 'revokePay', target: target as Hex });
        i = next;
        break;
      }
      case '--authorize-subscription': {
        const [target, next] = nextArg(args, i, '--authorize-subscription requires an address');
        if (!isHex(target)) throw new Error('target must be a hex address');
        actions.push({ kind: 'authorizeSubscription', target: target as Hex });
        i = next;
        break;
      }
      case '--revoke-subscription': {
        const [target, next] = nextArg(args, i, '--revoke-subscription requires an address');
        if (!isHex(target)) throw new Error('target must be a hex address');
        actions.push({ kind: 'revokeSubscription', target: target as Hex });
        i = next;
        break;
      }
      case '--authorize-price': {
        const [target, next] = nextArg(args, i, '--authorize-price requires an address');
        if (!isHex(target)) throw new Error('target must be a hex address');
        actions.push({ kind: 'authorizePrice', target: target as Hex });
        i = next;
        break;
      }
      case '--revoke-price': {
        const [target, next] = nextArg(args, i, '--revoke-price requires an address');
        if (!isHex(target)) throw new Error('target must be a hex address');
        actions.push({ kind: 'revokePrice', target: target as Hex });
        i = next;
        break;
      }
      case '--supply': {
        const [circulating, idx1] = nextArg(args, i, '--supply requires circulating amount');
        const [target, next] = nextArg(args, idx1, '--supply requires target amount');
        actions.push({ kind: 'supply', circulating: parseEther(circulating), target: parseEther(target) });
        i = next;
        break;
      }
      case '--emission': {
        const [value, next] = nextArg(args, i, '--emission requires an amount');
        actions.push({ kind: 'emission', value: parseEther(value) });
        i = next;
        break;
      }
      default:
        throw new Error(`Unknown argument ${flag}`);
    }
  }
  return actions;
};

const buildChain = (rpcUrl: string, chainId: number, symbol: string) =>
  defineChain({
    id: chainId,
    name: `WorldFans Chain (${chainId})`,
    network: `worldfans-${chainId}`,
    nativeCurrency: { name: symbol, symbol, decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] }, public: { http: [rpcUrl] } },
  });

async function main() {
  const actions = parseActions(process.argv.slice(2));
  if (actions.length === 0) {
    console.info('No actions provided. Use --fee, --price, --activate, --authorize-pay, etc.');
    return;
  }

  const rpcUrl = ensure(process.env.RPC_URL, 'RPC_URL is required');
  const privateKey = ensure(process.env.DEPLOYER_KEY as Hex | undefined, 'DEPLOYER_KEY is required');
  const chainId = Number(process.env.CHAIN_ID ?? '480');
  const nativeSymbol = process.env.NATIVE_SYMBOL ?? 'ETH';
  const payAddress = ensure(process.env.PAY_CONTRACT_ADDRESS as Hex | undefined, 'PAY_CONTRACT_ADDRESS is required');
  const dataAddress = ensure(process.env.DATA_CONTRACT_ADDRESS as Hex | undefined, 'DATA_CONTRACT_ADDRESS is required');
  const treasuryAddress = ensure(
    process.env.TREASURY_CONTRACT_ADDRESS as Hex | undefined,
    'TREASURY_CONTRACT_ADDRESS is required',
  );

  const account = privateKeyToAccount(privateKey);
  const chain = buildChain(rpcUrl, chainId, nativeSymbol);
  const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) });

  for (const action of actions) {
    switch (action.kind) {
      case 'fee': {
        console.log(`→ Updating feeBps to ${action.value}`);
        const hash = await walletClient.writeContract({
          account,
          address: payAddress,
          abi: PayWFANSAbi as Abi,
          functionName: 'setFeeBps',
          args: [action.value],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`  tx hash: ${hash}`);
        break;
      }
      case 'minTip': {
        console.log(`→ Updating minTip to ${action.value}`);
        const hash = await walletClient.writeContract({
          account,
          address: payAddress,
          abi: PayWFANSAbi as Abi,
          functionName: 'setMinTipAmount',
          args: [action.value],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`  tx hash: ${hash}`);
        break;
      }
      case 'price': {
        console.log(`→ Updating price for ${action.creator} to ${action.value}`);
        const hash = await walletClient.writeContract({
          account,
          address: dataAddress,
          abi: WorldFansDataAbi as Abi,
          functionName: 'setCreatorPrice',
          args: [action.creator, action.value],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`  tx hash: ${hash}`);
        break;
      }
      case 'activate': {
        console.log(`${action.active ? '→ Activating' : '→ Deactivating'} creator ${action.creator}`);
        const hash = await walletClient.writeContract({
          account,
          address: dataAddress,
          abi: WorldFansDataAbi as Abi,
          functionName: 'setCreatorActive',
          args: [action.creator, action.active],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`  tx hash: ${hash}`);
        break;
      }
      case 'authorizeSubscription': {
        console.log(`→ Granting subscription updater role to ${action.target}`);
        const hash = await walletClient.writeContract({
          account,
          address: dataAddress,
          abi: WorldFansDataAbi as Abi,
          functionName: 'grantSubscriptionUpdater',
          args: [action.target],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`  tx hash: ${hash}`);
        break;
      }
      case 'revokeSubscription': {
        console.log(`→ Revoking subscription updater role from ${action.target}`);
        const hash = await walletClient.writeContract({
          account,
          address: dataAddress,
          abi: WorldFansDataAbi as Abi,
          functionName: 'revokeSubscriptionUpdater',
          args: [action.target],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`  tx hash: ${hash}`);
        break;
      }
      case 'authorizePrice': {
        console.log(`→ Granting price manager role to ${action.target}`);
        const hash = await walletClient.writeContract({
          account,
          address: dataAddress,
          abi: WorldFansDataAbi as Abi,
          functionName: 'grantPriceManager',
          args: [action.target],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`  tx hash: ${hash}`);
        break;
      }
      case 'revokePrice': {
        console.log(`→ Revoking price manager role from ${action.target}`);
        const hash = await walletClient.writeContract({
          account,
          address: dataAddress,
          abi: WorldFansDataAbi as Abi,
          functionName: 'revokePriceManager',
          args: [action.target],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`  tx hash: ${hash}`);
        break;
      }
      case 'authorizePay': {
        console.log(`→ Granting pay module role to ${action.target}`);
        const hash = await walletClient.writeContract({
          account,
          address: treasuryAddress,
          abi: WorldFansTreasuryAbi as Abi,
          functionName: 'grantPayModule',
          args: [action.target],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`  tx hash: ${hash}`);
        break;
      }
      case 'revokePay': {
        console.log(`→ Revoking pay module role from ${action.target}`);
        const hash = await walletClient.writeContract({
          account,
          address: treasuryAddress,
          abi: WorldFansTreasuryAbi as Abi,
          functionName: 'revokePayModule',
          args: [action.target],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`  tx hash: ${hash}`);
        break;
      }
      case 'supply': {
        console.log('→ Updating supply metrics');
        const hash = await walletClient.writeContract({
          account,
          address: treasuryAddress,
          abi: WorldFansTreasuryAbi as Abi,
          functionName: 'updateSupply',
          args: [action.circulating, action.target],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`  tx hash: ${hash}`);
        break;
      }
      case 'emission': {
        console.log(`→ Updating epoch emission to ${action.value}`);
        const hash = await walletClient.writeContract({
          account,
          address: treasuryAddress,
          abi: WorldFansTreasuryAbi as Abi,
          functionName: 'setEpochEmission',
          args: [action.value],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`  tx hash: ${hash}`);
        break;
      }
      default:
        throw new Error(`Unsupported action ${(action as { kind: string }).kind}`);
    }
  }
}

main().catch((error) => {
  console.error('Update failed');
  console.error(error);
  process.exitCode = 1;
});
