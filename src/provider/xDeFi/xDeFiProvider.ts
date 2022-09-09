import type { BTClikeTransaction } from './types'

class XDeFiProvider<ProviderType extends { request: any } = any> {
  constructor(provider: ProviderType, chains: number[]) {
    this.provider = provider
    this.chains = chains
  }

  private provider: ProviderType | null = null
  private chains: number[] = []

  getProvider = () => {
    return this.provider
  }

  getChains = () => {
    return this.chains
  }

  isChainSupportedByProvider = (chainId: number) => {
    return this.chains.includes(chainId)
  }

  getAccounts = () => {
    return this.request<string[]>('request_accounts', [])
  }

  transfer = (transaction: BTClikeTransaction) => {
    const { fromWalletAddress, recipientAddress, amount, decimals, memo, asset } = transaction
    return this.request<string>('transfer', [{
      from: fromWalletAddress,
      recipient: recipientAddress,
      asset,
      amount: {
        amount,
        decimals
      },
      memo
    }])
  }

  request = <OutputType = any>(method: string, data: any): Promise<OutputType> => {
    return new Promise((resolve, reject) => {
      if (!this.provider) {
        return reject()
      }

      this.provider.request(
        { method, params: data },
        (error: any, result: OutputType) => {
          if (error) {
            reject(error)
          }

          resolve(result)
        }
      )
    })
  }

  signTransaction = (hash: string) => {
    return this.request<string>('sign_transaction', [hash])
  }
}

export { XDeFiProvider }
