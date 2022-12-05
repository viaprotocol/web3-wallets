import type { Web3Provider } from '@ethersproject/providers'

type TDaiPermitMessage = {
  holder: string
  spender: string
  nonce: number
  expiry: number | string
  allowed?: boolean
}

type TERC2612PermitMessage = {
  owner: string
  spender: string
  value: number | string
  nonce: number | string
  deadline: number | string
}

type TDomain = {
  name: string
  version: string
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

type TPermitToken = {
  address: string
  chainId: number
  noncesFn?: string
}

export type { TDaiPermitMessage, TPermitToken, TERC2612PermitMessage, TDomain, TRSVResponse, TUsePermitOptions }
