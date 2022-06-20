import { createContext } from 'react'

import type { TWallet, TWalletStoreState } from '../types'
import { WalletStatusEnum } from '../types'

const INITIAL_STATE: TWalletStoreState = {
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
  walletProvider: null
}

const WalletContext = createContext<TWallet>({
  ...INITIAL_STATE,
  restore: () => Promise.reject(),
  connect: () => Promise.reject(),
  changeNetwork: () => Promise.reject(),
  sendTx: () => Promise.reject(),
  disconnect: () => {},
  estimateGas: () => Promise.reject(),
  waitForTransaction: () => Promise.reject()
})

export { WalletContext, INITIAL_STATE }
