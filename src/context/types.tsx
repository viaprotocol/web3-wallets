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

type NativeCurrency = {
  name: string
  symbol: string
  decimals: number
}

type NetworkData = {
  chainId: string
  chainName: string
  nativeCurrency: NativeCurrency
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

type TChangeEvmNetworkOptions = {
  chainId: number
  network: NetworkData
}

export type { NativeCurrency, NetworkData, TChangeEvmNetworkOptions, TXDeFiWeb3Provider, TErc20SendTokenOptions }
