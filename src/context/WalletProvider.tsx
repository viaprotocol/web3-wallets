/* 🚧 NEED TO BE REFACTORED 🚧 */
/* eslint-disable @typescript-eslint/no-use-before-define */
import type { ReactNode } from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'
import type { ExternalProvider, TransactionRequest } from '@ethersproject/providers'
import type { Signer, Transaction } from '@solana/web3.js'
import type { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import type { CosmosTransaction } from 'rango-sdk/lib'
import type { TypedDataField } from 'ethers'
import { ethers } from 'ethers'
import { Web3Provider } from '@ethersproject/providers/'

import type { Window as KeplrWindow } from '@keplr-wallet/types'
import type { TypedData } from 'abitype'
import { ERC20_GAS_LIMIT, EVM_CHAINS, LOCAL_STORAGE_WALLETS_KEY, NETWORK_IDS, SOL_CHAINS, WALLET_NAMES, WALLET_SUBNAME, chainWalletMap, cosmosChainWalletMap, isCosmosChain, isEvmChain, isSolChain } from '../constants'
import type { SignTypedDataArgs, SignTypedDataResult, TAvailableWalletNames, TWalletLocalData, TWalletState, TWalletStore } from '../types'
import { WALLET_STATUS } from '../types'
import { getNetworkById, rpcMapping } from '../networks'
import { getWalletInfoByChainId, useWalletAddressesHistory } from '../hooks'
import { INITIAL_STATE, INITIAL_WALLET_STATE, WalletContext } from './WalletContext'
import { QueryProvider } from './QueryProvider'
import type { TErc20SendTokenOptions, TXDeFiWeb3Provider } from './types'
import { isBTClikeWallet, isCosmosWallet, isEvmWallet, isSolWallet } from '@/utils/wallet'
import { BalanceProvider } from '@/components/balance/BalanceProvider'
import { getBTCConnectedWallets } from '@/utils/btc'
import { XDeFi } from '@/provider'
import type { BTClikeTransaction } from '@/provider/xDeFi/types'
import { ERRCODE, ERROR_MESSAGE, RejectRequestError } from '@/errors'
import { getActiveWalletName, getAddresesInfo, goKeplr, goMetamask, goPhantom, inIframe, mapRawWalletSubName, normalizeChainId, shortenAddress } from '@/utils/common'
import { executeCosmosTransaction, getCosmosConnectedWallets } from '@/utils/cosmos'
import { detectNewTxFromAddress, getDomainAddress } from '@/utils/evm'
import { getCluster, parseEnsFromSolanaAddress } from '@/utils/solana'
import { ERC20Abi } from '@/abi'

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window extends KeplrWindow {
    xfi: TXDeFiWeb3Provider
    solana: PhantomWalletAdapter & { isPhantom?: boolean }
  }
}

const WalletProvider = function WalletProvider({ children }: { children: ReactNode }) {
  const activeWalletNameRef = useRef<TAvailableWalletNames | null>(null)

  const setActiveWalletName = (newWalletName: TAvailableWalletNames | null) => {
    activeWalletNameRef.current = newWalletName
  }

  const [walletState, setWalletState] = useState<TWalletState>(INITIAL_WALLET_STATE)
  const [walletAddressesHistory, addWalletAddress] = useWalletAddressesHistory()

  const state = useMemo(() => {
    if (activeWalletNameRef.current) {
      return walletState[activeWalletNameRef.current]
    }

    return INITIAL_STATE
  }, [activeWalletNameRef.current, walletState])

  const updateWalletState = (walletName: TAvailableWalletNames | null, newState: Partial<TWalletStore>) => {
    if (walletName) {
      setWalletState(prevState => ({ ...prevState, [walletName]: { ...prevState[walletName], ...newState } }))
    }
  }

  const updateActiveWalletName = (walletName: TAvailableWalletNames) => {
    if (!activeWalletNameRef.current) {
      setActiveWalletName(walletName)
    }
  }

  const connectCoinbase = async (chainId: number): Promise<boolean> => {
    if (!window.ethereum) {
      return false
    }

    updateWalletState('Coinbase', { status: WALLET_STATUS.LOADING })

    try {
      const CoinbaseWalletSDK = (await import('@coinbase/wallet-sdk')).default

      const coinbase = new CoinbaseWalletSDK({
        appName: document.title
      })

      const rpcUrl = rpcMapping[chainId]
      const walletProvider = coinbase.makeWeb3Provider(rpcUrl, chainId)

      const provider = new Web3Provider(walletProvider as unknown as ExternalProvider, 'any')
      await provider.send('eth_requestAccounts', [])

      const { chainId: walletChainId, address, addressShort, addressDomain } = await fetchEvmWalletInfo(provider)

      walletProvider.on('chainChanged', evmChainChangeHandler as any)
      walletProvider.on('accountsChanged', evmAccountChangeHandler as any)

      addWalletAddress({ [address]: EVM_CHAINS })
      updateWalletState('Coinbase', {
        isConnected: true,
        status: WALLET_STATUS.READY,
        name: WALLET_NAMES.Coinbase,
        provider,
        walletProvider,
        chainId: walletChainId,
        address,
        addressShort,
        addressDomain
      })

      localStorage.setItem('web3-wallets-name', WALLET_NAMES.Coinbase)
      localStorage.setItem(
        LOCAL_STORAGE_WALLETS_KEY,
        JSON.stringify({
          name: WALLET_NAMES.Coinbase,
          subName: null,
          chainId,
          address: addressDomain || addressShort
        })
      )

      return true
    } catch (e: any) {
      updateWalletState('Coinbase', { status: WALLET_STATUS.NOT_INITED })
      setActiveWalletName(null)

      if (e.code === ERRCODE.UserRejected) {
        console.warn('[Wallet] User rejected the request')
        return false
      } else {
        throw e
      }
    }
  }

  const connectMetamask = async (chainId: number): Promise<boolean> => {
    if (!window.ethereum) {
      return false
    }

    // If already connected to the same wallet, just return
    if (state.isConnected && state.name === 'MetaMask') {
      console.log('[Wallet] Already connected...')
      return true
    }

    const ethereum: any = window.ethereum

    updateWalletState('MetaMask', { status: WALLET_STATUS.LOADING })

    const findedProvider = () => {
      if (ethereum.providers?.length) {
        const provider = ethereum?.providers.find((prov: any) => prov?.isMetaMask)
        if (!provider) {
          throw new Error('[WalletProvider] No provider found')
        }

        return provider
      }

      return ethereum
    }

    const walletProvider = findedProvider()

    const provider = new Web3Provider(walletProvider as ExternalProvider, 'any')

    try {
      await provider.send('eth_requestAccounts', [])
    } catch (e: any) {
      updateWalletState('MetaMask', { status: WALLET_STATUS.NOT_INITED })
      setActiveWalletName(null)

      if (e.code === ERRCODE.UserRejected) {
        console.warn('[Wallet] User rejected the request')
        return false
      } else {
        throw e
      }
    }

    const { chainId: walletChainId, address, addressShort, addressDomain } = await fetchEvmWalletInfo(provider)

    walletProvider.on('chainChanged', evmChainChangeHandler as any)
    walletProvider.on('accountsChanged', evmAccountChangeHandler as any)

    addWalletAddress({ [address]: EVM_CHAINS })
    updateWalletState('MetaMask', {
      isConnected: true,
      status: WALLET_STATUS.READY,
      name: WALLET_NAMES.MetaMask,
      provider,
      walletProvider,
      chainId: walletChainId,
      address,
      addressShort,
      addressDomain
    })

    localStorage.setItem('web3-wallets-name', WALLET_NAMES.MetaMask)
    localStorage.setItem(
      LOCAL_STORAGE_WALLETS_KEY,
      JSON.stringify({
        name: WALLET_NAMES.MetaMask,
        subName: null,
        chainId,
        address: addressDomain || addressShort
      })
    )

    return true
  }

  const connectxDefi = async (chainId: number): Promise<boolean> => {
    if (!window.xfi.ethereum) {
      return false
    }

    updateWalletState('xDefi', { status: WALLET_STATUS.LOADING })

    const xDeFiProvider = new XDeFi(window.xfi)
    const walletProvider = xDeFiProvider.getProviderByKey('ETH').getProvider()

    const provider = new Web3Provider(walletProvider, 'any')

    try {
      await provider.send('eth_requestAccounts', [])
    } catch (e: any) {
      updateWalletState('xDefi', { status: WALLET_STATUS.NOT_INITED })
      setActiveWalletName(null)

      if (e.code === ERRCODE.UserRejected) {
        console.warn('[Wallet] User rejected the request')
        return false
      } else {
        throw e
      }
    }

    const { chainId: walletChainId, address, addressShort, addressDomain } = await fetchEvmWalletInfo(provider)

    walletProvider.on('chainChanged', evmChainChangeHandler as any)
    walletProvider.on('accountsChanged', evmAccountChangeHandler as any)

    const connectedWallets = await getBTCConnectedWallets(xDeFiProvider)
    const addresesInfo = getAddresesInfo(connectedWallets)

    addWalletAddress({ ...addresesInfo, [address]: EVM_CHAINS })

    updateWalletState('xDefi', {
      isConnected: true,
      status: WALLET_STATUS.READY,
      name: WALLET_NAMES.xDefi,
      provider: xDeFiProvider,
      connectedWallets: [...state.connectedWallets, ...connectedWallets],
      walletProvider,
      chainId: walletChainId,
      address,
      addressShort,
      addressDomain
    })

    localStorage.setItem('web3-wallets-name', WALLET_NAMES.xDefi)
    localStorage.setItem(
      LOCAL_STORAGE_WALLETS_KEY,
      JSON.stringify({
        name: WALLET_NAMES.xDefi,
        subName: null,
        chainId,
        address: addressDomain || addressShort
      })
    )

    return true
  }

  const connectWC = async (chainId: number): Promise<boolean> => {
    updateWalletState('WalletConnect', { status: WALLET_STATUS.LOADING })

    const wcChainId = isEvmChain(chainId) ? chainId : 1

    try {
      const WalletConnectProvider = await import('@walletconnect/web3-provider').then(m => m.default)
      const walletConnectProvider = new WalletConnectProvider({
        rpc: rpcMapping,
        chainId: wcChainId
      })

      await walletConnectProvider.enable()
      const web3Provider = new Web3Provider(walletConnectProvider, 'any')

      const {
        chainId: walletChainId,
        address,
        addressShort,
        addressDomain
      } = await fetchEvmWalletInfo(web3Provider)

      const rawSubName = walletConnectProvider.walletMeta?.name
      const subName = rawSubName ? mapRawWalletSubName(rawSubName) : null

      walletConnectProvider.on('disconnect', (code: number, reason: string) => {
        console.log('WalletConnectProvider disconnected', code, reason)
        disconnect() // todo: only clear state (without duplicate code and disconnect events)
      })
      walletConnectProvider.on('chainChanged', evmChainChangeHandler)
      walletConnectProvider.on('accountsChanged', evmAccountChangeHandler)

      addWalletAddress({ [address]: EVM_CHAINS })
      updateWalletState('WalletConnect', {
        isConnected: true,
        status: WALLET_STATUS.READY,
        name: WALLET_NAMES.WalletConnect,
        subName,
        provider: web3Provider,
        walletProvider: walletConnectProvider,
        chainId: walletChainId,
        address,
        addressShort,
        addressDomain
      })

      localStorage.setItem('web3-wallets-name', WALLET_NAMES.WalletConnect)
      localStorage.setItem(
        LOCAL_STORAGE_WALLETS_KEY,
        JSON.stringify({
          name: WALLET_NAMES.WalletConnect,
          subName,
          chainId: wcChainId,
          address: addressDomain || addressShort
        })
      )

      return true
    } catch (err: any) {
      updateWalletState('WalletConnect', { status: WALLET_STATUS.NOT_INITED })
      setActiveWalletName(null)

      if (err.toString().includes('User closed modal')) {
        return false
      }
      console.error('[Wallet] connectWC error:', err)
      throw new Error(err)
    }
  }

  const connectPhantom = async (chainId: number = NETWORK_IDS.Solana) => {
    if (!isSolChain(chainId)) {
      throw new Error(`Unknown Phantom chainId ${chainId}`)
    }
    updateWalletState('Phantom', { status: WALLET_STATUS.LOADING })
    try {
      const { Connection, clusterApiUrl } = await import('@solana/web3.js')
      await window.solana.connect()
      const address = window.solana.publicKey!.toString()
      const addressDomain = await parseEnsFromSolanaAddress(address)
      const provider = window.solana
      const cluster = getCluster(chainId)
      const solanaNetwork = /* #__PURE__ */ clusterApiUrl(cluster)
      const connection = /* #__PURE__ */ new Connection(solanaNetwork)
      const addressShort = shortenAddress(address)

      addWalletAddress({ [address]: SOL_CHAINS })
      updateWalletState('Phantom', {
        isConnected: true,
        status: WALLET_STATUS.READY,
        name: 'Phantom',
        provider,
        chainId,
        address,
        connection,
        addressShort,
        addressDomain
      })

      localStorage.setItem('web3-wallets-name', WALLET_NAMES.Phantom)
      localStorage.setItem(
        LOCAL_STORAGE_WALLETS_KEY,
        JSON.stringify({
          name: WALLET_NAMES.Phantom,
          subName: null,
          chainId,
          address: addressDomain || addressShort
        })
      )
      return true
    } catch (err: any) {
      updateWalletState('Phantom', { status: WALLET_STATUS.NOT_INITED })
      setActiveWalletName(null)

      if (err.code === ERRCODE.UserRejected) {
        console.warn('[Wallet] User rejected the request.')
      }
      console.error('[Wallet]', err)
      return false
    }
  }

  const connectKeplr = async (chainId: number) => {
    if (!(isCosmosChain(chainId))) {
      throw new Error(`Keplr chainId ${chainId} is not supported`)
    }

    try {
      if (window.keplr) {
        updateWalletState('Keplr', { status: WALLET_STATUS.LOADING })

        const chainList = cosmosChainWalletMap.map(chainWallet => chainWallet.network)
        const currentChain = chainWalletMap.find(chainWallet => chainWallet.chainId === chainId)

        if (!currentChain) {
          throw new Error(`Keplr chainId ${chainId} is not supported`)
        }

        const provider = window.keplr

        await provider.enable(chainList)

        const offlineSigner = provider.getOfflineSigner(currentChain.network)
        const addressesList = await offlineSigner.getAccounts()
        const { address } = addressesList[0]!
        const addressShort = shortenAddress(address)
        const connectedWallets = await getCosmosConnectedWallets(provider)
        const addresesInfo = getAddresesInfo(connectedWallets)

        addWalletAddress(addresesInfo)
        updateWalletState('Keplr', {
          isConnected: true,
          status: WALLET_STATUS.READY,
          connectedWallets,
          name: 'Keplr',
          chainId,
          address,
          addressShort,
          provider
        })

        localStorage.setItem('web3-wallets-name', WALLET_NAMES.Keplr)
        localStorage.setItem(
          LOCAL_STORAGE_WALLETS_KEY,
          JSON.stringify({
            name: WALLET_NAMES.Keplr,
            chainId,
            address: addressShort
          })
        )

        return true
      }
    } catch (err: any) {
      updateWalletState('Keplr', { status: WALLET_STATUS.NOT_INITED })
      setActiveWalletName(null)

      console.error('[Wallet] connectWC error:', err)
      return false
    }

    return false
  }

  const connectSafe = async (): Promise<boolean> => {
    updateActiveWalletName('Safe')
    updateWalletState('Safe', { status: WALLET_STATUS.LOADING })

    try {
      const SafeAppsSDK = await import('@gnosis.pm/safe-apps-sdk').then(m => m.default)
      const { SafeAppProvider } = await import('@gnosis.pm/safe-apps-provider')
      const safeSdk = new SafeAppsSDK({
        allowedDomains: [/gnosis-safe.io/],
        debug: false
      })

      const safeInfo = await safeSdk.safe.getInfo()
      const safeProvider = new SafeAppProvider(safeInfo, safeSdk)
      const web3Provider = new Web3Provider(safeProvider, 'any')

      const {
        chainId,
        address,
        addressShort,
        addressDomain
      } = await fetchEvmWalletInfo(web3Provider)

      safeProvider.on('disconnect', (code: number, reason: string) => {
        console.log('safeProvider disconnected', code, reason)
        disconnect()
      })
      safeProvider.on('chainChanged', evmChainChangeHandler)
      safeProvider.on('accountsChanged', evmAccountChangeHandler)

      addWalletAddress({ [address]: EVM_CHAINS })
      updateWalletState('Safe', {
        isConnected: true,
        status: WALLET_STATUS.READY,
        name: WALLET_NAMES.Safe,
        subName: null,
        provider: web3Provider,
        walletProvider: safeProvider,
        chainId,
        address,
        addressShort,
        addressDomain
      })

      localStorage.setItem('web3-wallets-name', WALLET_NAMES.Safe)
      localStorage.setItem(
        LOCAL_STORAGE_WALLETS_KEY,
        JSON.stringify({
          name: WALLET_NAMES.Safe,
          chainId,
          address: addressDomain || addressShort
        })
      )

      return true
    } catch (err: any) {
      updateWalletState('Safe', { status: WALLET_STATUS.NOT_INITED })
      setActiveWalletName(null)

      console.error('[Wallet] connectSafe error:', err)
      throw new Error(err)
    }
  }

  const connect = async ({ name, chainId }: { name: string; chainId: number }): Promise<boolean> => {
    console.log('[Wallet] connect()', name, chainId)
    if (!(Object.values(WALLET_NAMES) as string[]).includes(name)) {
      console.error(`[Wallet] Unknown wallet name: ${name}`)
      return false
    }

    if (name === WALLET_NAMES.MetaMask) {
      if (!window.ethereum) {
        goMetamask()
        return false
      }
      updateActiveWalletName('MetaMask')
      return connectMetamask(chainId)
    }

    if (name === WALLET_NAMES.Coinbase) {
      if (!window.ethereum) {
        // TODO: Add link to coinbase
        return false
      }
      updateActiveWalletName('Coinbase')
      return connectCoinbase(chainId)
    }

    if (name === WALLET_NAMES.WalletConnect) {
      updateActiveWalletName('WalletConnect')
      return connectWC(chainId)
    }

    if (name === WALLET_NAMES.xDefi) {
      updateActiveWalletName('xDefi')
      return connectxDefi(chainId)
    }

    if (name === WALLET_NAMES.Phantom) {
      const isPhantomInstalled = window.solana && window.solana.isPhantom
      if (!isPhantomInstalled) {
        goPhantom()
        return false
      }
      updateActiveWalletName('Phantom')
      return connectPhantom(chainId)
    }

    if (name === WALLET_NAMES.Keplr) {
      const isKeplrInstalled = window.keplr

      if (!isKeplrInstalled) {
        goKeplr()
        return false
      }
      updateActiveWalletName('Keplr')
      return connectKeplr(chainId)
    }

    return false
  }

  const restore = async () => {
    console.log('Wallet.restore()')

    if (inIframe()) {
      const isSafeAutoconnected = await connectSafe()
      if (isSafeAutoconnected) {
        return true
      }
    }

    const walletData = localStorage.getItem(LOCAL_STORAGE_WALLETS_KEY)

    if (walletData) {
      const { name, chainId } = JSON.parse(walletData) as TWalletLocalData

      return connect({ name, chainId })
    }

    return false
  }

  const evmChainChangeHandler = async (chainIdHex: string) => {
    const chainId = parseInt(chainIdHex)
    console.log('* chainChanged', chainIdHex, chainId)

    updateWalletState(activeWalletNameRef.current, { chainId })
  }

  const evmChangeNetwork = async (params: any[]): Promise<boolean> => {
    if (!state.provider || !isEvmWallet(state)) {
      return false
    }
    const { provider } = state
    const newChainIdHex = params[0].chainId

    try {
      await provider.send('wallet_switchEthereumChain', [
        {
          chainId: newChainIdHex
        }
      ])
      return true
    } catch (error: any) {
      if (error.code === ERRCODE.UserRejected) {
        console.warn('[Wallet] User rejected the request')
        return false
      }

      if (error.code === ERRCODE.UnrecognizedChain || error.code === ERRCODE.UnrecognizedChain2) {
        // the chain has not been added to wallet
        try {
          console.log('[Wallet] Try to add the network...', params)
          await provider.send('wallet_addEthereumChain', params)
          // todo: Users can allow adding, but not allowing switching
          return true
        } catch (addNetworkError: any) {
          if (addNetworkError.code === ERRCODE.UserRejected) {
            console.warn('[Wallet] User rejected the request')
            return false
          }
          console.warn('[Wallet] Cant add the network:', addNetworkError)
          return false
        }
      }
      console.error('[Wallet] Cant change network:', error)
      return false
    }
  }

  const disconnect = () => {
    console.log('[Wallet] disconnect()')

    if (!state.name) {
      return false
    }

    if (isEvmWallet(state)) {
      if (state.walletProvider) {
        state.walletProvider.removeAllListeners()
        // @ts-expect-error-next-line WalletConnect Provider
        if (state.walletProvider?.disconnect) {
          // @ts-expect-error-next-line WalletConnect Provider
          state.walletProvider?.disconnect()
        }
      }
    }

    if (isSolWallet(state)) {
      window.solana.disconnect()
    }

    updateWalletState(activeWalletNameRef.current, {
      isConnected: false,
      name: null,
      status: WALLET_STATUS.NOT_INITED,
      provider: null,
      walletProvider: null,
      chainId: null,
      address: null,
      addressShort: null,
      addressDomain: null,
      balance: null,
      connection: null
    })

    setActiveWalletName(null)

    localStorage.removeItem('web3-wallets-name')
    localStorage.removeItem(LOCAL_STORAGE_WALLETS_KEY)
    localStorage.removeItem('isFirstInited')
  }

  const getNonce = async () => {
    const currentName = activeWalletNameRef.current

    if (!currentName) {
      throw new Error('Wallet is not connected')
    }

    const currentState = walletState[currentName]
    const isEvmConnected = isEvmWallet(currentState)
    if (!isEvmConnected || !currentState.address) {
      throw new Error('Wallet is not connected')
    }

    const { provider } = currentState
    return provider.getTransactionCount(currentState.address)
  }

  const evmAccountChangeHandler = async (accounts: string[]) => {
    console.log('* accountsChanged', accounts)

    if (!accounts.length) {
      disconnect()
    }

    const address = accounts[0]!
    const addressDomain = await getDomainAddress(address)

    addWalletAddress({ [address]: EVM_CHAINS })

    updateWalletState(activeWalletNameRef.current, {
      address,
      addressShort: shortenAddress(address),
      addressDomain
    })
  }

  const changeNetwork = async (chainId: number) => {
    console.log('[Wallet] changeNetwork()', chainId)
    if (!state.name) {
      return false
    }

    const network = getNetworkById(chainId)
    const { params } = network.data

    if (isEvmWallet(state)) {
      const isChanged = await evmChangeNetwork(params)
      if (isChanged) {
        localStorage.setItem(
          LOCAL_STORAGE_WALLETS_KEY,
          JSON.stringify({
            name: state.name,
            subName: state.subName,
            chainId,
            address: state.addressDomain || state.addressShort
          })
        )
      }
      return isChanged
    }

    console.error('[Wallet] changeNetwork error: not implemented')
    return false
  }

  const sendTx = async (
    transaction: TransactionRequest | Transaction | CosmosTransaction | BTClikeTransaction,
    params?: {
      signers?: Signer[]
      fromChainId?: number
    }
  ): Promise<string> => {
    const { fromChainId } = params || {}
    const currentName = fromChainId ? getActiveWalletName(walletState, fromChainId) : activeWalletNameRef.current

    if (!currentName) {
      throw new Error('[Wallet] sendTx error: no wallet name')
    }

    const currentState = walletState[currentName]
    // todo: sendTx reject => false
    console.log('[Wallet] sendTx', transaction)

    const isSolanaTransaction = 'partialSign' in transaction

    try {
      if (isSolanaTransaction) {
        const { Connection, clusterApiUrl } = await import('@solana/web3.js')
        const cluster = getCluster(currentState.chainId)
        const solanaNetwork = /* #__PURE__ */ clusterApiUrl(cluster)
        const connection = /* #__PURE__ */ new Connection(solanaNetwork)

        // @ts-expect-error need types for state provider
        transaction.feePayer = currentState.provider.publicKey
        console.warn('Getting recent blockhash')
        transaction.recentBlockhash = transaction.recentBlockhash || (await connection.getLatestBlockhash()).blockhash

        if (params?.signers?.length) {
          transaction.partialSign(...params.signers)
          console.log('partialSigned')
        }

        // @ts-expect-error Solana need to be refactored
        const signed = await currentState.provider.signTransaction(transaction)
        console.log('signed', signed)
        console.log('Got signature, submitting transaction...')
        const rawTx = signed.serialize()
        const signature = await connection.sendRawTransaction(rawTx)
        // todo: sendRawTransaction Commitment
        console.log('Tx submitted', signature)
        await (async () => {
          console.log('Waiting for network confirmation...')
          await connection.confirmTransaction(signature)
          console.log('Tx confirmed!', signature)
          console.log('See explorer:')
          console.log(`https://solscan.io/tx/${signature}${cluster === 'testnet' ? '?cluster=testnet' : ''}`)
        })()
        return signature
      } else if (isEvmWallet(currentState, fromChainId)) {
        // EVM tx
        const signer = currentState.provider!.getSigner()
        const tx = transaction as TransactionRequest

        try {
          // EVM + Safe tx
          if (currentState.name === WALLET_NAMES.WalletConnect && currentState.subName === WALLET_SUBNAME.Safe) {
          /*
            Safe cannot immediately return the transaction by design.
            Multi-signature can be done much later.
            It remains only to wait for the appearance of a new transaction from the sender's address (detectNewTxFromAddress)
          */
            return await Promise.race([
            // However, sendTransaction can still throw if the transaction is rejected by the user
              signer?.sendTransaction(tx) as never,
              detectNewTxFromAddress(currentState.address!, currentState.provider!)
            ])
          }

          // ordinary EVM tx
          const sendedTransaction = await signer?.sendTransaction(tx)
          return sendedTransaction.hash
        } catch (err: any) {
          if (err.code === ERRCODE.UserRejected || err.code === ERROR_MESSAGE.MetaMask) {
            console.warn('[Wallet] User rejected the request')
            throw new RejectRequestError()
          }
          throw err
        }
      } else if (isBTClikeWallet(currentState, fromChainId) && fromChainId) {
        const walletInfo = getWalletInfoByChainId(fromChainId)
        const provider = currentState.provider.getProviderByChainId(fromChainId)

        if (!walletInfo || !provider) {
          throw new Error(`[Wallet] sendTx error: no wallet info for chainId ${fromChainId}`)
        }
        try {
          const result = await provider.transfer(transaction as BTClikeTransaction)

          return result
        } catch (error: any) {
          if (error === ERROR_MESSAGE.xDeFi) {
            throw new RejectRequestError()
          }
          throw error
        }
      } else if (isCosmosWallet(currentState)) {
        try {
          return await executeCosmosTransaction(transaction as CosmosTransaction, currentState.provider)
        } catch (err: any) {
          if (err?.message === ERROR_MESSAGE.Keplr) {
            console.warn('[Wallet] User rejected the request')
            throw new RejectRequestError()
          }
          throw err
        }
      } else {
        throw new Error('[Wallet] sendTx error: wallet is not supported')
      }
    } catch (err) {
      console.error(`[Wallet] sendTx error: ${JSON.stringify(err)}`)
      throw err
    }
  }

  const signMessage = async (message: string, params?: { fromChainId?: number }): Promise<string> => {
    const { fromChainId } = params || {}
    const currentName = fromChainId ? getActiveWalletName(walletState, fromChainId) : activeWalletNameRef.current

    if (!currentName) {
      throw new Error('[Wallet] signMessage error: no wallet name')
    }

    const currentState = walletState[currentName]

    if (isEvmWallet(currentState, fromChainId)) {
      const signer = currentState.provider!.getSigner()
      return signer?.signMessage(message)
    } else {
      throw new Error(`[Wallet] signMessage error: ${currentName} is not supported`)
    }
  }

  const fetchEvmWalletInfo = async (provider: Web3Provider) => {
    const address = await provider.getSigner().getAddress()

    let addressDomain: string | null = null
    try {
      addressDomain = await getDomainAddress(address)
    } catch (e) {
      console.error(e)
    }

    const addressShort = shortenAddress(address)
    const { chainId } = await provider.getNetwork()

    return {
      chainId,
      address,
      addressShort,
      addressDomain
    }
  }

  const waitForTransaction = async (hash: string, { confirmations, fromChainId }: { confirmations?: number; fromChainId?: number } = {}): Promise<void> => {
    const currentChainId = fromChainId || state.chainId

    if (isSolWallet(state, currentChainId)) {
      const { Connection, clusterApiUrl } = await import('@solana/web3.js')
      const cluster = getCluster(currentChainId)
      const solanaNetwork = /* #__PURE__ */ clusterApiUrl(cluster)
      const connection = /* #__PURE__ */ new Connection(solanaNetwork)

      try {
        await connection.getTransaction(hash)
      } catch (e) {
        throw new Error('[Wallet] waitForTransaction error: execution reverted')
      }
    } else if (isEvmWallet(state, currentChainId)) {
      // EVM tx
      // Status 0 === Tx Reverted
      // @see https://docs.ethers.io/v5/api/providers/types/#providers-TransactionReceipt
      const REVERTED_STATUS = 0

      if (!state.provider) {
        throw new Error('[Wallet] waitForTransaction error: no provider')
      }

      const tx = await state.provider.waitForTransaction(hash, confirmations)
      if (!tx.confirmations || tx.status === REVERTED_STATUS) {
        throw new Error('[Wallet] waitForTransaction error: execution reverted')
      }
    }
    // todo: add cosmos support
  }

  const erc20SendToken = async (options: TErc20SendTokenOptions) => {
    const { chainId, contractAddress, toAddress, decimals, amount } = options
    const currentName = chainId ? getActiveWalletName(walletState, chainId) : activeWalletNameRef.current

    if (!currentName) {
      throw new Error('[Wallet] erc20SendToken error: no wallet name')
    }

    const currentState = walletState[currentName]

    if (isEvmWallet(currentState, chainId)) {
      try {
        const signer = currentState.provider!.getSigner()

        const contract = new ethers.Contract(
          contractAddress,
          ERC20Abi,
          signer
        )

        const tokensCount = ethers.utils.parseUnits(amount, decimals)
        const connection = await contract.connect(signer)
        const result = await connection.transfer(toAddress, tokensCount, { gasLimit: ERC20_GAS_LIMIT })

        return result
      } catch (err: any) {
        if (err.code === ERRCODE.UserRejected || err.code === ERROR_MESSAGE.MetaMask) {
          console.warn('[Wallet] User rejected the request')
          throw new RejectRequestError()
        }
        throw err
      }
    } else {
      throw new Error('[Wallet] erc20SendToken error: wallet is not supported')
    }
  }

  const signTypedData = ({
    domain,
    types,
    value
  }: SignTypedDataArgs<TypedData>): Promise<SignTypedDataResult> => {
    const { chainId: chainId_ } = domain
    const chainId = chainId_ ? normalizeChainId(chainId_) : undefined

    const currentName = chainId ? getActiveWalletName(walletState, chainId) : activeWalletNameRef.current

    if (!currentName) {
      throw new Error('[Wallet] signTypedData error: no wallet name')
    }

    const currentState = walletState[currentName]

    if (isEvmWallet(currentState, chainId)) {
      try {
        const signer = currentState.provider!.getSigner()

        // Method name may be changed in the future, see https://docs.ethers.io/v5/api/signer/#Signer-signTypedData
        return signer._signTypedData(domain, types as unknown as Record<string, TypedDataField[]>, value)
      } catch (err: any) {
        if (err.code === ERRCODE.UserRejected || err.code === ERROR_MESSAGE.MetaMask) {
          console.warn('[Wallet] User rejected the request')
          throw new RejectRequestError()
        }
        throw err
      }
    } else {
      throw new Error('[Wallet] erc20SendToken error: wallet is not supported')
    }
  }

  const getTransaction = async (hash: string) => {
    if (isEvmWallet(state)) {
      // Status 0 === Tx Reverted
      // @see https://docs.ethers.io/v5/api/providers/types/#providers-TransactionReceipt
      const REVERTED_STATUS = 0

      if (!state.provider) {
        throw new Error('[Wallet] getTransaction error: no provider')
      }

      const tx = await state.provider.getTransactionReceipt(hash)
      if (!tx.confirmations || tx.status === REVERTED_STATUS) {
        throw new Error('[Wallet] getTransaction error: execution reverted')
      }

      return tx
    } else {
      throw new Error('[Wallet] getTransaction error: method not supported yet')
    }
  }

  const setBalance = useCallback((balance: string | null) => updateWalletState(state.name, {
    balance
  }), [state.name])

  const providerState = useMemo(() => ({
    isConnected: state.isConnected,
    walletAddressesHistory,
    status: state.status,
    name: state.name,
    subName: state.subName,
    chainId: state.chainId,
    address: state.address,
    addressShort: state.addressShort,
    addressDomain: state.addressDomain,
    balance: state.balance,
    connection: state.connection,
    provider: state.provider,
    walletProvider: state.walletProvider,
    waitForTransaction,
    getTransaction,
    restore,
    connect,
    changeNetwork,
    connectedWallets: state.connectedWallets,
    sendTx,
    signMessage,
    signTypedData,
    disconnect,
    getNonce,
    walletState,
    erc20SendToken
  }), [state, walletAddressesHistory, waitForTransaction, getTransaction, restore, connect, changeNetwork, sendTx, disconnect, walletState])

  return (
    <WalletContext.Provider
    // @ts-expect-error https://linear.app/via-protocol/issue/FRD-640/ispravit-oshibku-s-tipami-v-web3-wallets
      value={providerState}
    >
      <QueryProvider>
        {children}
        <BalanceProvider options={state} setBalance={setBalance} />
      </QueryProvider>
    </WalletContext.Provider>
  )
}

export { WalletProvider }
