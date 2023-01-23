import type { Web3Provider } from '@ethersproject/providers'
import type { AllowanceData } from '@uniswap/permit2-sdk'
import { AllowanceProvider, PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'
import { BigNumber } from 'ethers/lib/ethers'
import { hexZeroPad } from 'ethers/lib/utils'
import { DaiPermitMessage, EIP712Permit2Domain, EIP712PermitDomains, NONCES_FN, PermitMessage, PermitSingleDetails, PermitSingleMessage, SUPPORTED_TOKENS } from './constants'
import { call } from './rpc'
import type { TDaiPermitMessage, TPermit2Domain, TPermitDomain, TPermitMessage, TPermitSingleMessage, TPermitToken, TPermitTypes } from './types'
import { NETWORK_IDS } from '@/constants'

const addZeros = (numZeros: number) => ''.padEnd(numZeros, '0')

const getPermitDomain = async (permitToken: TPermitToken): Promise<TPermitDomain> => {
  const { address, chainId, name, version } = permitToken

  const domain: TPermitDomain = {
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

const getPermit2Domain = async (permitToken: TPermitToken): Promise<TPermit2Domain> => {
  const { address, chainId, name } = permitToken
  const domain: TPermit2Domain = { name, chainId, verifyingContract: address }
  return domain
}

const createTypedDaiData = (message: TDaiPermitMessage, domain: TPermitDomain, chainId: number) => {
  if (!Object.keys(EIP712PermitDomains).includes(chainId.toString())) {
    throw new Error('ChainId not supported')
  }

  const typedData = {
    types: {
      // @ts-expect-error – Check type above
      EIP712Domain: EIP712PermitDomains[chainId]!,
      Permit: DaiPermitMessage
    },
    primaryType: 'Permit',
    domain,
    message
  }

  return typedData
}

const createTypedPermitData = (message: TPermitMessage, domain: TPermitDomain, chainId: number) => {
  if (!Object.keys(EIP712PermitDomains).includes(chainId.toString())) {
    throw new Error('ChainId not supported')
  }

  const typedData = {
    types: {
      // @ts-expect-error – Check type above
      EIP712Domain: EIP712PermitDomains[chainId]!,
      Permit: PermitMessage
    },
    primaryType: 'Permit',
    domain,
    message
  }

  return typedData
}

const createTypedPermitSingleData = (message: TPermitSingleMessage, domain: TPermit2Domain) => {
  const typedData = {
    types: {
      EIP712Domain: EIP712Permit2Domain,
      PermitSingle: PermitSingleMessage,
      PermitDetails: PermitSingleDetails
    },
    primaryType: 'Permit2',
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

const getPermit2Nonce = async (provider: Web3Provider, owner: string, token: string, spender: string): Promise<number> => {
  const allowanceProvider = new AllowanceProvider(provider, PERMIT2_ADDRESS)
  const allowance: AllowanceData = await allowanceProvider?.getAllowanceData(token, owner, spender)
  return allowance?.nonce
}

const getTokenKey = (token: TPermitToken) => {
  const entry = Object.entries(SUPPORTED_TOKENS).find(([_, tokens]) => isTokenExists(tokens, token))
  if (!entry) {
    throw new Error('Token not supported')
  }

  return entry[0] as TPermitTypes
}

export { addZeros, getPermitDomain, getPermit2Domain, createTypedDaiData, createTypedPermitData, createTypedPermitSingleData, getPermit2Nonce, isTokenExists, getPermitNonce, getTokenKey }
