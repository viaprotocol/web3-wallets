import type { PropsWithChildren } from 'react'
import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { TUseBalanceOptions } from '../hooks/useBalance/types'
import { useCosmosBalance } from '../hooks/useBalance/useCosmosBalance'
import { useEVMBalance } from '../hooks/useBalance/useEVMBalance'
import { useSolanaBalance } from '../hooks/useBalance/useSolanaBalance'
import type { TAvailableWalletNameValues, TCosmosWalletStore, TEvmWalletStore, TSolWalletStore, TWalletStoreState } from '@/types'
import { UPDATE_DELAY_KEY } from '@/hooks/useBalance/config'

type TBalance = TWalletStoreState['balance']
type TBalanceCallback = (balance: TBalance) => void

type TBalanceComponentProps = {
  options: TUseBalanceOptions
  setBalance: TBalanceCallback
} & PropsWithChildren

function EVMBalanceComponent({
  options,
  setBalance
}: TBalanceComponentProps) {
  const balance = useEVMBalance(options as TEvmWalletStore) ?? null

  useEffect(() => {
    setBalance(balance)
  }, [balance])

  return null
}

function CosmosBalanceComponent({
  options,
  setBalance
}: TBalanceComponentProps) {
  const balance = useCosmosBalance(options as TCosmosWalletStore) ?? null

  useEffect(() => {
    setBalance(balance)
  }, [balance])

  return null
}

function SolanaBalanceComponent({
  options,
  setBalance
}: TBalanceComponentProps) {
  const balance = useSolanaBalance(options as TSolWalletStore) ?? null

  useEffect(() => {
    setBalance(balance)
  }, [balance])

  return null
}

type TBalanceProviderWithValidator = {
  component: (props: TBalanceComponentProps) => null
  validatePropsFunc: (options: TWalletStoreState) => boolean
} | null

const evmValidator = ({ provider }: TWalletStoreState) => Boolean(provider)

const BALANCE_PROVIDER_BY_NAME: Record<TAvailableWalletNameValues, TBalanceProviderWithValidator> = {
  MetaMask: {
    component: EVMBalanceComponent,
    validatePropsFunc: evmValidator
  },
  WalletConnect: {
    component: EVMBalanceComponent,
    validatePropsFunc: evmValidator
  },
  Coinbase: {
    component: EVMBalanceComponent,
    validatePropsFunc: evmValidator
  },
  xDefi: {
    component: EVMBalanceComponent,
    validatePropsFunc: evmValidator
  },
  Phantom: {
    component: SolanaBalanceComponent,
    validatePropsFunc: ({ connection }) => Boolean(connection)
  },
  Near: null,
  Keplr: {
    component: CosmosBalanceComponent,
    validatePropsFunc: () => true
  }
}

function BalanceProvider({
  options,
  setBalance
}: PropsWithChildren<{
  options: TUseBalanceOptions
  setBalance: TBalanceCallback
}>) {
  const { data: balanceUpdateDelay } = useQuery([UPDATE_DELAY_KEY]) ?? false
  const { name, address, isConnected } = options

  const balanceParams = useMemo(() => {
    return {
      ...options,
      updateDelay: balanceUpdateDelay as number
    }
  }, [options, balanceUpdateDelay])

  const BalanceComponent = useMemo(() => {
    if (!name) {
      return null
    }

    const balanceProviderWithValidator = BALANCE_PROVIDER_BY_NAME[name]

    if (!balanceProviderWithValidator) {
      return null
    }

    const { component, validatePropsFunc } = balanceProviderWithValidator

    if (!validatePropsFunc(options)) {
      return null
    }

    return component
  }, [name])

  if (!BalanceComponent || !address || !isConnected) {
    return null
  }

  return <BalanceComponent options={balanceParams} setBalance={setBalance} />
}

export { BalanceProvider }
