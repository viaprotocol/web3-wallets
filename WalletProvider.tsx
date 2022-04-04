/* eslint-disable */

import { useState, useEffect } from 'react'
import Web3 from 'web3'
import { ethers } from 'ethers'
import type { ExternalProvider, TransactionRequest, Web3Provider } from '@ethersproject/providers'

import WalletConnectProvider from '@walletconnect/web3-provider'

import { ToastContainer, Slide } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { MetaMaskInpageProvider } from '@metamask/providers'

import { Connection, clusterApiUrl, Transaction } from '@solana/web3.js'

import { getNetworkById, rpcMapping } from './networks'
import { getDomainAddress, goMetamask, goPhantom, shortenAddress, shortify } from './utils'
import { WalletContext } from './WalletContext'

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider
    solana: any
  }
}

const names = {
  WalletConnect: 'WalletConnect',
  MetaMask: 'MetaMask',
  Phantom: 'Phantom'
} as const

interface StateProps {
  isLoading: boolean
  isConnected: boolean
  name: null | 'WalletConnect' | 'MetaMask' | 'Phantom'
  provider: Web3Provider | null
  ethersProvider: ethers.providers.Web3Provider | null
  walletProvider: WalletConnectProvider | null
  web3: Web3 | null
  chainId: null | number | 'solana-testnet' | 'solana-mainnet'
  address: string | null
  addressShort: string | null
  addressDomain: string | null
}

const WalletProvider = props => {
  const [state, setState] = useState<StateProps>({
    isLoading: false,
    isConnected: false,
    name: null,
    provider: null,
    ethersProvider: null,
    walletProvider: null,
    web3: null,
    chainId: null,
    address: null,
    addressShort: null,
    addressDomain: null
  })

  const getDomain = async address => {
    if (!address) {
      return null
    }
    try {
      // ENS test
      //const address = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
      const answer = await (await fetch(`https://domains.1inch.io/reverse-lookup?address=${address}`)).json()
      const domain = answer.domain
      return domain
    } catch (e) {
      console.warn(`Can't get domain, ${e}`)
    }
    return null
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

  const connectMetamask = async (providedChainId: string | number): Promise<boolean> => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      return false
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum as unknown as ExternalProvider, 'any')
    const accounts = (await provider.send('eth_requestAccounts', [])) as string[]
    const address = accounts[0]
    const addressDomain = await getDomain(address)
    const chainId = (() => {
      const id = providedChainId ?? window.ethereum.chainId

      return typeof id === 'string' ? parseInt(id) : id
    })()

    setState(prev => ({
      ...prev,
      ...{
        isConnected: true,
        name: 'MetaMask',
        provider,
        //@ts-ignore
        web3: new Web3(window.ethereum),
        ethersProvider: provider,
        chainId,
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

  const connectWC = async (chainId_: number) => {
    const walletConnectProvider = new WalletConnectProvider({
      rpc: rpcMapping
    })

    await walletConnectProvider.enable()
    const web3Provider = new ethers.providers.Web3Provider(walletConnectProvider)

    walletConnectProvider.on('chainChanged', сhainChangeHandler)
    walletConnectProvider.on('accountsChanged', accountChangeHandler)
    web3Provider.on('chainChanged', сhainChangeHandler)
    web3Provider.on('accountsChanged', accountChangeHandler)

    await setState(prev => ({
      ...prev,
      ...{
        isConnected: true,
        name: 'WalletConnect',
        provider: web3Provider,
        walletProvider: walletConnectProvider
      }
    }))
  }

  const сhainChangeHandler = chainIdHex => {
    const chainId_ = parseInt(chainIdHex)
    console.log('* chainChanged', chainIdHex, chainId_)
    setState(prev => ({
      ...prev,
      ...{
        chainId: chainId_
      }
    }))
  }

  const accountChangeHandler = accounts => {
    if (!accounts.length) {
      // metamask disconnect
      disconnect()
    } else {
      fetchWalletInfo()
    }
  }

  const connectPhantom = async (chainId = 'solana-mainnet') => {
    if (chainId !== 'solana-testnet' && chainId !== 'solana-mainnet') {
      throw new Error(`Unknown Phantom chainId ${chainId}`)
    }
    try {
      const resp = await window.solana.connect()
      const address_ = resp.publicKey.toString()

      setState(prev => ({
        ...prev,
        ...{
          isConnected: true,
          name: 'Phantom',
          provider: window.solana,
          web3: null,
          chainId,
          address: address_,
          addressShort: shortenAddress(address_),
          addressDomain: null
        }
      }))

      localStorage.setItem('web3-wallets-name', names.Phantom)
      localStorage.setItem(
        'web3-wallets-data',
        JSON.stringify({
          name: names.Phantom,
          chainId
        })
      )

      return true
    } catch (err) {
      // @ts-ignore
      if (err.code === 4001) {
        console.warn('[Wallet] User rejected the request.')
        return false
      }
      console.error('[Wallet]', err)
    }
  }

  const metamaskChainChangeHandler = chainIdHex => {
    // todo: fix state
    /*if (!state.isConnected) {
      return
    }*/
    const chainId_ = parseInt(chainIdHex)
    console.log('* chainChanged', chainIdHex, chainId_)
    setState(prev => ({
      ...prev,
      ...{
        chainId: chainId_
      }
    }))
  }

  const metamaskAccountChangeHandler = async accounts => {
    console.log('* accountsChanged', accounts)

    // todo: fix state
    /*if (!state.isConnected) {
      return
    }*/

    if (!accounts.length) {
      // metamask disconnect
      disconnect()
    }

    const address_ = accounts[0]
    const addressDomain_ = await getDomain(address_)

    setState(prev => ({
      ...prev,
      ...{
        address: address_,
        addressShort: shortenAddress(address_),
        addressDomain: addressDomain_
      }
    }))
  }

  const connect = async ({ name, chainId }) => {
    console.log('Wallet.connect()', name, chainId)
    if (!names[name]) {
      console.error(`Unknown wallet name: ${name}`)
      return
    }

    if (name === 'MetaMask') {
      if (!window.ethereum || !window.ethereum.isMetaMask) {
        goMetamask()
        return false
      }
      return await connectMetamask(chainId)
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
      return await connectPhantom(chainId)
    }
  }

  const metamaskChangeNetwork = async params => {
    const newChainIdHex = params[0].chainId
    const { ethereum } = window

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: newChainIdHex
          }
        ]
      })
      return true
    } catch (error) {
      console.warn('Cant change network:', error)

      // @ts-ignore
      if (error.code === 4902) {
        // the chain has not been added to MetaMask
        try {
          console.log('Try to add the network...', params)
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: params
          })
          // todo:
          // Users can allow adding, but not allowing switching
          return true
        } catch (error) {
          console.warn('Cant add the network:', error)
          return false
        }
      }
    }
    return false
  }

  const changeNetwork = async (name, chainId) => {
    console.log('Wallet.changeNetwork()', chainId)

    const network = getNetworkById(chainId)
    const params = network.data.params
    // console.log('state.name', state.name)
    /*if (state.name === 'MetaMask') {*/
    // todo: stale state
    if (name === 'MetaMask') {
      const isChanged = await metamaskChangeNetwork(params)
      if (isChanged) {
        setState(prev => ({
          ...prev,
          ...{
            chainId: chainId
          }
        }))
        return true
      }
      return false
    }

    if (state.name === 'WalletConnect') {
      // todo (show new QR)
    }
  }

  const sendTx = async (transaction: TransactionRequest | Transaction, { signers = [] } = {}) => {
    console.log('[Wallet] sendTx', transaction)

    const isSolanaTransaction = transaction instanceof Transaction

    if (isSolanaTransaction) {
      let cluster
      if (state.chainId === 'solana-testnet') {
        cluster = 'testnet'
      }
      if (state.chainId === 'solana-mainnet') {
        cluster = 'mainnet-beta'
      }
      if (!cluster) {
        throw new Error(`Unknown state.chainId ${state.chainId} -> cluster ${cluster}`)
      }
      const solanaNetwork = clusterApiUrl(cluster)
      const connection = new Connection(solanaNetwork)
      const provider = window.solana

      transaction.feePayer = provider.publicKey
      console.log('Getting recent blockhash')
      transaction.recentBlockhash = transaction.recentBlockhash || (await connection.getRecentBlockhash()).blockhash

      if (signers.length) {
        transaction.partialSign(...signers)
        console.log('partialSigned')
      }

      try {
        const signed = await provider.signTransaction(transaction)
        console.log('signed', signed)
        console.log('Got signature, submitting transaction...')
        const rawTx = signed.serialize()
        let signature = await connection.sendRawTransaction(rawTx)
        // todo: sendRawTransaction Commitment
        console.log(`Tx submitted`, signature)
        ;(async () => {
          console.log(`Waiting for network confirmation...`)
          await connection.confirmTransaction(signature)
          console.log('Tx confirmed!', signature)
          console.log(`See explorer:`)
          console.log(`https://solscan.io/tx/${signature}${cluster === 'testnet' ? '?cluster=testnet' : ''}`)
        })()
        return signature
      } catch (err) {
        console.warn(err)
        console.log('[Wallet error] sendTransaction: ' + JSON.stringify(err))
      }
    } else {
      const signer = state.ethersProvider!.getSigner()

      return await signer?.sendTransaction(transaction)
    }
  }

  const disconnect = () => {
    console.log('Wallet.disconnect()')

    if (state.name === 'MetaMask') {
      if (state.provider) {
        state.provider.removeListener('chainChanged', metamaskChainChangeHandler)
        state.provider.removeListener('accountsChanged', metamaskAccountChangeHandler)
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
        web3: null,
        chainId: null,
        address: null,
        addressShort: null,
        addressDomain: null
      }
    }))

    localStorage.removeItem('web3-wallets-name')
    localStorage.removeItem('web3-wallets-data')
  }

  const fetchWalletInfo = async () => {
    if (state.provider) {
      const address = await state.provider.getSigner().getAddress()

      const addressDomain = await getDomainAddress(address, state.provider)

      const addressShort = shortify(address)
      const chainId = (await state.provider.getNetwork()).chainId

      setState(prev => ({
        ...prev,
        ...{
          chainId,
          address,
          addressShort,
          addressDomain
        }
      }))
    }
  }

  useEffect(() => {
    fetchWalletInfo()
  }, [state.provider])

  return (
    <WalletContext.Provider
      value={{
        isLoading: false, // todo
        isConnected: state.isConnected,
        name: state.name,
        chainId: state.chainId,
        address: state.address,
        addressShort: state.addressShort,
        addressDomain: state.addressDomain,
        web3: state.web3,
        provider: state.provider,
        restore,
        connect,
        changeNetwork,
        sendTx,
        disconnect
      }}
    >
      {props.children}
      <ToastContainer position="top-right" newestOnTop={true} transition={Slide} />
    </WalletContext.Provider>
  )
}

export default WalletProvider
