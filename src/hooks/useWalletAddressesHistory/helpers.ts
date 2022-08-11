import { cosmosChainWalletMap } from '@/constants'
import type { TWalletAddressesHistory } from '@/types'
import { isCosmosChain } from '@/utils'

const getWalletsByGroup = (walletAddressesHistory: TWalletAddressesHistory) => {
  const cosmosWallets = []
  const nonCosmosWallets = []

  for (const chainData of Object.entries(walletAddressesHistory)) {
    const [, chains] = chainData
    // Address would have at least one chainId
    if (isCosmosChain(chains[0])) {
      cosmosWallets.push(chainData)
    } else {
      nonCosmosWallets.push(chainData)
    }
  }

  return [cosmosWallets, nonCosmosWallets]
}

const convertAddressHistoryToConnectedWallets = (walletAddressesHistory: TWalletAddressesHistory) => {
  return Object.entries(walletAddressesHistory).map(([historyAddress, chains]) => {
    const chain: number = chains[0]
    const data = cosmosChainWalletMap.find(({ chainId }) => chainId === chain)

    if (!data) {
      throw new Error(`convertAddressHistoryToConnectedWallets: not found name for chain ${chain}`)
    }

    return { blockchain: data.name, addresses: [historyAddress], chainId: chain }
  })
}

const getHistoryAddressByChaindId = (walletAddressesHistory: TWalletAddressesHistory, chainId: number) => {
  const walletData = Object.entries(walletAddressesHistory).find(([, chains]) => chains.includes(chainId))

  if (!walletData) {
    return null
  }

  return walletData[0]
}

export { getWalletsByGroup, convertAddressHistoryToConnectedWallets, getHistoryAddressByChaindId }
