import { useMemo } from 'react'

import type { TUseBalanceOptions } from './types'
import { useCosmosBalance } from './useCosmosBalance'
import { useEVMBalance } from './useEVMBalance'
import { useSolanaBalance } from './useSolanaBalance'

function useBalance(options: TUseBalanceOptions) {
  const { name } = options

  const evmBalance = useEVMBalance(options)
  const solBalance = useSolanaBalance(options)
  const cosmosBalance = useCosmosBalance(options)

  const balance = useMemo(() => {
    if (!name) {
      return null
    }

    return {
      Phantom: solBalance,
      WalletConnect: evmBalance,
      MetaMask: evmBalance,
      Coinbase: evmBalance,
      Near: null,
      Keplr: cosmosBalance
    }[name]
  }, [name, solBalance, evmBalance, cosmosBalance])

  return balance
}

export { useBalance }
