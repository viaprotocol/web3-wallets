import { useMemo } from 'react'

import { IUseBalanceOptions } from './types'
import { useEVMBalance } from './useEVMBalance'
import { useSolanaBalance } from './useSolanaBalance'

function useBalance(options: IUseBalanceOptions) {
  const { name } = options

  const evmBalance = useEVMBalance(options)
  const solBalance = useSolanaBalance(options)

  const balance = useMemo(() => {
    if (!name) {
      return null
    }

    return {
      Phantom: solBalance,
      WalletConnect: evmBalance,
      MetaMask: evmBalance,
      Near: null,
    }[name]
  }, [name, solBalance, evmBalance])

  return balance
}

export { useBalance }
