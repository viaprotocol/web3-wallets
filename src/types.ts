import { TransactionReceipt, TransactionRequest, Web3Provider } from '@ethersproject/providers'
import { MetaMaskInpageProvider } from '@metamask/providers'
import { Connection, Signer, Transaction } from '@solana/web3.js'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { BigNumber } from 'ethers'

type AvailableWalletNames = 'WalletConnect' | 'MetaMask' | 'Phantom' | 'Near'

interface IWalletStoreState {
  isConnected: boolean
  isLoading: boolean
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

type TWalletLocalData = {
  name: string
  chainId: number
  address: string
}

interface IWallet extends IWalletStoreState {
  restore: () => Promise<boolean>
  connect: ({ name, chainId }: { name: any; chainId: any }) => Promise<boolean>
  changeNetwork: (chainId: number) => Promise<boolean>
  sendTx: (
    transaction: TransactionRequest | Transaction,
    options?: { signers?: Signer[] }
  ) => Promise<string /* | false*/> // todo: sendTx reject => false
  disconnect: () => void
  estimateGas: (data: TransactionRequest) => Promise<BigNumber | undefined>
  waitForTransaction: (transactionHash: string, confirmations?: number) => Promise<TransactionReceipt>
}

export type { AvailableWalletNames, IWallet, IWalletStoreState, TWalletLocalData }
