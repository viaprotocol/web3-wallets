/* 🚧 NEED TO BE REFACTORED 🚧 */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prefer-const */

import type { ExternalProvider, TransactionRequest } from '@ethersproject/providers'
import type { Signer } from '@solana/web3.js'
import { Connection, Transaction, clusterApiUrl } from '@solana/web3.js'
import WalletConnectProvider from '@walletconnect/web3-provider'
import type { BigNumber } from 'ethers'
import { ethers } from 'ethers'
import React, { useState } from 'react'

import { ERRCODE, LOCAL_STORAGE_WALLETS_KEY, NETWORK_IDS, WALLET_NAMES } from '../constants'
import { getNetworkById, rpcMapping } from '../networks'
import type { TWalletLocalData, TWalletStoreState } from '../types'
import { WalletStatusEnum } from '../types'
import { getCluster, getDomainAddress, goMetamask, goPhantom, parseEnsFromSolanaAddress, shortenAddress } from '../utils'
import { useBalance } from '../hooks'
import { INITIAL_STATE, WalletContext } from './WalletContext'
import { EVM_WALLETS_CONFIG, SOL_WALLETS_CONFIG } from '@/hooks/useBalance/config'

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    solana: any
  }
}

const WalletProvider = function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TWalletStoreState>(INITIAL_STATE)

  const connectCoinbase = async (chainId: number): Promise<boolean> => {
    if (!window.ethereum) {
      return false
    }

    setState(prev => ({ ...prev, status: WalletStatusEnum.LOADING }))

    try {
      const CoinbaseWalletSDK = (await import('@coinbase/wallet-sdk')).default
      const coinbase = new CoinbaseWalletSDK({
        appName: document.title
      })

      const rpcUrl = rpcMapping[chainId]
      const walletProvider = coinbase.makeWeb3Provider(rpcUrl, chainId)

      const provider = new ethers.providers.Web3Provider(walletProvider as unknown as ExternalProvider, 'any')
      await provider.send('eth_requestAccounts', [])

      let { chainId: walletChainId, address, addressShort, addressDomain } = await fetchEvmWalletInfo(provider)

      const isNeedToChangeNetwork = chainId && walletChainId !== chainId

      if (isNeedToChangeNetwork) {
        const network = getNetworkById(chainId)
        if (!network.data.params) {
          setState(prev => ({ ...prev, status: WalletStatusEnum.NOT_INITED }))
          throw new Error(`Missing network ${chainId} params`)
        }
        const isChanged = await evmChangeNetwork(network.data.params)
        if (isChanged) {
          walletChainId = network.chain_id
        }
      }

      walletProvider.on('chainChanged', evmChainChangeHandler as any)
      walletProvider.on('accountsChanged', evmAccountChangeHandler as any)

      setState(prev => ({
        ...prev,
        ...{
          isConnected: true,
          status: WalletStatusEnum.READY,
          name: WALLET_NAMES.Coinbase,
          provider,
          walletProvider,
          chainId: walletChainId,
          address,
          addressShort,
          addressDomain
        }
      }))

      localStorage.setItem('web3-wallets-name', WALLET_NAMES.Coinbase)
      localStorage.setItem(
        LOCAL_STORAGE_WALLETS_KEY,
        JSON.stringify({
          name: WALLET_NAMES.Coinbase,
          chainId,
          address: addressDomain || addressShort
        })
      )

      return true
    } catch (e: any) {
      setState(prev => ({ ...prev, status: WalletStatusEnum.NOT_INITED }))
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

    const ethereum: any = window.ethereum
    setState(prev => ({ ...prev, status: WalletStatusEnum.LOADING }))

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

    const provider = new ethers.providers.Web3Provider(walletProvider as ExternalProvider, 'any')

    try {
      await provider.send('eth_requestAccounts', [])
    } catch (e: any) {
      setState(prev => ({ ...prev, status: WalletStatusEnum.NOT_INITED }))
      if (e.code === ERRCODE.UserRejected) {
        console.warn('[Wallet] User rejected the request')
        return false
      } else {
        throw e
      }
    }

    let { chainId: walletChainId, address, addressShort, addressDomain } = await fetchEvmWalletInfo(provider)

    const isNeedToChangeNetwork = chainId && walletChainId !== chainId

    if (isNeedToChangeNetwork) {
      const network = getNetworkById(chainId)
      if (!network.data.params) {
        setState(prev => ({ ...prev, status: WalletStatusEnum.NOT_INITED }))
        throw new Error(`Missing network ${chainId} params`)
      }
      const isChanged = await evmChangeNetwork(network.data.params)
      if (isChanged) {
        walletChainId = network.chain_id
      }
    }

    walletProvider.on('chainChanged', evmChainChangeHandler as any)
    walletProvider.on('accountsChanged', evmAccountChangeHandler as any)

    setState(prev => ({
      ...prev,
      ...{
        isConnected: true,
        status: WalletStatusEnum.READY,
        name: WALLET_NAMES.MetaMask,
        provider,
        walletProvider,
        chainId: walletChainId,
        address,
        addressShort,
        addressDomain
      }
    }))

    localStorage.setItem('web3-wallets-name', WALLET_NAMES.MetaMask)
    localStorage.setItem(
      LOCAL_STORAGE_WALLETS_KEY,
      JSON.stringify({
        name: WALLET_NAMES.MetaMask,
        chainId,
        address: addressDomain || addressShort
      })
    )

    return true
  }

  const connectWC = async (chainId: number): Promise<boolean> => {
    setState(prev => ({ ...prev, status: WalletStatusEnum.LOADING }))
    try {
      const walletConnectProvider = new WalletConnectProvider({
        rpc: rpcMapping,
        chainId
      })

      await walletConnectProvider.enable()
      const web3Provider = new ethers.providers.Web3Provider(walletConnectProvider, 'any')

      const {
        chainId: walletChainId,
        address,
        addressShort,
        addressDomain
      } = await fetchEvmWalletInfo(web3Provider)

      const subName = walletConnectProvider.walletMeta?.name || null

      walletConnectProvider.on('disconnect', (code: number, reason: string) => {
        console.log('WalletConnectProvider disconnected', code, reason)
        disconnect() // todo: only clear state (without duplicate code and disconnect events)
      })
      walletConnectProvider.on('chainChanged', evmChainChangeHandler)
      walletConnectProvider.on('accountsChanged', evmAccountChangeHandler)

      setState(prev => ({
        ...prev,
        ...{
          isConnected: true,
          status: WalletStatusEnum.READY,
          name: WALLET_NAMES.WalletConnect,
          subName,
          provider: web3Provider,
          walletProvider: walletConnectProvider,
          chainId: walletChainId,
          address,
          addressShort,
          addressDomain
        }
      }))

      localStorage.setItem('web3-wallets-name', WALLET_NAMES.WalletConnect)
      localStorage.setItem(
        LOCAL_STORAGE_WALLETS_KEY,
        JSON.stringify({
          name: WALLET_NAMES.WalletConnect,
          chainId,
          address: addressDomain || addressShort
        })
      )

      return true
    } catch (err: any) {
      setState(prev => ({ ...prev, status: WalletStatusEnum.NOT_INITED }))
      if (err.toString().includes('User closed modal')) {
        return false
      }
      console.error('[Wallet] connectWC error:', err)
      throw new Error(err)
    }
  }

  const connectPhantom = async (chainId: number = NETWORK_IDS.Solana, isReconnect = false) => {
    if (chainId !== NETWORK_IDS.Solana && chainId !== NETWORK_IDS.SolanaTestnet) {
      throw new Error(`Unknown Phantom chainId ${chainId}`)
    }
    setState(prev => ({ ...prev, status: WalletStatusEnum.LOADING }))
    try {
      const resp = isReconnect ? await window.solana.connect({ onlyIfTrusted: true }) : await window.solana.connect()
      const address = resp.publicKey.toString()
      const addressDomain = await parseEnsFromSolanaAddress(address)
      const provider = window.solana
      const cluster = getCluster(chainId)
      const solanaNetwork = clusterApiUrl(cluster)
      const connection = new Connection(solanaNetwork)
      const addressShort = shortenAddress(address)

      setState(prev => ({
        ...prev,
        ...{
          isConnected: true,
          status: WalletStatusEnum.READY,
          name: 'Phantom',
          provider,
          chainId,
          address,
          connection,
          addressShort,
          addressDomain
        }
      }))

      localStorage.setItem('web3-wallets-name', WALLET_NAMES.Phantom)
      localStorage.setItem(
        LOCAL_STORAGE_WALLETS_KEY,
        JSON.stringify({
          name: WALLET_NAMES.Phantom,
          chainId,
          address: addressDomain || addressShort
        })
      )
      return true
    } catch (err: any) {
      setState(prev => ({ ...prev, status: WalletStatusEnum.NOT_INITED }))
      if (err.code === ERRCODE.UserRejected) {
        console.warn('[Wallet] User rejected the request.')
      }
      console.error('[Wallet]', err)
      return false
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
      return connectMetamask(chainId)
    }

    if (name === WALLET_NAMES.Coinbase) {
      if (!window.ethereum) {
        // TODO: Add link to coinbase
        return false
      }
      return connectCoinbase(chainId)
    }

    if (name === WALLET_NAMES.WalletConnect) {
      return connectWC(chainId)
    }

    if (name === WALLET_NAMES.Phantom) {
      const isPhantomInstalled = window.solana && window.solana.isPhantom
      if (!isPhantomInstalled) {
        goPhantom()
        return false
      }
      return connectPhantom(chainId)
    }

    return false
  }

  const restore = async () => {
    console.log('Wallet.restore()')
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
    setState(prev => ({ ...prev, chainId }))
  }

  const evmChangeNetwork = async (params: any[]): Promise<boolean> => {
    const { provider } = state
    if (!provider) {
      return false
    }
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

    if (EVM_WALLETS_CONFIG.includes(state.name)) {
      if (state.walletProvider) {
        state.walletProvider.removeAllListeners()
        if (state.walletProvider instanceof WalletConnectProvider) {
          state.walletProvider?.disconnect()
        }
      }
    }

    if (SOL_WALLETS_CONFIG.includes(state.name)) {
      window.solana.disconnect()
    }

    setState(prev => ({
      ...prev,
      ...{
        isConnected: false,
        name: null,
        provider: null,
        walletProvider: null,
        chainId: null,
        address: null,
        addressShort: null,
        addressDomain: null,
        balance: null,
        connection: null
      }
    }))

    localStorage.removeItem('web3-wallets-name')
    localStorage.removeItem(LOCAL_STORAGE_WALLETS_KEY)
    localStorage.removeItem('isFirstInited')
  }

  const evmAccountChangeHandler = async (accounts: string[]) => {
    console.log('* accountsChanged', accounts)

    if (!accounts.length) {
      disconnect()
    }

    const address = accounts[0]
    const addressDomain = await getDomainAddress(address)

    setState(prev => ({
      ...prev,
      ...{
        address,
        addressShort: shortenAddress(address),
        addressDomain
      }
    }))
  }

  const changeNetwork = async (chainId: number) => {
    console.log('[Wallet] changeNetwork()', chainId)
    if (!state.name) {
      return false
    }

    const network = getNetworkById(chainId)
    const { params } = network.data

    if (EVM_WALLETS_CONFIG.includes(state.name)) {
      const isChanged = await evmChangeNetwork(params)
      if (isChanged) {
        localStorage.setItem(
          LOCAL_STORAGE_WALLETS_KEY,
          JSON.stringify({
            name: state.name,
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
    transaction: TransactionRequest | Transaction,
    params?: {
      signers?: Signer[]
    }
  ): Promise<string /* | false */> => {
    // todo: sendTx reject => false
    console.log('[Wallet] sendTx', transaction)

    const isSolanaTransaction = transaction instanceof Transaction

    if (isSolanaTransaction) {
      const cluster = getCluster(state.chainId)
      const solanaNetwork = clusterApiUrl(cluster)
      const connection = new Connection(solanaNetwork)

      // @ts-expect-error need types for state provider
      transaction.feePayer = state.provider.publicKey
      console.warn('Getting recent blockhash')
      transaction.recentBlockhash = transaction.recentBlockhash || (await connection.getLatestBlockhash()).blockhash

      if (params?.signers?.length) {
        transaction.partialSign(...params.signers)
        console.log('partialSigned')
      }

      try {
        // @ts-expect-error Solana need to be refactored
        const signed = await state.provider.signTransaction(transaction)
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
      } catch (err) {
        console.error(`[Wallet] sendTx error: ${JSON.stringify(err)}`)
        throw err
      }
    } else {
      // EVM tx
      const signer = state.provider!.getSigner()

      try {
        const sendedTransaction = await signer?.sendTransaction(transaction)
        return sendedTransaction.hash
      } catch (err: any) {
        if (err.code === ERRCODE.UserRejected) {
          console.warn('[Wallet] User rejected the request')
          throw err // return false // todo: sendTx reject => false
        }
        console.error(`[Wallet] sendTx error: ${JSON.stringify(err)}`)
        throw err
      }
    }
    // return false // todo: sendTx reject => false
  }

  const estimateGas = async (data: TransactionRequest): Promise<BigNumber | undefined> => {
    return state.provider?.estimateGas(data)
  }

  const fetchEvmWalletInfo = async (provider: ethers.providers.Web3Provider) => {
    const address = await provider.getSigner().getAddress()

    let addressDomain = null
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

  const waitForTransaction = async (hash: string, confirmations?: number): Promise<void> => {
    const { chainId } = state

    if (chainId === NETWORK_IDS.Solana) {
      const cluster = getCluster(state.chainId)
      const solanaNetwork = clusterApiUrl(cluster)
      const connection = new Connection(solanaNetwork)

      try {
        await connection.getTransaction(hash)
      } catch (e) {
        throw new Error('[Wallet] waitForTransaction error: execution reverted')
      }
    } else {
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
  }

  const balance = useBalance(state)

  return (
    <WalletContext.Provider
      value={{
        isConnected: state.isConnected,
        status: state.status,
        name: state.name,
        subName: state.subName,
        chainId: state.chainId,
        address: state.address,
        addressShort: state.addressShort,
        addressDomain: state.addressDomain,
        balance: balance || state.balance,
        connection: state.connection,
        estimateGas,
        provider: state.provider,
        walletProvider: state.walletProvider,
        waitForTransaction,
        restore,
        connect,
        changeNetwork,
        sendTx,
        disconnect
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export { WalletProvider }
