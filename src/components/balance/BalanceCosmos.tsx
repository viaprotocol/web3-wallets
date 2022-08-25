import { useEffect } from 'react'
import { useCosmosBalance } from '../../hooks/balance/useCosmosBalance'
import type { TBalanceComponentProps } from './types'
import type { TCosmosWalletStore } from '@/types'

function BalanceCosmos({
  options,
  setBalance
}: TBalanceComponentProps) {
  const balance = useCosmosBalance(options as TCosmosWalletStore) ?? null

  useEffect(() => {
    setBalance(balance)
  }, [balance])

  return null
}

export { BalanceCosmos }
