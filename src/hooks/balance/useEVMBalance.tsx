import { useCallback, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { TUseBalanceOptions } from './types'
import type { TEvmWalletStore } from '@/types'

const balanceFetcher = async (options: TEvmWalletStore) => {
  const { address, provider } = options
  const balance = await provider.getBalance(address!)
  return String(balance)
}

function useEVMBalance(options: TEvmWalletStore & TUseBalanceOptions) {
  const { address, chainId, updateDelay } = options
  const queryClient = useQueryClient()
  const { data: balance } = useQuery(['evmBalance', address, chainId], () => balanceFetcher(options), {
    retry: 2,
    refetchInterval: updateDelay ? updateDelay * 1000 : false,
    refetchOnWindowFocus: true
  })

  const getBalanceFromProvider = useCallback(() => {
    return queryClient.invalidateQueries(['evmBalance', address])
  }, [queryClient, address])

  // Subscribe to block changes
  useEffect(() => {
    options.provider.on('block', getBalanceFromProvider)

    return () => {
      options.provider.off('block', getBalanceFromProvider)
    }
  }, [address, chainId, queryClient, options.provider])

  return balance
}

export { useEVMBalance }
