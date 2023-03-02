import { ethers } from 'ethers'

import { ETHEREUM_PROVIDER, EVM_NON_CONTRACT_ADDRESS_CODE, isEvmChain } from '@/constants'
import { getNetworkById } from '@/networks'
import { queryClient } from '@/context/QueryProvider'

export const getDomainAddress = async (address: string) => {
  const cachedResult = queryClient.getQueryData<string | null>(['ensName', address])
  if (cachedResult) {
    return cachedResult
  }

  const result = await ETHEREUM_PROVIDER.lookupAddress(address)
  queryClient.setQueryData(['ensName', address], result)

  return result
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
  console.log('[isEvmContract]')
  return addressCode !== EVM_NON_CONTRACT_ADDRESS_CODE
}
