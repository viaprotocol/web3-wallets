import { useEffect } from 'react'
import type { Web3Provider } from '@coinbase/wallet-sdk/dist/provider/Web3Provider'
import { useEVMBalance } from '../../hooks/balance/useEVMBalance'
import type { TBalanceComponentProps } from './types'
import type { TBTCWalletStore } from '@/types'

function BalanceXDeFi({
  options,
  setBalance
}: TBalanceComponentProps) {
  const { provider } = options as TBTCWalletStore
  const evmProvider = provider.getProviderByKey('ETH').getProvider()! as Web3Provider
  const balance = useEVMBalance({
    ...options,
    provider: evmProvider
  } as any) ?? null

  useEffect(() => {
    setBalance(balance)
  }, [balance])

  return null
}

export { BalanceXDeFi }
