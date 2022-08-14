import { useCallback, useEffect, useState } from 'react'
import { StargateClient } from '@cosmjs/stargate'
import { useQuery } from '@tanstack/react-query'
import { useTabActive } from '../useTabActive/useTabActive'
import type { TUseBalanceOptions } from './types'
import { isCosmosWallet } from '@/utils/wallet'
import { getNetworkById, rpcMapping } from '@/networks'

const balanceFetcher = (options: TUseBalanceOptions, network: ReturnType<typeof getNetworkById>, client: StargateClient) => {
  const { address } = options

  if (!isCosmosWallet(options) || !address || !client || !network) {
    return
  }

  return client.getBalance(address, network.currency_name)
}

function useCosmosBalance(options: TUseBalanceOptions) {
  const { chainId, updateDelay = 10, address } = options
  const isCosmos = isCosmosWallet(options)

  const [balance, setBalance] = useState<string | null>(null)
  const [client, setClient] = useState<StargateClient | null>(null)
  const isTabActive = useTabActive()

  const { data } = useQuery(
    ['cosmosBalance', chainId, client],
    () => balanceFetcher(options, getNetworkById(chainId!), client!),
    {
      initialData: null,
      enabled: Boolean(isCosmos && client && address) && isTabActive,
      retry: 2,
      refetchInterval: updateDelay * 1000,
      refetchOnWindowFocus: true
    }
  )

  useEffect(() => {
    if (data) {
      setBalance(data.amount)
    }
  }, [data])

  const setClientInstance = useCallback(async (rpcAddress: string) => {
    const newClient = await StargateClient.connect(rpcAddress)

    setClient(newClient)
  }, [setClient])

  useEffect(() => {
    if (chainId) {
      setClientInstance(rpcMapping[chainId])
    }
  }, [chainId, setClientInstance])

  return balance
}

export { useCosmosBalance }
