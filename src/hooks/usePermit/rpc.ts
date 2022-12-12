import type { Web3Provider } from '@ethersproject/providers'
import { splitSignature } from 'ethers/lib/utils'
import type { TRSVResponse } from './types'

const call = (provider: Web3Provider, to: string, data: string) => provider.send('eth_call', [{
  to,
  data
}, 'latest'])

const signData = async (provider: Web3Provider, fromAddress: string, typeData: any): Promise<TRSVResponse> => {
  const signer = provider.getSigner()
  const signerAddress = await signer.getAddress()
  if (signerAddress.toLowerCase() !== fromAddress.toLowerCase()) {
    throw new Error('Signer address does not match requested signing address')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { EIP712Domain: _unused, ...types } = typeData.types
  const rawSignature = await signer._signTypedData(typeData.domain, types, typeData.message)

  return splitSignature(rawSignature)
}

export { call, signData }
