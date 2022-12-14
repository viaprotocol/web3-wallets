import type { Web3Provider } from '@ethersproject/providers'
import { BigNumber } from 'ethers/lib/ethers'
import { hexZeroPad } from 'ethers/lib/utils'
import { EIP712Domains, NONCES_FN, SUPPORTED_TOKENS } from './constants'
import { call } from './rpc'
import type { TDaiPermitMessage, TDomain, TERC2612PermitMessage, TPermitToken, TPermitTypes } from './types'
import { NETWORK_IDS } from '@/constants'

const addZeros = (numZeros: number) => ''.padEnd(numZeros, '0')

const getDomain = (permitToken: TPermitToken): TDomain => {
  const { address, chainId, name, version } = permitToken
  const domain: TDomain = {
    name,
    version: version || '1',
    verifyingContract: address
  }

  if (chainId === NETWORK_IDS.Ethereum) {
    domain.chainId = chainId
  } else {
    domain.salt = hexZeroPad(BigNumber.from(chainId).toHexString(), 32)
  }

  return domain
}

const createTypedDaiData = (message: TDaiPermitMessage, domain: TDomain, chainId: number) => {
  if (!Object.keys(EIP712Domains).includes(chainId.toString())) {
    throw new Error('ChainId not supported')
  }

  const typedData = {
    types: {
      // @ts-expect-error – Check type above
      EIP712Domain: EIP712Domains[chainId]!,
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

const createTypedERC2612Data = (message: TERC2612PermitMessage, domain: TDomain, chainId: number) => {
  if (!Object.keys(EIP712Domains).includes(chainId.toString())) {
    throw new Error('ChainId not supported')
  }

  const typedData = {
    types: {
      // @ts-expect-error – Check type above
      EIP712Domain: EIP712Domains[chainId]!,
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

const isTokenExists = (tokens: TPermitToken[], token: TPermitToken) => {
  return tokens.find(t => t.address.toLowerCase() === token.address.toLowerCase() && t.chainId === token.chainId)
}

const getPermitNonce = async (provider: Web3Provider, token: TPermitToken): Promise<number> => {
  const owner = await provider.getSigner().getAddress()
  const { address, noncesFn = NONCES_FN } = token

  return call(provider, address, `${noncesFn}${addZeros(24)}${owner.slice(2)}`)
}

const getTokenKey = (token: TPermitToken) => {
  const entry = Object.entries(SUPPORTED_TOKENS).find(([_, tokens]) => isTokenExists(tokens, token))
  if (!entry) {
    throw new Error('Token not supported')
  }

  return entry[0] as TPermitTypes
}

export { addZeros, isTokenExists, getDomain, createTypedDaiData, createTypedERC2612Data, getPermitNonce, getTokenKey }
