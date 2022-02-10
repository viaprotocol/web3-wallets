/* eslint-disable */

import React, { useState, createContext, useEffect } from 'react'
import { ethers } from 'ethers'

import isMobile from 'ismobilejs'

import WalletConnectProvider from '@walletconnect/web3-provider'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { MetaMaskInpageProvider } from '@metamask/providers'

import {
  Connection,
  Transaction,
  clusterApiUrl,
  SystemProgram,
} from '@solana/web3.js'

import { getNetworkById, rpcMapping } from './networks'
import { TransactionRequest, Web3Provider } from '@ethersproject/providers'

const SOLANA_NETWORK = clusterApiUrl('testnet'/*'mainnet-beta'*/)

declare global {
  interface Window {
    ethereum: any
    solana: any
  }
}


interface WalletInterface {
  isLoading: boolean
  isConnected: boolean
  name: null | 'WalletConnect' | 'MetaMask' | 'Phantom'
  chainId: null | number
  address: string | null
  addressShort: string | null
  addressDomain: null | string
  provider: any // 📌 TODO: add interface
  walletProvider: any
  restore: Function
  connect: Function
  changeNetwork: Function
  sendTx: Function
  disconnect: Function
}

export const WalletContext = createContext<WalletInterface>({
  isLoading: false,
  isConnected: false,
  name: null,
  chainId: null,
  address: '',
  addressShort: '',
  addressDomain: null,
  provider: null,
  walletProvider: null,
  restore: () => {},
  connect: () => {},
  changeNetwork: () => {},
  sendTx: () => {},
  disconnect: () => {},
})


const names = {
  'WalletConnect': 'WalletConnect',
  'MetaMask': 'MetaMask',
  'Phantom': 'Phantom',
}

const goMetamask = () => {
  if (isMobile(window.navigator).any) {
    const url = window.location.host + window.location.pathname
    const deepLink = `https://metamask.app.link/dapp/${url}`
    window.location.href = deepLink
  }
  if (!isMobile(window.navigator).any) {
    window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn')
  }
}

const goPhantom = () => {
  const url = 'https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa'
  if (window) {
    window.open(url, '_blank')
  }
}

interface StateProps {
  isLoading: boolean
  isConnected: boolean
  name: null | 'WalletConnect' | 'MetaMask' | 'Phantom'
  provider: null | Web3Provider
  walletProvider: any
  chainId: number | null
  address: string | null
  addressShort: string | null
  addressDomain: string | null
}

const Wallet = (props) => {

  const [state, setState] = useState<StateProps>({
    isLoading: false,
    isConnected: false,
    name: null,
    provider: null,
    chainId: null,
    address: null,
    addressShort: null,
    addressDomain: null,
    walletProvider: null,
  })

  const shortify = (address) => {
    const result = typeof address === 'string'
      ? `${address.slice(0, 6)}...${address.slice(address.length - 4)}`
      : null
    return result
  }

  const restore = async () => {
    console.log('Wallet.restore()')

    return connectMetamask()
  }

  const connectMetamask = async (chainId?: string | number) => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      return
    }

    const walletProvider = window.ethereum

    await walletProvider.enable()
    const web3Provider = new ethers.providers.Web3Provider(walletProvider)


    walletProvider.on('chainChanged', сhainChangeHandler)
    walletProvider.on('accountsChanged', accountChangeHandler)

    await setState(prev => ({...prev, ...{
      isConnected: true,
      name: 'MetaMask',
      walletProvider: walletProvider,
      provider: web3Provider,
    }}))
  }

  const connectWC = async (chainId_: number) => {
    const walletConnectProvider = new WalletConnectProvider({
      rpc: rpcMapping
    })

    await walletConnectProvider.enable()
    const web3Provider = new ethers.providers.Web3Provider(walletConnectProvider);

    walletConnectProvider.on('chainChanged', сhainChangeHandler)
    walletConnectProvider.on('accountsChanged', accountChangeHandler)
    web3Provider.on('chainChanged', сhainChangeHandler)
    web3Provider.on('accountsChanged', accountChangeHandler)

    await setState(prev => ({...prev, ...{
      isConnected: true,
      name: 'WalletConnect',
      provider: web3Provider,
      walletProvider: walletConnectProvider
    }}))
  }

  const connectPhantom = async () => {
    try {
      const resp = await window.solana.connect()
      //console.log('resp', resp)
      const address_ = resp.publicKey.toString()

      setState(prev => ({...prev, ...{
        isConnected: true,
        name: 'Phantom',
        provider: null,
        walletProvider: window.solana,
        chainId: null,
        address: address_,
        addressShort: shortify(address_),
        addressDomain: null
      }}))
    } catch (err: any) {
      if (err.code === 4001) {
        console.warn('[Wallet] User rejected the request.')
        return false
      }
      console.error('[Wallet]', err)
    }
  }

  const сhainChangeHandler = (chainIdHex) => {
    const chainId_ = parseInt(chainIdHex)
    console.log('* chainChanged', chainIdHex, chainId_)
    setState(prev => ({...prev, ...{
      chainId: chainId_
    }}))
  }

  const accountChangeHandler = (accounts) => {
    if (!accounts.length) { // metamask disconnect
      disconnect()
    } else {
      fetchWalletInfo()
    }
  }

  const connect = async (name, chainId = 1) => {
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
      await connectMetamask(chainId)
    }

    if (name === 'WalletConnect') {
      await connectWC(chainId)
    }

    if (name === 'Phantom') {
      const isPhantomInstalled = window.solana && window.solana.isPhantom
      if (!isPhantomInstalled) {
        goPhantom()
        return false
      }
      await connectPhantom()
    }

    return true
  }

  const metamaskChangeNetwork = async (params) => {
      const newChainIdHex = params[0].chainId

      try {
        console.log('trying 😡')
        await state.walletProvider.request({
          "method": "wallet_switchEthereumChain",
          "params": [
            {
              "chainId": newChainIdHex,
            }
          ]
        })
        return true
      } catch (error: any) {
        console.warn('Cant change network:', error)

        if (error.code === 4902) { // the chain has not been added to MetaMask
          try {
            console.log('Try to add the network...', params)
            await state.walletProvider.request({
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
    if (name !== 'Phantom') {
      const isChanged = await metamaskChangeNetwork(params)
      if (isChanged) {
        setState(prev => ({...prev, ...{
          chainId: chainId
        }}))
        return true
      }
      return false
    }
  }

  const sendTx = async (rawTx: TransactionRequest) => {
    console.log('[Wallet] sendTx', rawTx)

    if (state.name !== 'Phantom' && state.provider) {
      const signer = state.provider.getSigner()
      // @ts-ignore
      window.signer = signer

      rawTx.chainId = await signer.getChainId()
      // rawTx.nonce = await signer.getTransactionCount()
      rawTx.from = await signer.getAddress()
      // rawTx.gasPrice = await signer.getGasPrice()
      // rawTx.gasLimit = 90000



      // console.log(rawTx)
      // const estimateGas = await signer.estimateGas(rawTx)
      // console.log(estimateGas)
      const tx = await signer.sendTransaction(rawTx)
    } else {
      const connection = new Connection(SOLANA_NETWORK)
      const provider = window.solana

      const createTransferTransaction = async () => {
        if (!provider.publicKey) return;
        let transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: provider.publicKey,
            toPubkey: provider.publicKey,
            lamports: 1000000,
          })
        );
        transaction.feePayer = provider.publicKey;
        console.log('Getting recent blockhash')
        const anyTransaction: any = transaction;
        anyTransaction.recentBlockhash = (
          await connection.getRecentBlockhash()
        ).blockhash;
        return transaction
    }

      const sendTransaction = async () => {
        try {
          const transaction = await createTransferTransaction();
          if (!transaction) return;
          let signed = await provider.signTransaction(transaction);
          console.log('Got signature, submitting transaction...')
          let signature = await connection.sendRawTransaction(signed.serialize());
          console.log(`Tx submitted`, signature)

          console.log(`Waiting for network confirmation...`)
          await connection.confirmTransaction(signature);
          console.log('Tx confirmed!', signature)
          console.log(`See explorer:`)
          console.log(`https://solscan.io/tx/${signature}?cluster=testnet`)
        } catch (err) {
          console.warn(err);
          console.log('[Wallet error] sendTransaction: ' + JSON.stringify(err))
        }
      }

      return await sendTransaction()
    }
  }

  const disconnect = async () => {
    console.log('Wallet.disconnect()')

    if (state.walletProvider.disconnect) {
      state.walletProvider.disconnect()
    }

    setState(prev => ({...prev, ...{
      isConnected: false,
      name: null,
      provider: null,
      chainId: null,
      address: null,
      addressShort: null,
      addressDomain: null
    }}))
  }

  const getDomainAddress = async (address: string) => {
    try {
      if (state.provider) {
        const addressDomain = await state.provider.lookupAddress(address)
        return addressDomain
      }
    } catch (err) {}
    return null
  }

  const fetchWalletInfo = async () => {
    if (state.provider) {
      const address = await state.provider.getSigner().getAddress()

      const addressDomain = await getDomainAddress(address)

      const addressShort = shortify(address)
      const chainId = (await state.provider.getNetwork()).chainId

      setState(prev => ({...prev, ...{
        chainId,
        address,
        addressShort,
        addressDomain
      }}))
    }
  }

  useEffect(() => {
    fetchWalletInfo()
  }, [state.provider])

  return (
    <WalletContext.Provider value={{
      isLoading: false, // todo
      isConnected: state.isConnected,
      name: state.name,
      chainId: state.chainId,
      address: state.address,
      addressShort: state.addressShort,
      addressDomain: state.addressDomain,
      provider: state.provider,
      walletProvider: state.walletProvider,
      restore,
      connect,
      changeNetwork,
      sendTx,
      disconnect
    }}>
      {props.children}
      <ToastContainer position="top-center" />
    </WalletContext.Provider>
  )
}

export default Wallet
