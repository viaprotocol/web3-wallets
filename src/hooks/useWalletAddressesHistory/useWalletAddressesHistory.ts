import type { TWalletAddressesHistory } from '../../types'
import { LOCAL_STORAGE_WALLETS_ADDRESSES } from '../../constants'
import { useLocalStorage } from '../useLocalStorage'
import type { TUseWalletAddressesHistory, TUseWalletAddressesOptions } from './types'

function useWalletAddressesHistory(): TUseWalletAddressesHistory {
  const [walletAddressesHistory, setWalletAddressesHistory] = useLocalStorage<TWalletAddressesHistory>(LOCAL_STORAGE_WALLETS_ADDRESSES, {})

  const addWalletAddress = (newWalletData: TUseWalletAddressesOptions) => {
    setWalletAddressesHistory((currentAddressHistory) => {
      const walletData = {
        ...currentAddressHistory,
        ...newWalletData
      }

      for (const [newAddress, newChains] of Object.entries(newWalletData)) {
        const walletDataEntries = Object.entries(walletData)
        for (const [address, chains] of walletDataEntries) {
          if (newAddress !== address) {
            const output = chains.filter(chain => !newChains.includes(chain))

            if (output.length) {
              walletData[address] = output
            } else {
              delete walletData[address]
            }
          }
        }
      }

      return walletData
    })
  }

  return [walletAddressesHistory, addWalletAddress]
}

export { useWalletAddressesHistory }
