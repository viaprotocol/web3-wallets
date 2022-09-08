import type { XDeFiProvider } from './xDeFiProvider'

const XDefiAvailableProviders = ['BTC', 'ETH', 'BCH', 'LTC'] as const

type TXDeFiAvailableProviders = typeof XDefiAvailableProviders[number]

type TProviderType = {
  [key in TXDeFiAvailableProviders]: XDeFiProvider
}

export { XDefiAvailableProviders }
export type { TXDeFiAvailableProviders, TProviderType }
