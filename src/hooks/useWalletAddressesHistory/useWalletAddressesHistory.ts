import type { TAvailableWalletNames, TWalletAddressesHistory } from '../..'
import { LOCAL_STORAGE_WALLETS_ADDRESSES } from '../..'
import { useLocalStorage } from '../useLocalStorage'
import type { TUseWalletAddressesHistory } from './types'

function useWalletAddressesHistory(): TUseWalletAddressesHistory {
  const [walletAddressesHistory, setWalletAddressesHistory] = useLocalStorage<TWalletAddressesHistory>(LOCAL_STORAGE_WALLETS_ADDRESSES, {})

  const addWalletAddress = (walletName: TAvailableWalletNames, chainId: number, address: string) => {
    setWalletAddressesHistory(val => ({
      ...val,
      [walletName]: {
        ...(val?.[walletName] || {}),
        [chainId]: address
      }
    }))
  }

  return [walletAddressesHistory, addWalletAddress]
}

export { useWalletAddressesHistory }
