import { useCallback, useEffect, useMemo, useState } from 'react'
import { StargateClient } from '@cosmjs/stargate'
import type { TUseBalanceOptions } from './types'
import { isCosmosWallet } from '@/utils/wallet'

const SECONDS_BEFORE_NEXT_UPDATE = 10

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
    let intervalId: null | NodeJS.Timer = null

    if (isCosmos) {
      checkCosmosBalance()

      // Infinity balance loading
      intervalId = setInterval(checkCosmosBalance, SECONDS_BEFORE_NEXT_UPDATE * 1000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isCosmos, checkCosmosBalance])

  return balance
}

export { useCosmosBalance }
