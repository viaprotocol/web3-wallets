import { useCallback, useEffect, useMemo, useState } from 'react'
import { StargateClient } from '@cosmjs/stargate'
import type { TUseBalanceOptions } from './types'
import { isCosmosWallet } from '@/utils/wallet'

function useCosmosBalance(options: TUseBalanceOptions) {
  const isCosmos = isCosmosWallet(options)

  const [balance, setBalance] = useState<string | null>(null)

  const clientPromise = useMemo(async () => await StargateClient.connect('https://rpc-osmosis.blockapsis.com/'), [])

  const checkCosmosBalance = useCallback(async () => {
    if (options.address) {
      const client = await clientPromise

      const { amount } = await client.getBalance(options.address, 'uosmo')

      setBalance(amount)
    }
  }, [clientPromise, options.address])

  useEffect(() => {
    if (isCosmos) {
      checkCosmosBalance()
    }
  }, [isCosmos, checkCosmosBalance])

  return balance
}

export { useCosmosBalance }
