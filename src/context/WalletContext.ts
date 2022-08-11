import { createContext } from 'react'

import type { TWallet, TWalletStore } from '../types'
import { WalletStatusEnum } from '../types'

const INITIAL_STATE: TWalletStore = {
  status: WalletStatusEnum.NOT_INITED,
  isConnected: false, // TODO: Remove (use status)
  name: null,
  subName: null,
  chainId: null,
  address: '',
  addressShort: '',
  addressDomain: null,
  balance: null,
  connection: null,
  provider: null,
  walletProvider: null,
  connectedWallets: []
}

const WalletContext = createContext<TWallet>({
  ...INITIAL_STATE,
  walletAddressesHistory: {},
  restore: () => Promise.reject(),
  connect: () => Promise.reject(),
  changeNetwork: () => Promise.reject(),
  sendTx: () => Promise.reject(),
  disconnect: () => {},
  estimateGas: () => Promise.reject(),
  waitForTransaction: () => Promise.reject(),
  getTransaction: () => Promise.reject()
})

export { WalletContext, INITIAL_STATE }
