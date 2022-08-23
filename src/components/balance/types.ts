import type { PropsWithChildren } from 'react'
import type { TUseBalanceOptions } from '../../hooks/balance/types'
import type { TWalletStoreState } from '@/types'

type TBalance = TWalletStoreState['balance']
type TBalanceCallback = (balance: TBalance) => void

type TBalanceComponentProps = {
  options: TUseBalanceOptions
  setBalance: TBalanceCallback
} & PropsWithChildren

type TBalanceProviderMetadata = {
  component: (props: TBalanceComponentProps) => null
  validatePropsFunc: (options: TWalletStoreState) => boolean
}

export type { TBalance, TBalanceCallback, TBalanceComponentProps, TBalanceProviderMetadata }
