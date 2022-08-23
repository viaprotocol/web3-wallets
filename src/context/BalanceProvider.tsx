import type { PropsWithChildren } from 'react'
import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { TUseBalanceOptions } from '../hooks/useBalance/types'
import { useCosmosBalance } from '../hooks/useBalance/useCosmosBalance'
import { useEVMBalance } from '../hooks/useBalance/useEVMBalance'
import { useSolanaBalance } from '../hooks/useBalance/useSolanaBalance'
import type { TCosmosWalletStore, TEvmWalletStore, TSolWalletStore, TWalletStoreState } from '@/types'
import { isEvmWallet, isSolWallet } from '@/utils/wallet'
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

const BALANCE_PROVIDER_BY_NAME = {
  MetaMask: EVMBalanceComponent,
  WalletConnect: EVMBalanceComponent,
  Coinbase: EVMBalanceComponent,
  xDefi: EVMBalanceComponent,
  Phantom: SolanaBalanceComponent,
  Near: null,
  Keplr: CosmosBalanceComponent
}

function BalanceProvider({
  options,
  setBalance
}: PropsWithChildren<{
  options: TUseBalanceOptions
  setBalance: TBalanceCallback
}>) {
  const { data: balanceUpdateDelay } = useQuery([UPDATE_DELAY_KEY]) ?? false
  const { name, address, isConnected, connection, provider } = options

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

    // Check solana connection is ready
    if (isSolWallet(options) && !connection) {
      return null
    }

    // Check evm provider is ready
    if (isEvmWallet(options) && !provider) {
      return null
    }

    return BALANCE_PROVIDER_BY_NAME[name]
  }, [name])

  if (!BalanceComponent || !address || !isConnected) {
    return null
  }

  return <BalanceComponent options={balanceParams} setBalance={setBalance} />
}

export { BalanceProvider }
