import { ethers } from 'ethers'
import { getNetworkById } from '@/web3-wallets/networks'

export const getDomainAddress = async (address: string) => {
  const rpc = getNetworkById(1).rpc_url
  const provider = new ethers.providers.JsonRpcProvider(rpc)
  return provider.lookupAddress(address)
}
