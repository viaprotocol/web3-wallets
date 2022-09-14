<p align="center"><a href="https://via.exchange" target="_blank"><img alt="Via Protocol is the most advanced cross-chain aggregation protocol" src="https://user-images.githubusercontent.com/55061526/185308497-3d70e503-d4c8-4b9f-a5fd-9bf9083c4793.png" width="100%">
</a>
</p>


# Web3 wallets
> Universal adapter to Ethereum and Solana

[![NPM Version][npm-image]][npm-url]
[![Downloads Stats][npm-downloads]][npm-url]
[![Discord][discord-image]][discord-url]
[![Gitmoji support][gitmoji-image]][gitmoji-url]

## Features

- 🚀 Built-in functions for working with signatures, connecting wallets, tracking the status of transactions, ENS names, and more.
- 💼 Built-in wallet connectors for MetaMask, WalletConnect, Coinbase Wallet, Keplr, xDefi, Phantom (Solana) and Injected wallets.
- 🌀 Auto-refresh data on wallet, block, and network changes
- 🦄 TypeScript ready
- 🌏 All supported networks are in [networks.ts](https://github.com/viaprotocol/web3-wallets/blob/main/src/networks.ts)


## Supported wallets

- MetaMask
- WalletConnect (all WalletConnect-compatible wallets are supported, **>100 wallets!**)
- Coinbase Wallet
- Phantom (Solana)
- Keplr (Cosmos, Osmosis, Astar)
- xDeFi (EVM networks, Bitcoin, Bitcoin Cash, Litecoin)
- Safe (aka Gnosis Safe Multisig Wallet)


## Installation

```bash
yarn add @viaprotocol/web3-wallets
```

## Quick start

```tsx
import { useContext } from 'react'
import { WalletContext, WalletProvider } from '@viaprotocol/web3-wallets'

function App() {
  return (
    <WalletProvider>
      <NestedComponent />
    </WalletProvider>
  )
}

function NestedComponent() {
  const { connect, isConnected, address } = useContext(WalletContext)

  if (!isConnected) {
    return (
      // Select MetaMask and connect to ETH Mainnet
      <button
        type="button"
        onClick={() => connect({ name: 'MetaMask', chainId: 1 })}
      >Connect wallet</button>
    )
  }

  return (
    <p>{address}</p>
  )
}
```


## Local development

Unfortunately, there is no playground in the library at the moment, so local development is done with [yalc](https://github.com/wclr/yalc).

1. First, install the library:

```
yarn global add yalc
```

2. Make changes to the `web3-wallets` code

3. Run the following command to build the library:

```
yarn publish:yalc
```

4. In the project you are going to test your functionality, initialize the package fetch from `yalc`

```
yalc add @viaprotocol/web3-wallets
```

5. Install `yalc` version of web3-wallets

```
yarn add @viaprotocol/web3-wallets
```

6. After the library is installed, you can use it in your project.

(if you are using vite, you need to run it with `--force` param)

7. Run the following command to remove the library, after you are done with testing:

```
yalc remove @viaprotocol/web3-wallets && yarn
```


## Contributing

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) in our project to name commits. And we would be very grateful if you would also follow this convention.

*Scope is optional.*

✌🏻 Additionally, it would be cool to put emoji according to [Gitmoji's guide](https://gitmoji.dev/) ([VSCode plugin](https://marketplace.visualstudio.com/items?itemName=seatonjiang.gitmoji-vscode), [WebStorm plugin](https://plugins.jetbrains.com/plugin/12383-gitmoji-plus-commit-button))

1. Fork it (<https://github.com/viaprotocol/web3-wallets/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am '✨ feat: add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request


## Any questions?

You can write us in [Discord](https://discord.gg/viaexchange) with any questions about usage, integrations, adding new wallets, etc.

<!-- Markdown link & img dfn's -->
[npm-image]: https://img.shields.io/npm/v/@viaprotocol/web3-wallets.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@viaprotocol/web3-wallets
[npm-downloads]: https://img.shields.io/npm/dm/@viaprotocol/web3-wallets?style=flat-square
[gitmoji-url]: https://gitmoji.dev
[gitmoji-image]: https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg?style=flat-square
[discord-url]: https://discord.gg/viaexchange
[discord-image]: https://badgen.net/discord/members/viaexchange
