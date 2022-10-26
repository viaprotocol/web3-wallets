import type { CoinbaseWalletProvider } from '@coinbase/wallet-sdk'
import type { TransactionRequest, Web3Provider } from '@ethersproject/providers'
import type { SafeAppProvider } from '@gnosis.pm/safe-apps-provider'
import type { Keplr } from '@keplr-wallet/types'
import type { MetaMaskInpageProvider } from '@metamask/providers'
import type { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import type { Connection, Signer, Transaction } from '@solana/web3.js'
import type WalletConnectProvider from '@walletconnect/web3-provider'
import type { BigNumber, ethers } from 'ethers'
import type { CosmosTransaction } from 'rango-sdk/lib'
import type { AVAILABLE_WALLETS_GROUPS_CONFIG, BTC_CHAINS, BTC_WALLETS_CONFIG, COSMOS_CHAINS, COSMOS_WALLETS_CONFIG, EVM_WALLETS_CONFIG, SOL_WALLETS_CONFIG, WALLET_NAMES } from './constants'
import type { TErc20SendTokenOptions } from './context'
import type { XDeFi } from './provider'
import type { BTClikeTransaction } from './provider/xDeFi/types'

type TAvailableWalletNames = keyof typeof WALLET_NAMES
type TAvailableEvmWalletNames = typeof EVM_WALLETS_CONFIG[number]
type TAvailableSolWalletNames = typeof SOL_WALLETS_CONFIG[number]
type TAvailableCosmosWalletNames = typeof COSMOS_WALLETS_CONFIG[number]
type TAvailableBTCWalletNames = typeof BTC_WALLETS_CONFIG[number]

type TWalletsTypeList = TAvailableEvmWalletNames | TAvailableSolWalletNames | TAvailableCosmosWalletNames
type TAvailableWalletsGroups = typeof AVAILABLE_WALLETS_GROUPS_CONFIG[number]

type TChainsWithWalletsLink = {
  key: TAvailableWalletsGroups
  chains: readonly number[]
  wallets: TWalletsTypeList[]
  validate: (chainId: number) => boolean
}

const WALLET_STATUS = /* #__PURE__ */ {
  NOT_INITED: 'NOT_INITED',
  CONNECTING: 'CONNECTING',
  LOADING: 'LOADING',
  READY: 'READY'
}

type WalletStatus = typeof WALLET_STATUS
type WalletStatusEnum = WalletStatus[keyof WalletStatus]

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
  walletProvider: WalletConnectProvider | MetaMaskInpageProvider | CoinbaseWalletProvider | SafeAppProvider | null
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

type TBTCWalletStore = {
  name: TAvailableBTCWalletNames
  provider: XDeFi
} & TWalletStateDefault

type TWalletStore = TEvmWalletStore | TSolWalletStore | TCosmosWalletStore | TBTCWalletStore | TWalletBodyDefaultState

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
    transaction: TransactionRequest | Transaction | CosmosTransaction | BTClikeTransaction,
    options?: {
      signers?: Signer[]
      fromChainId?: number
    }
  ) => Promise<string /* | false */> // todo: sendTx reject => false
  signMessage: (message: string, options?: {
    fromChainId?: number
  }) => Promise<string>
  disconnect: () => void
  estimateGas: (data: TransactionRequest) => Promise<BigNumber | undefined>
  waitForTransaction: (transactionHash: string, config?: { confirmations?: number; fromChainId?: number }) => Promise<void>
  getTransaction: (transactionHash: string) => Promise<ethers.providers.TransactionReceipt>
  connectedWallets: TConnectedWallet[]
  walletAddressesHistory: TWalletAddressesHistory
  walletState: TWalletState
  erc20SendToken: (options: TErc20SendTokenOptions) => Promise<void>
} & TWalletStore

type TWalletValues = typeof WALLET_NAMES[keyof typeof WALLET_NAMES]

type TAvailableNetworkNames = 'COSMOS' | 'OSMOSIS' | 'SIF' | 'BTC' | 'LTC' | 'BCH'
type TChainWallet = { name: TAvailableNetworkNames; chainId: typeof COSMOS_CHAINS[number] | typeof BTC_CHAINS[number] ; network: string }

export type { TAvailableWalletNames, TWallet, TWalletStore, TWalletLocalData, TWalletValues, TAvailableEvmWalletNames, TAvailableSolWalletNames, TEvmWalletStore, TSolWalletStore, TCosmosWalletStore, TConnectedWallet, TWalletAddressesHistory, TWalletState, TChainsWithWalletsLink, TWalletsTypeList, TChainWallet, TAvailableWalletsGroups, TBTCWalletStore, WalletStatusEnum, WalletStatus }
export { WALLET_STATUS }
