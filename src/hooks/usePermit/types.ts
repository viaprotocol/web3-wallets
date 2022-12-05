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

export type { TDaiPermitMessage, TERC2612PermitMessage, TDomain }
