/* eslint-disable */
import type { ExternalProvider, TransactionRequest } from '@ethersproject/providers'
import { MetaMaskInpageProvider } from '@metamask/providers'
import { Connection, Signer, Transaction, clusterApiUrl } from '@solana/web3.js'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { BigNumber, ethers } from 'ethers'
import React, { useState } from 'react'
import { Slide, ToastContainer } from 'react-toastify'

import { INITIAL_STATE, WalletContext } from './WalletContext'
import { ERRCODE, LOCAL_STORAGE_WALLETS_KEY, NETWORK_IDS, WALLET_NAMES } from './constants'
import { getNetworkById, rpcMapping } from './networks'
import { IWalletStoreState, TWalletLocalData } from './types'
import { getDomainAddress, goMetamask, goPhantom, shortenAddress, useBalance } from './utils'
import { getCluster, parseEnsFromSolanaAddress } from './utils/solana'

import 'react-toastify/dist/ReactToastify.css'

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider
    solana: any
  }
}

function WalletProvider(props) {
  const [state, setState] = useState<IWalletStoreState>(INITIAL_STATE)

  const getDomain = async address => {
    if (!address) {
      return null
    }
    try {
      const { domain } = await (await fetch(`https://domains.1inch.io/reverse-lookup?address=${address}`)).json()
      return domain
    } catch (e) {
      console.warn(`Can't get domain, ${e}`)
    }
    return null
  }

  const getEvmBalance = async (provider: any, address: string) => {
    if (!provider) {
      return null
    }
    const balanceRaw = await provider.getBalance(address)
    return balanceRaw?.toString() ?? null
  }

  const connectMetamask = async (chainId: number): Promise<boolean> => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      return false
    }
    setState({ ...state, isLoading: true })

    const provider = new ethers.providers.Web3Provider(window.ethereum as unknown as ExternalProvider, 'any')

    try {
      await provider.send('eth_requestAccounts', [])
    } catch (e: any) {
      setState({ ...state, isLoading: false })
      if (e.code === ERRCODE.UserRejected) {
        console.warn('[Wallet] User rejected the request')
        return false
      } else {
        throw e
      }
    }

    let { chainId: walletChainId, address, addressShort, addressDomain, balance } = await fetchEvmWalletInfo(provider)

    const isNeedToChangeNetwork = chainId && walletChainId !== chainId

    if (isNeedToChangeNetwork) {
      const network = getNetworkById(chainId)
      if (!network.data.params) {
        setState({ ...state, isLoading: false })
        throw new Error(`Missing network ${chainId} params`)
      }
      const isChanged = await evmChangeNetwork(provider, network.data.params)
      if (isChanged) {
        walletChainId = network.chain_id
      }
    }
    const walletProvider = window.ethereum
    walletProvider.on('chainChanged', evmChainChangeHandler)
    walletProvider.on('accountsChanged', evmAccountChangeHandler)

    setState(prev => ({
      ...prev,
      ...{
        isConnected: true,
        isLoading: false,
        name: 'MetaMask',
        provider,
        walletProvider,
        chainId: walletChainId,
        address,
        addressShort,
        addressDomain,
        balance
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
    setState({ ...state, isLoading: true })
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
        addressDomain,
        balance
      } = await fetchEvmWalletInfo(web3Provider)

      const subName = walletConnectProvider.walletMeta?.name ?? null

      walletConnectProvider.on('disconnect', (code, reason) => {
        console.log('WalletConnectProvider disconnected', code, reason)
        disconnect() // todo: only clear state (without duplicate code and disconnect events)
      })
      walletConnectProvider.on('chainChanged', evmChainChangeHandler)
      walletConnectProvider.on('accountsChanged', evmAccountChangeHandler)

      setState(prev => ({
        ...prev,
        ...{
          isConnected: true,
          isLoading: false,
          name: 'WalletConnect',
          subName,
          provider: web3Provider,
          walletProvider: walletConnectProvider,
          chainId: walletChainId,
          address,
          addressShort,
          addressDomain,
          balance
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
      setState({ ...state, isLoading: false })
      if (err.toString().includes('User closed modal')) {
        return false
      }
      console.error('[Wallet] connectWC error:', err)
      throw new Error(err)
    }
  }

  const connectPhantom = async (chainId = NETWORK_IDS.Solana, isReconnect = false) => {
    if (chainId !== NETWORK_IDS.Solana && chainId !== NETWORK_IDS.SolanaTestnet) {
      throw new Error(`Unknown Phantom chainId ${chainId}`)
    }
    setState({ ...state, isLoading: true })
    try {
      const resp = isReconnect ? await window.solana.connect({ onlyIfTrusted: true }) : await window.solana.connect()
      const address = resp.publicKey.toString()
      const domain = await parseEnsFromSolanaAddress(address)
      const provider = window.solana
      const cluster = getCluster(chainId)
      const solanaNetwork = clusterApiUrl(cluster)
      const connection = new Connection(solanaNetwork)

      const balance = (await connection.getBalance(resp.publicKey, 'confirmed')) as unknown as string

      setState(prev => ({
        ...prev,
        ...{
          isConnected: true,
          isLoading: false,
          name: 'Phantom',
          provider,
          chainId,
          address,
          connection,
          addressShort: shortenAddress(address),
          addressDomain: domain,
          balance
        }
      }))

      localStorage.setItem('web3-wallets-name', WALLET_NAMES.Phantom)
      return true
    } catch (err: any) {
      setState({ ...state, isLoading: false })
      if (err.code === ERRCODE.UserRejected) {
        console.warn('[Wallet] User rejected the request.')
      }
      console.error('[Wallet]', err)
      return false
    }
  }

  const connect = async ({ name, chainId }): Promise<boolean> => {
    console.log('[Wallet] connect()', name, chainId)
    if (!WALLET_NAMES[name]) {
      console.error(`[Wallet] Unknown wallet name: ${name}`)
      return false
    }

    if (name === 'MetaMask') {
      if (!window.ethereum || !window.ethereum.isMetaMask) {
        goMetamask()
        return false
      }
      return connectMetamask(chainId)
    }

    if (name === 'WalletConnect') {
      return connectWC(chainId)
    }

    if (name === 'Phantom') {
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

  const evmChainChangeHandler = async chainIdHex => {
    const chainId = parseInt(chainIdHex)
    console.log('* chainChanged', chainIdHex, chainId)
    setState(prev => ({
      ...prev,
      ...{
        chainId
      }
    }))
  }

  const evmChangeNetwork = async (provider, params): Promise<boolean> => {
    const newChainIdHex = params[0].chainId
    setState({ ...state, isLoading: true })

    try {
      await provider.send('wallet_switchEthereumChain', [
        {
          chainId: newChainIdHex
        }
      ])
      setState({ ...state, isLoading: false })
      return true
    } catch (error: any) {
      if (error.code === ERRCODE.UserRejected) {
        setState({ ...state, isLoading: false })
        console.warn('[Wallet] User rejected the request')
        return false
      }

      if (error.code === ERRCODE.UnrecognizedChain || error.code === ERRCODE.UnrecognizedChain2) {
        // the chain has not been added to MetaMask
        try {
          console.log('[Wallet] Try to add the network...', params)
          await provider.send('wallet_addEthereumChain', params)
          setState({ ...state, isLoading: false })
          // todo: Users can allow adding, but not allowing switching
          return true
        } catch (addNetworkError: any) {
          setState({ ...state, isLoading: false })
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

    if (state.name === 'MetaMask' || state.name === 'WalletConnect') {
      if (state.walletProvider) {
        state.walletProvider.removeAllListeners()
        if (state.walletProvider instanceof WalletConnectProvider) {
          state.walletProvider?.disconnect()
        }
      }
    }

    if (state.name === 'Phantom') {
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

  const evmAccountChangeHandler = async accounts => {
    console.log('* accountsChanged', accounts)

    if (!accounts.length) {
      disconnect()
    }

    const address = accounts[0]
    const addressDomain = await getDomain(address)
    const balance = await getEvmBalance(state.provider, address)

    setState(prev => ({
      ...prev,
      ...{
        address,
        addressShort: shortenAddress(address),
        addressDomain,
        balance
      }
    }))
  }

  const changeNetwork = async (chainId: number) => {
    console.log('[Wallet] changeNetwork()', chainId)

    const network = getNetworkById(chainId)
    const { params } = network.data

    if (state.name === 'MetaMask' || state.name === 'WalletConnect') {
      const isChanged = await evmChangeNetwork(state.provider, params)
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

      // @ts-ignore
      transaction.feePayer = state.provider.publicKey
      console.log('Getting recent blockhash')
      transaction.recentBlockhash = transaction.recentBlockhash || (await connection.getLatestBlockhash()).blockhash

      if (params?.signers?.length) {
        transaction.partialSign(...params.signers)
        console.log('partialSigned')
      }

      try {
        // @ts-ignore
        const signed = await state.provider.signTransaction(transaction)
        console.log('signed', signed)
        console.log('Got signature, submitting transaction...')
        const rawTx = signed.serialize()
        const signature = await connection.sendRawTransaction(rawTx)
        // todo: sendRawTransaction Commitment
        console.log(`Tx submitted`, signature)
        await (async () => {
          console.log(`Waiting for network confirmation...`)
          await connection.confirmTransaction(signature)
          console.log('Tx confirmed!', signature)
          console.log(`See explorer:`)
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
          throw err //return false // todo: sendTx reject => false
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
    const balance = await getEvmBalance(provider, address)

    let addressDomain
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
      addressDomain,
      balance
    }
  }

  const balance = useBalance(state)

  return (
    <WalletContext.Provider
      value={{
        isConnected: state.isConnected,
        isLoading: state.isLoading,
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
        waitForTransaction: state.provider?.waitForTransaction?.bind(state.provider) ?? null,
        restore,
        connect,
        changeNetwork,
        sendTx,
        disconnect
      }}
    >
      {props.children}
      <ToastContainer position="top-right" newestOnTop transition={Slide} />
    </WalletContext.Provider>
  )
}

export default WalletProvider
