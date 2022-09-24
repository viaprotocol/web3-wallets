import type { TChainWallet } from '../types'
import { btcChainWalletMap } from '../constants'
import { getConnectedWallets } from './common'
import type { XDeFi } from '@/provider'

const getBTCConnectedWallets = async (xDeFiProvider: XDeFi) => {
  return await getConnectedWallets(btcChainWalletMap, async ({ name }: TChainWallet) => xDeFiProvider.getProviderByKey(name as any).getAccounts())
}

export { getBTCConnectedWallets }
