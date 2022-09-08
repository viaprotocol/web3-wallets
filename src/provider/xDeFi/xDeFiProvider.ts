class XDeFiProvider {
  constructor(provider: any, chains: number[]) {
    this.provider = provider
    this.chains = chains
  }

  private provider: any = null
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

  getAccounts = async (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      if (!window.xfi.bitcoin) {
        resolve([])
        return
      }

      this.provider.request(
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

  request = (method: string, data: any) => {
    return new Promise((resolve, reject) => {
      this.provider.request(
        { method, params: data },
        (error: any, result: any) => {
          if (error) {
            reject(error)
          }

          resolve(result)
        }
      )
    })
  }

  signTransaction = (hash: string) => {
    return this.request('sign_transaction', [hash])
  }
}

export { XDeFiProvider }
