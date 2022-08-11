import type { TWalletAddressesHistory } from '../..'
import { LOCAL_STORAGE_WALLETS_ADDRESSES } from '../..'
import { useLocalStorage } from '../useLocalStorage'
import type { TUseWalletAddressesHistory, TUseWalletAddressesOptions } from './types'

function useWalletAddressesHistory(): TUseWalletAddressesHistory {
  const [walletAddressesHistory, setWalletAddressesHistory] = useLocalStorage<TWalletAddressesHistory>(LOCAL_STORAGE_WALLETS_ADDRESSES, {})

  const addWalletAddress = (newWalletData: TUseWalletAddressesOptions) => {
    setWalletAddressesHistory(val => ({
      ...val,
      ...newWalletData
    }))
  }

  return [walletAddressesHistory, addWalletAddress]
}

export { useWalletAddressesHistory }
