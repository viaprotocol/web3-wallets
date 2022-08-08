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
  const [client, setClient] = useState<StargateClient | null>(null)

  const setClientInstance = useCallback(async (rpcAddress: string) => {
    const newClient = await StargateClient.connect(rpcAddress)

    setClient(newClient)
  }, [setClient])

  useEffect(() => {
    if (chainId) {
      setClientInstance(rpcMapping[chainId])
    }
  }, [chainId, setClientInstance])

  const checkCosmosBalance = useCallback(async () => {
    if (!chainId || !options.address || !client) {
      return
    }

    const network = getNetworkById(chainId)

    const { amount } = await client.getBalance(options.address, network.currency_name)

    setBalance(amount)
  }, [client, options.address, chainId])

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
