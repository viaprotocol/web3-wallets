import { useCallback, useEffect } from 'react'
import type { Web3Provider } from '@ethersproject/providers'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTabActive } from '../useTabActive/useTabActive'
import type { TUseBalanceOptions } from './types'
import { isEvmWallet } from '@/utils/wallet'

const balanceFetcher = (options: TUseBalanceOptions) => {
  const { isConnected, provider, address } = options
  const isReadyForRequest = isEvmWallet(options) && address && isConnected && provider

  if (!isReadyForRequest) {
    return
  }

  return (provider as Web3Provider).getBalance(address).then(String)
}

function useEVMBalance(options: TUseBalanceOptions) {
  const { isConnected, provider, address, chainId, updateDelay } = options
  const isSubscriptionIsAvailable = isEvmWallet(options) && address && isConnected && provider
  const isTabActive = useTabActive()
  const queryClient = useQueryClient()
  const { data: balance } = useQuery(['evmBalance', address], () => balanceFetcher(options), {
    initialData: null,
    enabled: Boolean(isSubscriptionIsAvailable) && isTabActive,
    retry: 2,
    refetchInterval: updateDelay ? updateDelay * 1000 : false,
    refetchOnWindowFocus: true
  })

  const getBalanceFromProvider = useCallback(() => {
    if (!isSubscriptionIsAvailable) {
      return
    }

    return queryClient.invalidateQueries(['evmBalance', address])
  }, [queryClient, isSubscriptionIsAvailable])

  // Call balance function on each changing of web3 or address
  useEffect(() => {
    getBalanceFromProvider()
  }, [queryClient])

  // Subscribe to block changes
  useEffect(() => {
    if (isSubscriptionIsAvailable) {
      options.provider.on('block', getBalanceFromProvider)
    }

    return () => {
      if (options.provider && isSubscriptionIsAvailable) {
        options.provider.off('block', getBalanceFromProvider)
      }
    }
  }, [isSubscriptionIsAvailable, address, chainId, queryClient, options.provider])

  return balance
}

export { useEVMBalance }
