import { BalanceEVM } from './BalanceEVM'
import { BalanceSolana } from './BalanceSolana'
import { BalanceCosmos } from './BalanceCosmos'
import { BalanceXDeFi } from './BalanceXDeFi'
import type { TBalanceProviderMetadata } from './types'
import type { TAvailableWalletNames, TWalletStore } from '@/types'

const evmValidator = ({ provider }: TWalletStore) => Boolean(provider)

const BALANCE_PROVIDER_BY_NAME: Record<TAvailableWalletNames, TBalanceProviderMetadata | null> = {
  // 🚧 TODO: Refactor using lazy loading
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
    component: BalanceXDeFi,
    validatePropsFunc: evmValidator
  },
  Safe: {
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
