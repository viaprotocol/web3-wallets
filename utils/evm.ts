import { ethers } from 'ethers'

import { getNetworkById } from '../networks'
import { NETWORK_IDS } from '../constants'

export const getDomainAddress = async (address: string) => {
  const rpc = getNetworkById(NETWORK_IDS.Ethereum).rpc_url
  const provider = new ethers.providers.JsonRpcProvider(rpc)
  return provider.lookupAddress(address)
}
