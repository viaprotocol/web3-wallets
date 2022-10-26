type TXDeFiWeb3Provider = {
  ethereum: any
  binance: any
  bitcoin: any
  bitcoincash: any
  litecoin: any
  dogecoin: any
  terra: any
}

type TErc20SendTokenOptions = {
  chainId: number
  contractAddress: string
  amount: string
  decimals: number
  toAddress: string
}

export type { TXDeFiWeb3Provider, TErc20SendTokenOptions }
