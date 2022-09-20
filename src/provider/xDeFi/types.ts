import type { XDeFiProvider } from './xDeFiProvider'

const XDefiAvailableProviders = ['BTC', 'ETH', 'BCH', 'LTC'] as const

type TXDeFiAvailableProviders = typeof XDefiAvailableProviders[number]

type TProviderType = {
  [key in TXDeFiAvailableProviders]: XDeFiProvider
}

type BTClikeAsset = {
  blockchain: string
  symbol: string
  address: null
  ticker: string
}

type BTClikeTransaction = {
  type: 'TRANSFER'
  amount: string
  decimals: number
  asset: BTClikeAsset
  fromWalletAddress: string
  memo: string
  method: 'transfer'
  recipientAddress: string
}

export { XDefiAvailableProviders }
export type { TXDeFiAvailableProviders, TProviderType, BTClikeTransaction, BTClikeAsset }
