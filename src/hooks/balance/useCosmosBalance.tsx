import { useCallback, useEffect, useState } from 'react'
import { StargateClient } from '@cosmjs/stargate'
import { useQuery } from '@tanstack/react-query'
import type { TUseBalanceOptions } from './types'
import { getNetworkById, rpcMapping } from '@/networks'
import type { TCosmosWalletStore } from '@/types'

const balanceFetcher = (options: TCosmosWalletStore, network: ReturnType<typeof getNetworkById>, client: StargateClient) => {
  const { address } = options

  if (!client || !network) {
    return
  }

  return client.getBalance(address!, network.currency_name)
}

function useCosmosBalance(options: TCosmosWalletStore & Pick<TUseBalanceOptions, 'updateDelay'>) {
  const { chainId, updateDelay = 10, address } = options

  const [client, setClient] = useState<StargateClient | null>(null)

  const { data } = useQuery(
    ['cosmosBalance', address, chainId],
    () => balanceFetcher(options, getNetworkById(chainId!), client as StargateClient),
    {
      enabled: Boolean(client),
      retry: 2,
      refetchInterval: updateDelay * 1000,
      refetchOnWindowFocus: true
    }
  )

  const balance = data?.amount ?? null

  const setClientInstance = useCallback(async (rpcAddress: string) => {
    const newClient = await StargateClient.connect(rpcAddress)

    setClient(newClient)
  }, [setClient])

  useEffect(() => {
    if (chainId) {
      setClientInstance(rpcMapping[chainId]!)
    }
  }, [chainId, setClientInstance])

  return balance
}

export { useCosmosBalance }
