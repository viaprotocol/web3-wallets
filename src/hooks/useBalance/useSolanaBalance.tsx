import { PublicKey } from '@solana/web3.js'

import { useQuery } from '@tanstack/react-query'
import type { TUseBalanceOptions } from './types'

const balanceFetcher = async (options: TUseBalanceOptions) => {
  const { connection, address } = options
  const balance = await connection!.getBalance(new PublicKey(address!), 'confirmed')
  return String(balance)
}

function useSolanaBalance(options: TUseBalanceOptions) {
  const { address, isConnected, connection, updateDelay = 2 } = options

  const isSubscriptionIsAvailable = Boolean(address && isConnected && connection)

  const { data: balance } = useQuery(['solanaBalance', address], () => balanceFetcher(options), {
    enabled: isSubscriptionIsAvailable,
    retry: 2,
    refetchInterval: updateDelay * 1000,
    refetchOnWindowFocus: true
  })

  return balance
}

export { useSolanaBalance }
