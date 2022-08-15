import { useMemo } from 'react'
import type { TUseBalanceOptions } from './types'
import { useCosmosBalance } from './useCosmosBalance'
import { useEVMBalance } from './useEVMBalance'
import { useSolanaBalance } from './useSolanaBalance'
import type { TWalletStoreState } from '@/types'

type TBalance = TWalletStoreState['balance']
type TBalanceCallback = (balance: TBalance) => TBalance

type TBalanceComponentProps = {
  options: TUseBalanceOptions
  children: TBalanceCallback
}

function EVMBalanceComponent(p: TBalanceComponentProps) {
  const balance = useEVMBalance(p.options) ?? null
  return p.children(balance)
}

function CosmosBalanceComponent(p: TBalanceComponentProps) {
  const balance = useCosmosBalance(p.options) ?? null
  return p.children(balance)
}

function SolanaBalanceComponent(p: TBalanceComponentProps) {
  const balance = useSolanaBalance(p.options) ?? null
  return p.children(balance)
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

function PickBalanceProvider(props: {
  options: TUseBalanceOptions
  children: (balance: TBalance) => TBalance
}) {
  const { options, children } = props
  const { name } = options

  const BalanceComponent = useMemo(() => {
    if (!name) {
      return null
    }
    return BALANCE_PROVIDER_BY_NAME[name]
  }, [name])

  if (!BalanceComponent) {
    return null
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return <BalanceComponent options={options}>{children}</BalanceComponent>
}

export { PickBalanceProvider }
