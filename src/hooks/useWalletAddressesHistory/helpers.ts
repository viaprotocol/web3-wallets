import { cosmosChainWalletMap } from '@/constants'
import type { TWalletAddressesHistory } from '@/types'
import { isCosmosChain } from '@/utils'

const getWalletsByGroup = (walletAddressesHistory: TWalletAddressesHistory) => {
  const output = Object.entries(walletAddressesHistory).reduce<
        [[string, number[]][], [string, number[]][]]
      >(
        ([cosmos, notCosmos], data) => {
          const [, chains] = data

          if (isCosmosChain(chains[0])) {
            return [[...cosmos, data], notCosmos]
          }

          return [cosmos, [...notCosmos, data]]
        },
        [[], []]
      )

  return output
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
