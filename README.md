# web3-wallets

Universal interface for web3 wallets

```
                                    wallets           blockchains


                               ╭───[MetaMask]─────────[EVM-blockchains]
                               │
                               ├───[WalletConnect]────[EVM-blockchains]
                               │
[your dapp]───[web3-wallets]───┼───[Coinbase Wallet]──[EVM-blockchains]
                               │
                               ├───[Phantom]──────────[Solana]
                               │
                               ╰───[NEAR Wallet]──────[NEAR]

```

## Used `chainId`'s

- `1` - Ethereum
- `4` - Ethereum Rinkeby
- `> 0` - EVM networks...
- ...
- `< 0` - non-EVM networks...
- `-1` - Solana
- `-1001` - Solana-testnet
- `-2` - Near
- `-1002` - Near-testnet
- `-3` - TON
- `-1003` - TON-testnet

(For more information see [/networks.ts](/networks.ts))
