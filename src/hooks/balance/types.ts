import type { TWalletStore } from '../../types'

type TBalanceProviderOptions = {
  updateDelay?: number
} & TWalletStore

type TUseBalanceOptions = {
  updateDelay?: number
} & Pick<TWalletStore, 'provider' | 'address' | 'chainId' | 'connection'>

export type { TUseBalanceOptions, TBalanceProviderOptions }
