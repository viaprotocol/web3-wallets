# web3-wallets

Universal interface for web3 wallets

```
           dapp                     wallets          blockchains


                               ╭───[MetaMask]────────[EVM-blockchains]
                               │
[your dapp]───[web3-wallets]───┼───[WalletConnect]───[EVM-blockchains]
                               │
                               ╰───[Phantom]─────────[Solana]

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

(For more information see [/networks.ts](/networks.ts))
