import { ethers } from 'ethers'

import { EVM_NON_CONTRACT_ADDRESS_CODE, NETWORK_IDS, isEvmChain } from '@/constants'
import { getNetworkById } from '@/networks'

export const getDomainAddress = async (address: string) => {
  const rpc = getNetworkById(NETWORK_IDS.Ethereum).rpc_url
  const provider = new ethers.providers.JsonRpcProvider(rpc)
  return provider.lookupAddress(address)
}

export const detectNewTxFromAddress: (address: string, provider: ethers.providers.Web3Provider) => Promise<string> = (address, provider) => {
  return new Promise((resolve) => {
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

export const isEvmContract = async (chainId: number, address: string) => {
  if (!isEvmChain(chainId)) {
    throw new Error(`Non-EVM chainId ${chainId}`)
  }
  const { rpc_url: rpc } = getNetworkById(chainId)
  const provider = new ethers.providers.JsonRpcProvider(rpc)
  const addressCode = await provider.getCode(address)
  return addressCode !== EVM_NON_CONTRACT_ADDRESS_CODE
}
