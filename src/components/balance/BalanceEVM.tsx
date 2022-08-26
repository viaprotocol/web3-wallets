import { useEffect } from 'react'
import { useEVMBalance } from '../../hooks/balance/useEVMBalance'
import type { TBalanceComponentProps } from './types'
import type { TEvmWalletStore } from '@/types'

function BalanceEVM({
  options,
  setBalance
}: TBalanceComponentProps) {
  const balance = useEVMBalance(options as TEvmWalletStore) ?? null

  useEffect(() => {
    setBalance(balance)
  }, [balance])

  return null
}

export { BalanceEVM }
