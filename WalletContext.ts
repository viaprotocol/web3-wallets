import { createContext } from 'react'
import Web3 from 'web3'

interface WalletInterface {
  isLoading: boolean
  isConnected: boolean
  name: null | 'WalletConnect' | 'MetaMask' | 'Phantom'
  chainId: null | number | 'solana-testnet' | 'solana-mainnet'
  address: string | null
  addressShort: string | null
  addressDomain: null | string
  web3: Web3 | null // todo: types
  provider: any // 📌 TODO: add interface
  restore: Function
  connect: Function
  changeNetwork: Function
  sendTx: Function
  disconnect: Function
}

export const WalletContext = createContext<WalletInterface>({
  isLoading: false,
  isConnected: false,
  name: null,
  chainId: null,
  address: '',
  addressShort: '',
  addressDomain: null,
  web3: null,
  provider: null,
  restore: () => {},
  connect: () => {},
  changeNetwork: () => {},
  sendTx: () => {},
  disconnect: () => {}
})
