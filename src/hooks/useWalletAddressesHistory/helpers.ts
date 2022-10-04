import type { TWalletInfo } from './types'
import { AVAILABLE_WALLETS_GROUPS_CONFIG, CHAINS_WITH_WALLET, chainWalletMap } from '@/constants'
import type { TWalletAddressesHistory } from '@/types'

const getWalletInfoByChainId = (chainId: number) => CHAINS_WITH_WALLET.find(({ validate }) => validate(chainId))

const getWalletsByGroup = (walletAddressesHistory: TWalletAddressesHistory) => {
  const output: TWalletInfo = AVAILABLE_WALLETS_GROUPS_CONFIG.reduce(
    (acc, key) => ({ ...acc, [key]: [] }), {} as TWalletInfo
  )

  for (const chainData of Object.entries(walletAddressesHistory)) {
    const [, chains] = chainData
    const validChainWalletData = getWalletInfoByChainId(chains[0]!)

    if (validChainWalletData) {
      output[validChainWalletData.key].push(chainData)
    }
  }

  return output
}

const convertAddressHistoryToConnectedWallets = (walletAddressesHistory: TWalletAddressesHistory) => {
  return Object.entries(walletAddressesHistory).map(([historyAddress, chains]) => {
    const chain = chains[0]!
    const data = chainWalletMap.find(({ chainId }) => chainId === chain)

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

export { getWalletsByGroup, convertAddressHistoryToConnectedWallets, getHistoryAddressByChaindId, getWalletInfoByChainId }
