import type { PropsWithChildren } from 'react'
import type { TUseBalanceOptions } from '../../hooks/balance/types'
import type { TWalletStore } from '@/types'

type TBalance = TWalletStore['balance']
type TBalanceCallback = (balance: TBalance) => void

type TBalanceComponentProps = {
  options: TUseBalanceOptions
  setBalance: TBalanceCallback
} & PropsWithChildren

type TBalanceProviderMetadata = {
  component: (props: TBalanceComponentProps) => null
  validatePropsFunc: (options: TWalletStore) => boolean
}

export type { TBalance, TBalanceCallback, TBalanceComponentProps, TBalanceProviderMetadata }
