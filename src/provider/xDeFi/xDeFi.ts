import type { Web3Provider } from '@coinbase/wallet-sdk/dist/provider/Web3Provider'
import type { TProviderType, TXDeFiAvailableProviders } from './types'
import { XDeFiProvider } from './xDeFiProvider'
import { EVM_CHAINS, NETWORK_IDS } from '@/constants'
import type { TXDeFiWeb3Provider } from '@/context'

class XDeFi {
  constructor(provider: TXDeFiWeb3Provider) {
    this.providers = {
      BTC: new XDeFiProvider(provider.bitcoin, [NETWORK_IDS.BTC]),
      ETH: new XDeFiProvider<Web3Provider>(provider.ethereum, EVM_CHAINS),
      BCH: new XDeFiProvider(provider.bitcoincash, [NETWORK_IDS.BCH]),
      LTC: new XDeFiProvider(provider.litecoin, [NETWORK_IDS.Litecoin])
    }
  }

  private providers: TProviderType | null = null

  public getProviderByKey = (key: TXDeFiAvailableProviders) => {
    if (!this.providers) {
      throw new Error('XDeFi providers are not initialized')
    }

    return this.providers[key]
  }

  public getProviderByChainId = (chainId: number) => {
    if (!this.providers) {
      return null
    }

    for (const key in this.providers) {
      if (this.providers[key as TXDeFiAvailableProviders].isChainSupportedByProvider(chainId)) {
        return this.providers[key as TXDeFiAvailableProviders]
      }
    }

    return null
  }
}

export { XDeFi }
