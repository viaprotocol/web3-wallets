import { MetaMaskInpageProvider } from '@metamask/providers'

import { TransactionReceipt, TransactionRequest, Web3Provider } from '@ethersproject/providers'
import { Signer, Transaction, Connection } from '@solana/web3.js'
import { BigNumber } from 'ethers'
import WalletConnectProvider from '@walletconnect/web3-provider'

type AvailableWalletNames = 'WalletConnect' | 'MetaMask' | 'Phantom' | 'Near'

interface IWalletStoreState {
  isConnected: boolean
  name: null | AvailableWalletNames
  subName: null | string
  provider: Web3Provider | null
  walletProvider: WalletConnectProvider | MetaMaskInpageProvider | null
  connection: Connection | null
  chainId: null | number
  address: string | null
  addressShort: string | null
  addressDomain: string | null
  balance: string | null
}

interface IWallet extends IWalletStoreState {
  restore: () => Promise<boolean>
  connect: ({ name, chainId }: { name: any; chainId: any }) => Promise<boolean>
  changeNetwork: (chainId: number) => Promise<boolean>
  sendTx: (transaction: TransactionRequest | Transaction, options?: { signers?: Signer[] }) => Promise<string>
  disconnect: () => void
  estimateGas: (data: TransactionRequest) => Promise<BigNumber | undefined>
  getTransactionReceipt: ((transactionHash: string | Promise<string>) => Promise<TransactionReceipt>) | null
}

export type { AvailableWalletNames, IWallet, IWalletStoreState }
