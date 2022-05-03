import { Web3Provider } from '@ethersproject/providers'

export const getDomainAddress = async (address: string, provider?: Web3Provider) => {
  if (provider) {
    return provider.lookupAddress(address)
  }
  return null
}
