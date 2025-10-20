import WorldFansData from '@/abi/WorldFansData.json';
import WorldFansPay from '@/abi/WorldFansPay.json';
import WorldFansToken from '@/abi/WorldFansToken.json';
import WorldFansTreasury from '@/abi/WorldFansTreasury.json';

export const addresses = {
  token: process.env.NEXT_PUBLIC_WLDY_ADDRESS!,
  pay: process.env.NEXT_PUBLIC_PAY_ADDRESS!,
  treasury: process.env.NEXT_PUBLIC_TREASURY_ADDRESS!,
  data: process.env.NEXT_PUBLIC_DATA_ADDRESS,
} as const;

export const abis = {
  token: WorldFansToken.abi,
  pay: WorldFansPay.abi,
  treasury: WorldFansTreasury.abi,
  data: WorldFansData.abi,
};
