import type { TUseBalanceOptions } from './types'
import { useCosmosBalance } from './useCosmosBalance'
import { useEVMBalance } from './useEVMBalance'
import { useSolanaBalance } from './useSolanaBalance'

function EVMBalanceComponent(p: any) {
  const balance = useEVMBalance(p.options)
  return p.children(balance)
}

function CosmosBalanceComponent(p: any) {
  const balance = useCosmosBalance(p.options)
  return p.children(balance)
}

function SolanaBalanceComponent(p: any) {
  const balance = useSolanaBalance(p.options)
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
  children: (balance: string | null) => React.ReactNode
}) {
  const { options, children } = props
  const { name } = options

  if (!name) {
    return null
  }

  const BalanceComponent = BALANCE_PROVIDER_BY_NAME[name]

  if (!BalanceComponent) {
    return null
  }

  return <BalanceComponent options={options}>{children}</BalanceComponent>
}

export default PickBalanceProvider
