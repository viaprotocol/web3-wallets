import { BalanceEVM } from './BalanceEVM'
import { BalanceSolana } from './BalanceSolana'
import { BalanceCosmos } from './BalanceCosmos'
import type { TBalanceProviderMetadata } from './types'
import type { TAvailableWalletNameValues, TWalletStoreState } from '@/types'

const evmValidator = ({ provider }: TWalletStoreState) => Boolean(provider)

const BALANCE_PROVIDER_BY_NAME: Record<TAvailableWalletNameValues, TBalanceProviderMetadata | null> = {
  MetaMask: {
    component: BalanceEVM,
    validatePropsFunc: evmValidator
  },
  WalletConnect: {
    component: BalanceEVM,
    validatePropsFunc: evmValidator
  },
  Coinbase: {
    component: BalanceEVM,
    validatePropsFunc: evmValidator
  },
  xDefi: {
    component: BalanceEVM,
    validatePropsFunc: evmValidator
  },
  Phantom: {
    component: BalanceSolana,
    validatePropsFunc: ({ connection }) => Boolean(connection)
  },
  Near: null,
  Keplr: {
    component: BalanceCosmos,
    validatePropsFunc: () => true
  }
}

export { BALANCE_PROVIDER_BY_NAME }
