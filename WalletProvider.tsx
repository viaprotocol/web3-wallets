/* eslint-disable */
import React, { useState } from 'react'
import { BigNumber, ethers } from 'ethers'
import type { ExternalProvider, TransactionRequest } from '@ethersproject/providers'

import WalletConnectProvider from '@walletconnect/web3-provider'

import { Slide, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { MetaMaskInpageProvider } from '@metamask/providers'

import { clusterApiUrl, Connection, Signer, Transaction } from '@solana/web3.js'

import { getNetworkById, rpcMapping } from './networks'
import { getDomainAddress, goMetamask, goPhantom, shortenAddress, useBalance } from './utils'

import { getCluster, parseEnsFromSolanaAddress } from './utils/solana'

import { INITIAL_STATE, WalletContext } from './WalletContext'
import { IWalletStoreState } from './types'

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider
    solana: any
  }
}

const names = {
  WalletConnect: 'WalletConnect',
  MetaMask: 'MetaMask',
  Phantom: 'Phantom',
  Near: 'Near'
} as const

function WalletProvider(props) {
  const [state, setState] = useState<IWalletStoreState>(INITIAL_STATE)

  const getDomain = async address => {
    if (!address) {
      return null
    }
    try {
      // ENS test
      //const address = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
      const answer = await (await fetch(`https://domains.1inch.io/reverse-lookup?address=${address}`)).json()
      const { domain } = answer
      return domain
    } catch (e) {
      console.warn(`Can't get domain, ${e}`)
    }
    return null
  }

  const getBalance = async (provider: any, address: string) => {
    if (!provider) {
      return null
    }
    const balanceRaw = provider.getBalance(address)
    const balance = balanceRaw?.toString() ?? null
    return balance
  }

  const connectMetamask = async (chainId: number): Promise<boolean> => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      return false
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum as unknown as ExternalProvider, 'any')

    let accounts
    try {
      accounts = (await provider.send('eth_requestAccounts', [])) as string[]
    } catch (e) {
      // @ts-ignore
      if (e.code === 4001) {
        console.warn('User rejected the request', e)
        return false
      } else {
        throw e
      }
    }
    const address = accounts[0]
    const addressDomain = await getDomain(address)

    const providerChainIdHex = window.ethereum.chainId
    const providerChainId = typeof providerChainIdHex === 'string' ? parseInt(providerChainIdHex, 16) : null
    let connectedChainId = providerChainId

    const isNeedToChangeNetwork = chainId && providerChainId !== chainId

    if (isNeedToChangeNetwork) {
      const network = getNetworkById(chainId)
      if (!network.data.params) {
        throw new Error(`Missing network ${chainId} params`)
      }
      const isChanged = await evmChangeNetwork(network.data.params)
      if (isChanged) {
        connectedChainId = network.chain_id
      }
    }

    window.ethereum.on('chainChanged', metamaskChainChangeHandler)
    window.ethereum.on('accountsChanged', metamaskAccountChangeHandler)

    setState(prev => ({
      ...prev,
      ...{
        isConnected: true,
        name: 'MetaMask',
        provider,
        walletProvider: window.ethereum,
        chainId: connectedChainId,
        address,
        addressShort: shortenAddress(address),
        addressDomain
      }
    }))

    localStorage.setItem('web3-wallets-name', names.MetaMask)
    localStorage.setItem(
      'web3-wallets-data',
      JSON.stringify({
        name: names.MetaMask,
        chainId
      })
    )

    return true
  }

  const connectWC = async (chainId: number): Promise<boolean> => {
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

    walletConnectProvider.on('disconnect', (code: number, reason: string) => {
      console.log('Wallet.onDisconnect()', code, reason)
      disconnect()
    })

    await setState(prev => ({
      ...prev,
      ...{
        isConnected: true,
        name: 'WalletConnect',
        provider: web3Provider,
        walletProvider: walletConnectProvider,
        chainId: walletChainId,
        address,
        addressShort,
        addressDomain,
        balance
      }
    }))

    localStorage.setItem('web3-wallets-name', names.WalletConnect)
    localStorage.setItem(
      'web3-wallets-data',
      JSON.stringify({
        name: names.WalletConnect,
        chainId
      })
    )

    return true
  }

  const connectPhantom = async (chainId = -1, isReconnect = false) => {
    if (chainId !== -1 && chainId !== -1001) {
      throw new Error(`Unknown Phantom chainId ${chainId}`)
    }
    try {
      const resp = isReconnect ? await window.solana.connect({ onlyIfTrusted: true }) : await window.solana.connect()
      const address = resp.publicKey.toString()
      const domain = await parseEnsFromSolanaAddress(address)
      const provider = window.solana
      const cluster = getCluster(chainId)
      const solanaNetwork = clusterApiUrl(cluster)
      const connection = new Connection(solanaNetwork)

      setState(prev => ({
        ...prev,
        ...{
          isConnected: true,
          name: 'Phantom',
          provider,
          chainId,
          address,
          connection,
          addressShort: shortenAddress(address),
          addressDomain: domain
        }
      }))

      localStorage.setItem('web3-wallets-name', names.Phantom)
      return true
    } catch (err) {
      // @ts-ignore
      if (err.code === 4001) {
        console.warn('[Wallet] User rejected the request.')
      }
      console.error('[Wallet]', err)
      return false
    }
  }

  const connect = async ({ name, chainId }): Promise<boolean> => {
    console.log('Wallet.connect()', name, chainId)
    if (!names[name]) {
      console.error(`Unknown wallet name: ${name}`)
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
    const walletData = localStorage.getItem('web3-wallets-data')

    if (walletData) {
      const { name, chainId } = JSON.parse(walletData) as {
        name: string
        chainId: string | number
      }

      return connect({ name, chainId })
    }

    return false
  }

  const metamaskChainChangeHandler = async chainIdHex => {
    const chainId = parseInt(chainIdHex)
    console.log('* chainChanged', chainIdHex, chainId)
    setState(prev => ({
      ...prev,
      ...{
        chainId
      }
    }))
  }

  const evmChangeNetwork = async (params): Promise<boolean> => {
    const newChainIdHex = params[0].chainId

    if (!state.provider) return false

    try {
      await state.provider.send('wallet_switchEthereumChain', [
        {
          chainId: newChainIdHex
        }
      ])
      return true
    } catch (error) {
      console.warn('Cant change network:', error)

      // the chain has not been added to MetaMask
      try {
        console.log('Try to add the network...', params)
        await state.provider.send('wallet_addEthereumChain', params)
        // todo:
        // Users can allow adding, but not allowing switching
        return true
      } catch (addError) {
        console.warn('Cant add the network:', addError)
        return false
      }
    }
  }

  const disconnect = () => {
    console.log('Wallet.disconnect()')

    if (state.name !== 'Phantom') {
      if (state.walletProvider) {
        state.walletProvider.removeListener('chainChanged', metamaskChainChangeHandler)
        state.walletProvider.removeListener('accountsChanged', metamaskAccountChangeHandler)
        // @ts-ignore
        if (state.walletProvider?.close) {
          // @ts-ignore
          state.walletProvider?.close()
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
    localStorage.removeItem('web3-wallets-data')
    localStorage.removeItem('isFirstInited')
  }

  const metamaskAccountChangeHandler = async accounts => {
    console.log('* accountsChanged', accounts)

    if (!accounts.length) {
      disconnect()
    }

    const address = accounts[0]
    const addressDomain = await getDomain(address)
    const balance = await getBalance(state.provider, address)

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
    console.log('Wallet.changeNetwork()', chainId)

    const network = getNetworkById(chainId)
    const { params } = network.data

    if (state.name !== 'Phantom') {
      const isChanged = await evmChangeNetwork(params)
      if (isChanged) {
        setState(prev => ({
          ...prev,
          ...{
            chainId: chainId as number
          }
        }))
        return true
      }
    }

    return false
  }

  const sendTx = async (
    transaction: TransactionRequest | Transaction,
    params?: {
      signers?: Signer[]
    }
  ): Promise<string> => {
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
        console.warn(err)
        console.log(`[Wallet error] sendTransaction: ${JSON.stringify(err)}`)

        throw err
      }
    } else {
      const signer = state.provider!.getSigner()

      const sendedTransaction = await signer?.sendTransaction(transaction)

      return sendedTransaction.hash
    }
  }

  const estimateGas = async (data: TransactionRequest): Promise<BigNumber | undefined> => {
    return state.provider?.estimateGas(data)
  }

  const fetchEvmWalletInfo = async (provider) => {
    const address = await provider.getSigner().getAddress()
    const balance = await getBalance(provider, address)

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
        name: state.name,
        chainId: state.chainId,
        address: state.address,
        addressShort: state.addressShort,
        addressDomain: state.addressDomain,
        balance,
        connection: state.connection,
        estimateGas,
        provider: state.provider,
        walletProvider: state.walletProvider,
        getTransactionReceipt: state.provider?.getTransactionReceipt.bind(state.provider),
        restore,
        connect,
        changeNetwork,
        sendTx,
        disconnect
      }}
    >
      {/* eslint-disable-next-line react/destructuring-assignment */}
      {props.children}
      <ToastContainer position="top-right" newestOnTop transition={Slide} />
    </WalletContext.Provider>
  )
}

export default WalletProvider
