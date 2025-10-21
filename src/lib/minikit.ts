import { MiniKit, type PayCommandInput, type VerifyCommandInput } from '@worldcoin/minikit-js';

type SendTransactionParams = Parameters<
  typeof MiniKit.commandsAsync.sendTransaction
>[0];

type SendTransactionResult = ReturnType<
  typeof MiniKit.commandsAsync.sendTransaction
>;

type PayCommandParams = PayCommandInput;

type VerifyParams = VerifyCommandInput;
type NotifyParams = Parameters<typeof MiniKit.commandsAsync.notify>[0];

export const isWorldApp = () => MiniKit.isInstalled();

export const verify = (params: VerifyParams) =>
  MiniKit.commandsAsync.verify(params);

export const pay = (params: PayCommandParams) => MiniKit.commandsAsync.pay(params);

export const getPermissions = () => MiniKit.commandsAsync.getPermissions();

export const notify = (params: NotifyParams) => MiniKit.commandsAsync.notify(params);

export const getUserWalletByUsername = async (username: string) => {
  const user = await MiniKit.getUserByUsername(username);
  return user.walletAddress;
};

export const sendTransaction = (params: SendTransactionParams): SendTransactionResult =>
  MiniKit.commandsAsync.sendTransaction(params);
