import type { Keplr } from '@keplr-wallet/types'
import type { TConnectedWallet } from '..'
import { cosmosChainWalletMap, cosmosChainsMap } from '../constants'

const getCosmosConnectedWallets = async (provider: Keplr): Promise<TConnectedWallet[]> => {
  const connectedWallets: TConnectedWallet[] = []
  for (const { name, chainId } of cosmosChainWalletMap) {
    const offlineSigner = await provider.getOfflineSigner(cosmosChainsMap[chainId])
    const accounts = await offlineSigner?.getAccounts()
    if (!!accounts && accounts.length > 0) {
      const address = accounts.map((account: { address: string }) => {
        return account.address
      })
      connectedWallets.push({ blockchain: name, addresses: address })
    }
  }

  return connectedWallets
}

export { getCosmosConnectedWallets }
