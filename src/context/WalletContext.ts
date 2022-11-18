import { createContext } from 'react'
import { WALLET_NAMES } from '../constants'

import type { TWallet, TWalletState, TWalletStore } from '../types'
import { WALLET_STATUS } from '../types'

const INITIAL_STATE: TWalletStore = /* #__PURE__ */ {
  status: WALLET_STATUS.NOT_INITED,
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

const INITIAL_WALLET_STATE = /* #__PURE__ */ Object.values(WALLET_NAMES).reduce((acc, walletName) => ({ ...acc, [walletName]: INITIAL_STATE }), {} as TWalletState)

const WalletContext = /* #__PURE__ */ createContext<TWallet>({
  ...INITIAL_STATE,
  walletAddressesHistory: {},
  walletState: INITIAL_WALLET_STATE,
  restore: () => Promise.reject(),
  connect: () => Promise.reject(),
  changeNetwork: () => Promise.reject(),
  sendTx: () => Promise.reject(),
  signMessage: () => Promise.reject(),
  signTypedData: () => Promise.reject(),
  disconnect: () => {},
  getNonce: () => Promise.reject(),
  estimateGas: () => Promise.reject(),
  waitForTransaction: () => Promise.reject(),
  getTransaction: () => Promise.reject(),
  erc20SendToken: () => Promise.resolve()
})

export { WalletContext, INITIAL_STATE, INITIAL_WALLET_STATE }
