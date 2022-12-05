import type { Web3Provider } from '@ethersproject/providers'
import type { TRSVResponse } from './types'
import { splitSignatureToRSV } from './utils'

const send = (provider: Web3Provider, method: string, params: any[]) => new Promise<any>((resolve, reject) => {
  const _provider = provider

  _provider
    .send(method, params)
    .then((r: any) => resolve(r))
    .catch((e: any) => reject(e))
})

const call = (provider: any, to: string, data: string) => send(provider, 'eth_call', [{
  to,
  data
}, 'latest'])

const signData = async (provider: Web3Provider, fromAddress: string, typeData: any): Promise<TRSVResponse> => {
  const signer = provider.getSigner()
  const signerAddress = await signer.getAddress()
  if (signerAddress.toLowerCase() !== fromAddress.toLowerCase()) {
    throw new Error('Signer address does not match requested signing address')
  }

  const { ...types } = typeData.types
  const rawSignature = await signer._signTypedData(typeData.domain, types, typeData.message)

  return splitSignatureToRSV(rawSignature)
}

export { send, call, signData }
