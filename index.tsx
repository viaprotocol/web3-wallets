import React, { useState, createContext } from 'react'
import Web3 from 'web3'

import isMobile from 'ismobilejs'

import WalletConnect from '@walletconnect/client'
import QRCodeModal from '@walletconnect/qrcode-modal'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface WalletInterface {
  isLoading: boolean
  isConnected: boolean
  name: null | 'WalletConnect' | 'MetaMask'
  chainId: null | number
  address: string | null
  addressDomain: null | string
  web3: Web3 | null // todo: types
  provider: any // 📌 TODO: add interface
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
  addressDomain: null,
  web3: null,
  provider: null,
  restore: () => {},
  connect: () => {},
  changeNetwork: () => {},
  sendTx: () => {},
  disconnect: () => {},
})


const names = {
  'WalletConnect': 'WalletConnect',
  'MetaMask': 'MetaMask',
}

/*
const { ethereum } = window
*/

/*const web3 = new Web3(window.ethereum)
web3.eth.getAccounts((err, accounts) => {
  if (err != null) console.error("An error occurred: " + err)
  else if (accounts.length === 0) console.log("User is not logged in to MetaMask");
  else connect();
});*/

let isMetamaskHandler = false

let connector // wc
//window.getConnector = () => connector


const goMetamask = () => {
  //if (isMobile(window.navigator).apple.device) {
  if (isMobile(window.navigator).any) {
    /*
      open app in mobile metamask
      info: https://docs.metamask.io/guide/mobile-best-practices.html#deeplinking

      `https://checkout.webill.io/nft/bb811382-1f1b-4376-8884-5f74bd808f83/`
      ->
      `https://metamask.app.link/dapp/checkout.webill.io/nft/bb811382-1f1b-4376-8884-5f74bd808f83/`
    */
    const locationHref = window.location.href
    let locationHrefNoProtocol = locationHref.replace('http://', '')
    locationHrefNoProtocol = locationHrefNoProtocol.replace('https://', '')
    const deepLink = `https://metamask.app.link/dapp/${locationHrefNoProtocol}`
    window.location.href = deepLink
  }
  if (!isMobile(window.navigator).any) {
    window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn')
  }
}


interface StateProps {
  isLoading: boolean
  isConnected: boolean
  name: null | 'WalletConnect' | 'MetaMask'
  provider: any
  web3: Web3 | null
  chainId: number | null
  address: string | null
  addressDomain: string | null
}

const Wallet = (props) => {

  const [state, setState] = useState<StateProps>({
    isLoading: false,
    isConnected: false,
    name: null,
    provider: null,
    web3: null,
    chainId: null,
    address: null,
    addressDomain: null
  })

  const getDomain = async (address) => {
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

  /*
  setState(prev => {
    // Object.assign would also work
    return {...prev, ...updates};
  })

  setState(prev => ({...prev, ...{

  }}))
  */

  /*
  useEffect(() => {
    // todo: check
    if (window?.ethereum?.chainId) {
      const metamaskChainId = parseInt(window.ethereum.chainId)
      console.log('setMetamaskChainId', metamaskChainId)
      setMetamaskChainId(metamaskChainId)
    }

    const metamaskChainChangeHandler = (chainIdHex) => {
      const chainId = parseInt(chainIdHex)
      console.log('chainChanged / setMetamaskChainId', chainId)
      setMetamaskChainId(chainId)
    }

    if (!isMetamaskHandler) {
      if (window.ethereum) {
       window.ethereum.on('chainChanged', metamaskChainChangeHandler)
       isMetamaskHandler = true
      }
    }
  }, [metamaskChainId])
  */


  const restore = async () => {
    console.log('Wallet.restore()')
    /*
    if (!ethereum) {
      console.warn('connectAuto failed: no window.ethereum')
      return
    }

    //

    try {
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      })

      console.log('setAccount', accounts[0])
      setAddress(accounts[0])

      parseInt(ethereum.networkVersion)

    } catch (error) {
      console.error('Cannot connect:', error)
    }
    */


    await dropWC()

    return await connectMetamask()
  }

  const connectMetamask = async (network?: { data: { params: any }; chain_id: number }) => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      return false
    }
    const provider_ = window.ethereum
    const chainIdHex_ = provider_.chainId
    let chainId_ = parseInt(chainIdHex_)

    let accounts

    try {
      accounts = await provider_.request({
        method: 'eth_requestAccounts'
      })
    } catch (e: any) {
      if (e.code === 4001) {
        console.warn('User rejected the request', e)
        return false
      } else {
        throw e
      }
    }

    console.log('accounts = ', accounts)
    const address_ = accounts[0]
    const addressDomain_ = await getDomain(getDomain)

    if (network) { // go change network
      if (!network.data.params) {
        throw new Error('Missing network params')
      }
      const isNeedToChangeNetwork = chainId_ !== network.chain_id
      if (isNeedToChangeNetwork) {
        await metamaskChangeNetwork(network.data.params)
        chainId_  = network.chain_id
      }
    }


    if (!isMetamaskHandler) {
      provider_.on('chainChanged', metamaskChainChangeHandler)
      provider_.on('accountsChanged', metamaskAccountChangeHandler)
      isMetamaskHandler = true
    }

    setState(prev => ({...prev, ...{
      isConnected: true,
      name: 'MetaMask',
      provider: provider_,
      web3: new Web3(provider_),
      chainId: chainId_,
      address: address_,
      addressDomain: addressDomain_
    }}))
    return true
  }

  const connectWC = ({ showQR = false, network }) => {
    /*
      showQR === false | only reconnect
      showQR === true  | try to connect + show QR
    */

    console.log('connectWC()', showQR ? '(connect+QR)' : '(reconnect)')

    return new Promise((resolve) => {
      connector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org',
        qrcodeModal: QRCodeModal,
      })

      console.log('connector: ', connector)

      if (
        (connector.connected && showQR) ||
        (!connector.connected && !showQR)
      ) {
        resolve(false)
      }

      if (!connector.connected && showQR) {
        console.log('no session, create')
        connector.createSession()
      }

      if (connector.connected && !showQR) {
        console.log('restore session: ', connector.session)
        console.log('WC reconnect not implemented, drop session')
        try {
          connector.killSession()
        } catch (e) {
          console.warn(e)
        }
        resolve(false)
        /* todo later:
        const dappChainId = network.chain_id
        const walletChainId = connector.session.chainId

        if (walletChainId !== dappChainId) {
          toast.warn('(Rejected) Select the correct network in your wallet')
          //console.warn('(Rejected) Select the correct network in your wallet')
          resolve(false)
          connector.killSession()
        }

        const rpcUrl = network.rpc_url
        console.log('rpcUrl', rpcUrl)
        const provider_ = new Web3.providers.HttpProvider(rpcUrl)
        const web3_ = new Web3(provider_)

        setState(prev => ({...prev, ...{
          isConnected: connector.session.connected,
          name: 'WalletConnect',
          provider: provider_,
          web3: web3_,
          chainId: connector.session.chainId,
          address: connector.session.accounts[0],
          addressDomain
        }}))

        resolve(true)
        */
      }

        /*
        Events:
          - connect
          - disconnect
          - session_request
          - session_update
          - call_request
          - wc_sessionRequest
          - wc_sessionUpdate
        */

      connector.on('connect', async (error, payload) => { // only after QR scan
        console.log('* connected', payload)
        //toast.success('[dapp ⮀ wallet] Connected')

        if (error) {
          throw error
        }

        // Get provided accounts and chainId
        const { accounts, chainId: walletChainId } = payload.params[0]

        const dappChainId = network.chain_id
        if (walletChainId !== dappChainId) {
          toast.warn('Wrong wallet network — disconnected')
          /*console.warn('(Rejected) Select the correct network in your wallet')*/
          resolve(true) // to close modalbox
          connector.killSession()
        }

        const address_ = accounts[0]
        const addressDomain_ = await getDomain(address_)

        const rpcUrl = network.rpc_url
        console.log('rpcUrl', rpcUrl)
        const provider_ = new Web3.providers.HttpProvider(rpcUrl)
        const web3_ = new Web3(provider_)

        setState(prev => ({...prev, ...{
          isConnected: true,
          name: 'WalletConnect',
          provider: provider_,
          web3: web3_,
          chainId: walletChainId,
          address: address_,
          addressDomain: addressDomain_
        }}))

        resolve(true)
      })


      connector.on('session_request', (error, payload) => { console.log('* session_request', error, payload) })


      connector.on('session_update', (error, payload) => {
        console.log('* session_update', payload)

        if (error) {
          throw error
        }

        console.log('chainId', state.chainId)

        // Get updated accounts and chainId
        const { /*accounts,*/ chainId: newChainId } = payload.params[0]
        //console.log(accounts, newChainId)

        //const account = accounts[0] // todo: account

        if (newChainId !== state.chainId) {
          //toast.info(`[wallet] chainId changed to ${newChainId}`)
          setState(prev => ({...prev, ...{
            chainId: newChainId
          }}))
        }
      });


      connector.on('call_request', (error, payload) => {
        console.log('* call_request', error, payload)
      })


      connector.on('disconnect', (error, payload) => {
        console.log('* disconnect', payload)

        /*
          "Session Rejected" = reject after QR scan
          "Session Disconnected" = disconnected by dapp
          "Session disconnected" = disconnected by wallet
        */

        if (payload.params[0]?.message === 'Session Rejected') {
          //toast.warn('[wallet] Connection rejected')
          console.log('[Wallet] Session rejected')
          resolve(false)
        }

        if (payload.params[0]?.message === 'Session disconnected') {
          //toast.info('[wallet] Disconnected')
          console.log('[Wallet] Disconnected (by wallet)')
        }

        if (payload.params[0]?.message === 'Session Disconnected') {
          //toast.info('[dapp] Disconnected')
          console.log('[Wallet] Disconnected (by dapp)')
        }


        if (error) {
          throw error
        }

        setState(prev => ({...prev, ...{
          isConnected: false,
          name: null,
          provider: null,
          web3: null,
          chainId: null,
          address: null,
          addressDomain: null
        }}))
      })
    })
  }

  const dropWC = () => {
    return connectWC({ showQR: false, network: [] })
  }

  const metamaskChainChangeHandler = (chainIdHex) => {
    // todo: fix state
    /*if (!state.isConnected) {
      return
    }*/
    const chainId_ = parseInt(chainIdHex)
    console.log('* chainChanged', chainIdHex, chainId_)
    setState(prev => ({...prev, ...{
      chainId: chainId_
    }}))
  }

  const metamaskAccountChangeHandler = (accounts) => {
    console.log('* accountsChanged', accounts)

    // todo: fix state
    /*if (!state.isConnected) {
      return
    }*/
    if (!accounts.length) { // metamask disconnect
      disconnect()
    }
  }

  const connect = async ({ name, network }) => {
    console.log('Wallet.connect()', name, network)
    if (!names[name]) {
      console.error(`Unknown wallet name: ${name}`)
      return
    }

    if (name === 'MetaMask') {
      if (!window.ethereum || !window.ethereum.isMetaMask) {
        goMetamask()
        return false
      }
      return await connectMetamask(network)
    }

    if (name === 'WalletConnect') {
      if (!network || !network.rpc_url) {
        throw new Error(`Unknown network.rpc_url ${network.rpc_url}`)
      }
      return connectWC({ showQR: true, network })
    }
  }

  const metamaskChangeNetwork = async (params) => {
      const newChainIdHex = params[0].chainId
      const { ethereum } = window

      try {
        await ethereum.request({
          "id": 1,
          "jsonrpc": "2.0",
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

  const changeNetwork = async (name, params) => {
    console.log('Wallet.changeNetwork()', params)

    const newChainIdHex = params[0].chainId
    const newChainId = parseInt(newChainIdHex)
    // console.log('state.name', state.name)
    /*if (state.name === 'MetaMask') {*/
    // todo: stale state
    if (name === 'MetaMask') {
      const isChanged = await metamaskChangeNetwork(params)
      if (isChanged) {
        setState(prev => ({...prev, ...{
          chainId: newChainId
        }}))
        return true
      }
      return false
    }

    if (state.name === 'WalletConnect') {
      // todo (show new QR)
    }
  }

  const sendTx = async (rawTx) => {
    if (state.name === 'MetaMask') {
      return await state.provider.request({
        method: 'eth_sendTransaction',
        params: [rawTx]
      })
    }
    if (state.name === 'WalletConnect') {
      return await connector.sendTransaction(rawTx)
    }
  }

  /*const request = async (params) => {
    // from provider
  }*/

  const disconnect = () => {
    console.log('Wallet.disconnect()')

    if (state.name === 'MetaMask') {
      if (state.provider) {
        state.provider.removeListener('chainChanged', metamaskChainChangeHandler)
        state.provider.removeListener('accountsChanged', metamaskAccountChangeHandler)
        isMetamaskHandler = false
      }
    }

    if (state.name === 'WalletConnect') {
      connector.killSession()
    }

    setState(prev => ({...prev, ...{
      isConnected: false,
      name: null,
      provider: null,
      web3: null,
      chainId: null,
      address: null,
      addressDomain: null
    }}))
  }

  return (
    <WalletContext.Provider value={{
      isLoading: false, // todo
      isConnected: state.isConnected,
      name: state.name,
      chainId: state.chainId,
      address: state.address,
      addressDomain: state.addressDomain,
      web3: state.web3,
      provider: state.provider,
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
