import { createContext } from 'react'

import { IWallet, IWalletStoreState } from '../types'

const INITIAL_STATE: IWalletStoreState = {
  isLoading: false,
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

const WalletContext = createContext<IWallet>({
  ...INITIAL_STATE,
  restore: () => Promise.reject(),
  connect: () => Promise.reject(),
  changeNetwork: () => Promise.reject(),
  sendTx: () => Promise.reject(),
  disconnect: () => {},
  estimateGas: () => Promise.reject(),
  waitForTransaction: null
})

export { WalletContext, INITIAL_STATE }
