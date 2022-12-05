import utf8 from 'utf8'
import { EIP712Domain, NAME_FN } from './constants'
import { call } from './rpc'
import type { TDaiPermitMessage, TDomain, TERC2612PermitMessage, TRSVResponse } from './types'

const hexToUtf8 = (hex: string) => {
  const str = hex.replace(/^0x/, '')
  const bytes = []
  for (let i = 0; i < str.length; i += 2) {
    bytes.push(parseInt(str.substring(i, i + 2), 16))
  }
  return utf8.decode(String.fromCharCode(...bytes))
}

const splitSignatureToRSV = (signature: string): TRSVResponse => {
  const r = `0x${signature.substring(2).substring(0, 64)}`
  const s = `0x${signature.substring(2).substring(64, 128)}`
  const v = parseInt(signature.substring(2).substring(128, 130), 16)
  return { r, s, v }
}

const addZeros = (numZeros: number) => ''.padEnd(numZeros, '0')

const getTokenName = async (provider: any, address: string) =>
  hexToUtf8((await call(provider, address, NAME_FN)).substr(130))

const getDomain = async (provider: any, token: string, chainId: number): Promise<TDomain> => {
  const tokenAddress = token as string

  const name = await getTokenName(provider, tokenAddress)

  const domain: TDomain = { name, version: '1', chainId, verifyingContract: tokenAddress }
  return domain
}

const createTypedDaiData = (message: TDaiPermitMessage, domain: TDomain) => {
  const typedData = {
    types: {
      EIP712Domain,
      Permit: [
        { name: 'holder', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
        { name: 'allowed', type: 'bool' }
      ]
    },
    primaryType: 'Permit',
    domain,
    message
  }

  return typedData
}

const createTypedERC2612Data = (message: TERC2612PermitMessage, domain: TDomain) => {
  const typedData = {
    types: {
      EIP712Domain,
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    },
    primaryType: 'Permit',
    domain,
    message
  }

  return typedData
}

export { addZeros, splitSignatureToRSV, getTokenName, getDomain, createTypedDaiData, createTypedERC2612Data }
