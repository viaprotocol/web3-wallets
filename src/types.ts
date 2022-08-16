import type { CoinbaseWalletProvider } from '@coinbase/wallet-sdk'
import type { TransactionRequest, Web3Provider } from '@ethersproject/providers'
import type { Keplr } from '@keplr-wallet/types'
import type { MetaMaskInpageProvider } from '@metamask/providers'
import type { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import type { Connection, Signer, Transaction } from '@solana/web3.js'
import type WalletConnectProvider from '@walletconnect/web3-provider'
import type { BigNumber, ethers } from 'ethers'
import type { CosmosTransaction } from 'rango-sdk/lib'
import type { COSMOS_WALLETS_CONFIG, EVM_WALLETS_CONFIG, SOL_WALLETS_CONFIG, WALLET_NAMES } from './constants'

type TAvailableWalletNames = keyof typeof WALLET_NAMES
type TAvailableEvmWalletNames = typeof EVM_WALLETS_CONFIG[number]
type TAvailableSolWalletNames = typeof SOL_WALLETS_CONFIG[number]
type TAvailableCosmosWalletNames = typeof COSMOS_WALLETS_CONFIG[number]

type TWalletsTypeList = TAvailableEvmWalletNames | TAvailableSolWalletNames | TAvailableCosmosWalletNames
type TAvailableWalletsGroups = 'EVM' | 'SOL' | 'COSMOS'

type TChainsWithWalletsLink = {
  key: TAvailableWalletsGroups
  chains: readonly number[]
  wallets: TWalletsTypeList[]
}

enum WalletStatusEnum {
  NOT_INITED = 'NOT_INITED',
  CONNECTING = 'CONNECTING',
  LOADING = 'LOADING',
  READY = 'READY'
}

type TConnectedWallet = {
  chainId: number
  blockchain: string
  addresses: string[]
}

type TWalletAddressesHistory = {
  [address: string]: number[]
}

type TWalletStateDefault = {
  connectedWallets: TConnectedWallet[]
  isConnected: boolean
  status: WalletStatusEnum
  subName: null | string
  walletProvider: WalletConnectProvider | MetaMaskInpageProvider | CoinbaseWalletProvider | null
  connection: Connection | null
  chainId: null | number
  address: string | null
  addressShort: string | null
  addressDomain: string | null
  balance: string | null
}

type TEvmWalletStore = {
  name: TAvailableEvmWalletNames
  provider: Web3Provider
} & TWalletStateDefault

type TSolWalletStore = {
  name: TAvailableSolWalletNames
  provider: PhantomWalletAdapter
} & TWalletStateDefault

type TCosmosWalletStore = {
  name: TAvailableCosmosWalletNames
  provider: Keplr
} & TWalletStateDefault

type TWalletBodyDefaultState = {
  name: null
  provider: null
} & TWalletStateDefault

type TWalletStore = TEvmWalletStore | TSolWalletStore | TCosmosWalletStore | TWalletBodyDefaultState

type TWalletState = {
  [walletName in TAvailableWalletNames]: TWalletStore
}

type TWalletLocalData = {
  name: string
  subName: string
  chainId: number
  address: string
}

type TWallet = {
  restore: () => Promise<boolean>
  connect: ({ name, chainId }: { name: any; chainId: any }) => Promise<boolean>
  changeNetwork: (chainId: number) => Promise<boolean>
  sendTx: (
    transaction: TransactionRequest | Transaction | CosmosTransaction,
    options?: {
      signers?: Signer[]
      walletName?: TAvailableWalletNames
    }
  ) => Promise<string /* | false */> // todo: sendTx reject => false
  disconnect: () => void
  estimateGas: (data: TransactionRequest) => Promise<BigNumber | undefined>
  waitForTransaction: (transactionHash: string, config?: { confirmations?: number; fromChainId?: number }) => Promise<void>
  getTransaction: (transactionHash: string) => Promise<ethers.providers.TransactionReceipt>
  connectedWallets: TConnectedWallet[]
  walletAddressesHistory: TWalletAddressesHistory
  walletState: TWalletState
} & TWalletStore

type TWalletValues = typeof WALLET_NAMES[keyof typeof WALLET_NAMES]

export type { TAvailableWalletNames, TWallet, TWalletStore, TWalletLocalData, TWalletValues, TAvailableEvmWalletNames, TAvailableSolWalletNames, TEvmWalletStore, TSolWalletStore, TCosmosWalletStore, TConnectedWallet, TWalletAddressesHistory, TWalletState, TChainsWithWalletsLink, TWalletsTypeList }
export { WalletStatusEnum }
