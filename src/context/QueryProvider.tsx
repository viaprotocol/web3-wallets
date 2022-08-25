import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

type TQueryProviderProps = {
  children: ReactNode
}

const queryClient = new QueryClient()

function QueryProvider({ children }: TQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export { QueryProvider }
