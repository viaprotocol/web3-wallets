import { useEffect } from 'react'
import { useSolanaBalance } from '../../hooks/balance/useSolanaBalance'
import type { TBalanceComponentProps } from './types'
import type { TSolWalletStore } from '@/types'

function BalanceSolana({
  options,
  setBalance
}: TBalanceComponentProps) {
  const balance = useSolanaBalance(options as TSolWalletStore) ?? null

  useEffect(() => {
    setBalance(balance)
  }, [balance])

  return null
}

export { BalanceSolana }
