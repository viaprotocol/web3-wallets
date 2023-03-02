import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

type TQueryProviderProps = {
  children: ReactNode
}

const queryClient = /* #__PURE__ */ new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24 * 7, // 1 week
      staleTime: 1000 * 60 * 60 * 2 // 2 hours
    }
  },
})

const localStoragePersister = createSyncStoragePersister({ storage: window.localStorage, key: 'web3-wallets.store' })

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
})

function QueryProvider({ children }: TQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export { QueryProvider, queryClient }
