import { PublicKey } from '@solana/web3.js'

import { useQuery } from '@tanstack/react-query'
import { useTabActive } from '../useTabActive/useTabActive'
import type { TUseBalanceOptions } from './types'
import { isSolWallet } from '@/utils/wallet'

const balanceFetcher = (options: TUseBalanceOptions) => {
  const { connection, address } = options

  return connection!.getBalance(new PublicKey(address!), 'confirmed').then(String)
}

function useSolanaBalance(options: TUseBalanceOptions) {
  const { address, isConnected, connection, updateDelay = 2 } = options

  const isSubscriptionIsAvailable = isSolWallet(options) && address && isConnected && connection
  const isTabActive = useTabActive()

  const { data: balance } = useQuery(['solanaBalance', address, updateDelay], () => balanceFetcher(options), {
    initialData: null,
    enabled: Boolean(isSubscriptionIsAvailable) && isTabActive,
    retry: 2,
    refetchInterval: updateDelay * 1000,
    refetchOnWindowFocus: true
  })

  return balance
}

export { useSolanaBalance }
