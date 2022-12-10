import type { Web3Provider } from '@ethersproject/providers'

type TDaiPermitMessage = {
  holder: string
  spender: string
  nonce: number
  expiry: number | string
  allowed?: boolean
}

type TPermitMessage = {
  owner: string
  spender: string
  value: number | string
  nonce: number | string
  deadline: number | string
}

type TPermitSingleMessage = {
  details: TPermitSingleDetails
  spender: string
  sigDeadline: number | string
}

type TPermitSingleDetails = {
  token: string
  amount: number | string
  expiration: number | string
  nonce: number | string
}

type TPermitDomain = {
  name: string
  version: string
  chainId?: number
  salt?: string
  verifyingContract: string
}

type TPermit2Domain = {
  name: string
  chainId: number
  verifyingContract: string
}

type TRSVResponse = {
  r: string
  s: string
  v: number
}

type TUsePermitOptions = {
  provider: Web3Provider
  token: string
  spender: string
  owner: string
  chainId: number
  deadline?: number
}

const PERMIT_TYPES = ['ERC2612', 'DAI'] as const

type TPermitTypes = typeof PERMIT_TYPES[number]

type TPermitToken = {
  address: string
  chainId: number
  name: string
  version?: string
  noncesFn?: string
  permitType?: TPermitTypes
}

type TPermitTokens = {
  [key in TPermitTypes]: TPermitToken[]
}

export type { TDaiPermitMessage, TPermitToken, TPermitMessage, TPermitSingleMessage, TPermitSingleDetails, TPermitDomain, TPermit2Domain, TRSVResponse, TUsePermitOptions, TPermitTypes, TPermitTokens }
