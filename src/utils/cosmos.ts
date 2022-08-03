import type { Keplr } from '@keplr-wallet/types'
import type { TConnectedWallet } from '..'

const getCosmosConnectedWallets = async (provider: Keplr, chains: string[]): Promise<TConnectedWallet[]> => {
  const connectedWallets: TConnectedWallet[] = []
  for (const chainName of chains) {
    const offlineSigner = await provider.getOfflineSigner(chainName)
    const accounts = await offlineSigner?.getAccounts()
    if (!!accounts && accounts.length > 0) {
      const address = accounts.map((account: { address: string }) => {
        return account.address
      })
      connectedWallets.push({ blockchain: chainName, addresses: address })
    }
  }

  return connectedWallets
}

export { getCosmosConnectedWallets }
