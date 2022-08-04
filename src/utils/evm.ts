import { ethers } from 'ethers'

import { NETWORK_IDS } from '../constants'
import { getNetworkById } from '../networks'

export const getDomainAddress = async (address: string) => {
  const rpc = getNetworkById(NETWORK_IDS.Ethereum).rpc_url
  const provider = new ethers.providers.JsonRpcProvider(rpc)
  return provider.lookupAddress(address)
}

export const detectNewTxFromAddress: (address: string, provider: ethers.providers.Web3Provider) => Promise<string> = (address, provider) => {
  return new Promise((resolve, reject) => {
    const filter = { address }
    const onFound = (event: any) => {
      if (event.transactionHash) {
        provider.off(filter, onFound)
        resolve(event.transactionHash)
      }
    }
    provider.on(filter, onFound)
  })
}
