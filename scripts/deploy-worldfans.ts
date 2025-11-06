import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createPublicClient, createWalletClient, defineChain, http, parseEther } from 'viem';
import type { Abi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import WorldFansDataAbi from '../src/abi/WorldFansData.json' assert { type: 'json' };
import WorldFansTreasuryAbi from '../src/abi/WorldFansTreasury.json' assert { type: 'json' };
import PayWFANSAbi from '../src/abi/PayWFANS.json' assert { type: 'json' };

type Hex = `0x${string}`;

type DeployConfig = {
  rpcUrl: string;
  privateKey: Hex;
  chainId: number;
  nativeSymbol: string;
  tokenAddress: Hex;
  initialEmission: bigint;
  targetSupply: bigint;
  feeBps: number;
  minTip: bigint;
};

const ensure = <T>(value: T | undefined, message: string): T => {
  if (!value) {
    throw new Error(message);
  }
  return value;
};

const loadConfig = (): DeployConfig => {
  const rpcUrl = ensure(process.env.RPC_URL, 'RPC_URL is required');
  const privateKey = ensure(process.env.DEPLOYER_KEY as Hex | undefined, 'DEPLOYER_KEY is required');
  const chainId = Number(process.env.CHAIN_ID ?? '480');
  const nativeSymbol = process.env.NATIVE_SYMBOL ?? 'ETH';
  const tokenAddress = ensure(process.env.WFANS_TOKEN_ADDRESS as Hex | undefined, 'WFANS_TOKEN_ADDRESS is required');
  const initialEmission = parseEther(process.env.INITIAL_EPOCH_EMISSION ?? '1000');
  const targetSupply = parseEther(process.env.TARGET_SUPPLY ?? '1000000');
  const feeBps = Number(process.env.INITIAL_FEE_BPS ?? '500');
  const minTip = parseEther(process.env.MIN_TIP ?? '1');

  return {
    rpcUrl,
    privateKey,
    chainId,
    nativeSymbol,
    tokenAddress,
    initialEmission,
    targetSupply,
    feeBps,
    minTip,
  };
};

const buildChain = (rpcUrl: string, chainId: number, nativeSymbol: string) =>
  defineChain({
    id: chainId,
    name: `WorldFans Chain (${chainId})`,
    network: `worldfans-${chainId}`,
    nativeCurrency: {
      name: nativeSymbol,
      symbol: nativeSymbol,
      decimals: 18,
    },
    rpcUrls: {
      default: { http: [rpcUrl] },
      public: { http: [rpcUrl] },
    },
  });

const loadBytecode = (fileName: string): Hex => {
  const content = readFileSync(resolve('artifacts', fileName), 'utf8').trim();
  return (`0x${content}`) as Hex;
};

async function main() {
  const config = loadConfig();
  const chain = buildChain(config.rpcUrl, config.chainId, config.nativeSymbol);
  const account = privateKeyToAccount(config.privateKey);

  const publicClient = createPublicClient({ chain, transport: http(config.rpcUrl) });
  const walletClient = createWalletClient({ account, chain, transport: http(config.rpcUrl) });

  const dataBytecode = loadBytecode('contracts_WorldFansData_sol_WorldFansData.bin');
  const treasuryBytecode = loadBytecode('contracts_WorldFansTreasury_sol_WorldFansTreasury.bin');
  const payBytecode = loadBytecode('contracts_PayWFANS_sol_PayWFANS.bin');

  console.log(`Deploying contracts with ${account.address} on chain ${config.chainId}`);

  const dataHash = await walletClient.deployContract({
    abi: WorldFansDataAbi as Abi,
    bytecode: dataBytecode,
    args: [account.address],
  });
  const dataReceipt = await publicClient.waitForTransactionReceipt({ hash: dataHash });
  const dataAddress = ensure(dataReceipt.contractAddress as Hex | undefined, 'Data contract deployment failed');
  console.log(`WorldFansData deployed at ${dataAddress}`);

  const treasuryHash = await walletClient.deployContract({
    abi: WorldFansTreasuryAbi as Abi,
    bytecode: treasuryBytecode,
    args: [account.address, config.tokenAddress, config.tokenAddress, config.initialEmission, config.targetSupply],
  });
  const treasuryReceipt = await publicClient.waitForTransactionReceipt({ hash: treasuryHash });
  const treasuryAddress = ensure(
    treasuryReceipt.contractAddress as Hex | undefined,
    'Treasury contract deployment failed',
  );
  console.log(`WorldFansTreasury deployed at ${treasuryAddress}`);

  const payHash = await walletClient.deployContract({
    abi: PayWFANSAbi as Abi,
    bytecode: payBytecode,
    args: [account.address, config.tokenAddress, dataAddress, treasuryAddress, config.feeBps, config.minTip],
  });
  const payReceipt = await publicClient.waitForTransactionReceipt({ hash: payHash });
  const payAddress = ensure(payReceipt.contractAddress as Hex | undefined, 'Pay contract deployment failed');
  console.log(`PayWFANS deployed at ${payAddress}`);

  console.log('\nDeployment summary');
  console.log(`  Data:     ${dataAddress}`);
  console.log(`  Treasury: ${treasuryAddress}`);
  console.log(`  Pay:      ${payAddress}`);
}

main().catch((error) => {
  console.error('Deployment failed');
  console.error(error);
  process.exitCode = 1;
});
