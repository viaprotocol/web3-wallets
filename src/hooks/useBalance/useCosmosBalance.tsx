import { useCallback, useEffect, useMemo, useState } from 'react'
import { StargateClient } from '@cosmjs/stargate'
import type { TUseBalanceOptions } from './types'
import { isCosmosWallet } from '@/utils/wallet'
import { getNetworkById, rpcMapping } from '@/networks'

const SECONDS_BEFORE_NEXT_UPDATE = 10

function useCosmosBalance(options: TUseBalanceOptions) {
  const { chainId } = options
  const isCosmos = isCosmosWallet(options)

  const [balance, setBalance] = useState<string | null>(null)

  const network = useMemo(() => chainId ? getNetworkById(chainId) : null, [chainId])
  const rpcAddress = useMemo(() => chainId ? rpcMapping[chainId] : '', [chainId])
  const clientPromise = useMemo(async () => await StargateClient.connect(rpcAddress), [rpcAddress])

  const checkCosmosBalance = useCallback(async () => {
    if (options.address && network) {
      const client = await clientPromise

      const { amount } = await client.getBalance(options.address, network.currency_name)

      setBalance(amount)
    }
  }, [clientPromise, options.address, network])

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
