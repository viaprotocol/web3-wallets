import { createContext } from 'react'
import { IWallet, IWalletStoreState } from './types'

export const INITIAL_STATE: IWalletStoreState = {
  isConnected: false,
  name: null,
  subName: null,
  chainId: null,
  address: '',
  addressShort: '',
  addressDomain: null,
  balance: null,
  connection: null,
  provider: null,
  walletProvider: null
}

export const WalletContext = createContext<IWallet>({
  ...INITIAL_STATE,
  restore: () => Promise.reject(),
  connect: () => Promise.reject(),
  changeNetwork: () => Promise.reject(),
  sendTx: () => Promise.reject(),
  disconnect: () => {},
  estimateGas: () => Promise.reject(),
  getTransactionReceipt: undefined
})
