import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

type TQueryProviderProps = {
  children: ReactNode
}

const queryClient = /* #__PURE__ */ new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24 * 7, // 1 week
      staleTime: 1000 * 60 * 60 * 2 // 2 hours
    }
  }
})

function QueryProvider({ children }: TQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export { QueryProvider, queryClient }
