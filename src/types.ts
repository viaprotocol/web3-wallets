import type { CoinbaseWalletProvider } from '@coinbase/wallet-sdk'
import type { TransactionReceipt, TransactionRequest, Web3Provider } from '@ethersproject/providers'
import type { MetaMaskInpageProvider } from '@metamask/providers'
import type { Connection, Signer, Transaction } from '@solana/web3.js'
import type WalletConnectProvider from '@walletconnect/web3-provider'
import type { BigNumber } from 'ethers'
import type { WALLET_NAMES } from './constants'

type TAvailableWalletNames = keyof typeof WALLET_NAMES

enum WalletStatusEnum {
  NOT_INITED = 'NOT_INITED',
  CONNECTING = 'CONNECTING',
  LOADING = 'LOADING',
  READY = 'READY'
}

type TWalletStoreState = {
  isConnected: boolean
  status: WalletStatusEnum
  name: null | TAvailableWalletNames
  subName: null | string
  provider: Web3Provider | null
  walletProvider: WalletConnectProvider | MetaMaskInpageProvider | CoinbaseWalletProvider | null
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

type TWallet = {
  restore: () => Promise<boolean>
  connect: ({ name, chainId }: { name: any; chainId: any }) => Promise<boolean>
  changeNetwork: (chainId: number) => Promise<boolean>
  sendTx: (
    transaction: TransactionRequest | Transaction,
    options?: { signers?: Signer[] }
  ) => Promise<string /* | false */> // todo: sendTx reject => false
  disconnect: () => void
  estimateGas: (data: TransactionRequest) => Promise<BigNumber | undefined>
  waitForTransaction: (transactionHash: string, confirmations?: number) => Promise<void>
} & TWalletStoreState

type TWalletValues = keyof typeof WALLET_NAMES

export type { TAvailableWalletNames, TWallet, TWalletStoreState, TWalletLocalData, TWalletValues }
export { WalletStatusEnum }
