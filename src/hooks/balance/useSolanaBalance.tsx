import { PublicKey } from '@solana/web3.js'

import { useQuery } from '@tanstack/react-query'
import type { TUseBalanceOptions } from './types'

const balanceFetcher = async (options: TUseBalanceOptions) => {
  const { connection, address } = options
  const balance = await connection!.getBalance(/* #__PURE__ */ new PublicKey(address!), 'confirmed')
  return String(balance)
}

function useSolanaBalance(options: TUseBalanceOptions) {
  const { address, updateDelay = 2 } = options

  const { data: balance } = useQuery(['solanaBalance', address], () => balanceFetcher(options), {
    retry: 2,
    refetchInterval: updateDelay * 1000,
    refetchOnWindowFocus: true
  })

  return balance
}

export { useSolanaBalance }
