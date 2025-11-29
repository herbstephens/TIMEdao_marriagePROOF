# 💍 Smart Marriage Protocol **World Chain Mainnet Deployment — Full Documentation**

This repository contains the smart contracts for the **Smart Marriage Protocol**, deployed on **World Chain Mainnet** during ETHGlobal.  
It includes:  

- Soulbound marriage NFTs  
- Anniversary milestone NFTs  
- A daily-emission ERC20 “TIME” token  
- A HumanBond contract integrating **World ID** for private, verifiable marriage proposals

---

## 📌 Deployed Contract Addresses (World Chain Mainnet)

- **VowNFT** - `0xaa8b0e47649a93f3092967dfc83287c7293c8fe7`
- **MilestoneNFT** - `0x57302a1cc1597c573a7acc12876146dd7919bf49`
- **TimeToken** - `0xd7dff24b9d0e217c0876b70944176d1415153c8b`
- **HumanBond** - `0x8547412ca42cd3aac734d15a0cd566fd91454c0c`

---

## 🚀 Deployment Guide (World Chain Mainnet)

### ✅ Prerequisites

Ensure the following are installed/configured:

- Foundry (`forge` >= **1.5.0**)
- OpenZeppelin Contracts
- forge-std
- Contracts compile without errors: forge build
- World ID Router Address confirmed:
0x17B354dD2595411ff79041f930e491A4Df39A278
- .env file with RPC_URL and PRIVATE_KEY are set
- Check Wallet Balance, ensure wallet has 0.05–0.1 ETH on World Chain Mainnet.

### Deploying to World Chain via Script

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $WORLDCHAIN_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  -vvvv
```

### Useful Resources

- World Chain RPC: https://rpc.worldchain.org
- Chain ID: 480
- Router: 0x17B354dD2595411ff79041f930e491A4Df39A278
- Group ID: 1
- External Nullifiers: generated during deployment
- World Chain Docs: https://docs.world.org/world-chain
- World ID Docs: https://docs.world.org/world-id

## Contracts Overview

### VowNFT

Soulbound NFT representing a verified marriage.

### MilestoneNFT

**Year and URI**:

- **1 Year** - ipfs://QmPAVmWBuJnNgrGrAp34CqTa13VfKkEZkZak8d6E4MJio8
- **2 Years** - ipfs://QmPTuKXg64EaeyreUFe4PJ1istspMd4G2oe2ArRYrtBGYn
- **3 Years** - ipfs://Qma32oBrwNNQVR3KS14RHqt3QhgYMsGKabQv4jusdtgsKN
- **4 Years** - ipfs://QmSw9ixqCVc7VPQzDdX1ZCdWWJwAfLHRdJsi831PsC94uh

### TimeToken

ERC20 token representing time spent together.

### HumanBond

- World ID verification  
- Proposal flow  
- Acceptance flow  
- VowNFT minting  
- MilestoneNFT minting  
- TimeToken minting  

#### Acknowledgements

Built at ETHGlobal Buenos Aires.
Contracts authored and tested by **Leticia Azevedo**.

#### License

MIT License
