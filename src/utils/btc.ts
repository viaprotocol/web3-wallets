import type { TChainWallet } from '..'
import { btcChainWalletMap } from '..'
import { getConnectedWallets } from './common'

const getBTCAccounts = (provider: any): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    if (!window.xfi.bitcoin) {
      resolve([])
      return
    }

    provider.request(
      { method: 'request_accounts', params: [] },
      (error: any, accounts: any) => {
        if (error) {
          reject(error)
        }

        resolve(accounts)
      }
    )
  })
}

const getBTCConnectedWallets = async (xDeFiProvider: any) => {
  return await getConnectedWallets(btcChainWalletMap, async ({ name }: TChainWallet) => {
    return await getBTCAccounts(xDeFiProvider[name])
  })
}

export { getBTCConnectedWallets }
