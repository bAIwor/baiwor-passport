# Baiwor Passport (BWP)

**Baiwor Passport (`BWP`)** is a soulbound ERC-721 on-chain credential on **BNB Smart Chain (BSC Mainnet)** designed for verified **`.ai` Agent ID** holders, built as part of the **bAIwor** ecosystem (`baiwor.my.id`) for the **Binance Wallet × BNB Chain Agent ID Hackathon**.

## Live Deployment & Verification
- **Network:** BNB Smart Chain Mainnet (`Chain ID: 56`)
- **Contract Address:** [`0x0C458D61848Ef7fFD753FbDD1179a7053A60661F`](https://bscscan.com/address/0x0C458D61848Ef7fFD753FbDD1179a7053A60661F)
- **Sourcify Verification (`exact_match`):** [View Verified Source](https://sourcify.dev/server/v2/contract/56/0x0C458D61848Ef7fFD753FbDD1179a7053A60661F?fields=sources)
- **SPACE ID Agent ID Registry (`AGENT_ID`):** [`0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F`](https://bscscan.com/address/0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F)
- **Token Metadata (IPFS):** `ipfs://bafybeib7hbvvxqsw2lv3tenzsnd5xjetyjrc2mwckauyepqb6g4so4r4kq/`

## How Agent ID Is Integrated
1. **On-Chain Identity Verification (`IAgentID.balanceOf`):** `mint()` enforces `IAgentID(0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F).balanceOf(msg.sender) > 0`, ensuring only verified `.ai` Agent ID wallets can mint.
2. **Sybil-Resistant Soulbound Binding (`_update`):** Each Agent ID address can mint at most **1** `BWP` passport (`hasMinted[msg.sender]`), and transfers are disabled on-chain so the credential remains permanently bound to the Agent ID wallet.
3. **Agent-only minting:** minting happens exclusively through the minter's own AI agent via `baw contract-call preview` + `execute` (see [`agent-skill.md`](./agent-skill.md)). The web UI is read-only — no web wallet connection and no QR pairing, per hackathon safety rules.

## Repository Structure
```text
baiwor-passport/
├── contracts/
│   ├── BaiworPassport.sol      # Soulbound ERC-721 gated by BSC Agent ID Registry
│   └── BaiworPassport.flattened.sol  # Flattened source (BscScan verification)
├── scripts/
│   └── compile.js              # Local solc/Hardhat compilation script
├── web/
│   ├── index.html              # Semantic, accessible dApp UI (zero build step)
│   ├── styles.css              # Responsive CSS with light/dark theme & subgrid
│   ├── app.js                  # Live BSC RPC reads, eligibility check, & minting
│   ├── agent-skill.md          # AI agent minting skill
│   └── llms.txt                # Machine-readable project summary
├── agent-skill.md
├── llms.txt
└── hardhat.config.js
```

## Quick Start (Web UI)
The `web/` directory is zero-dependency static HTML/CSS/JS ready for `baiwor.my.id/passport`, Vercel, Cloudflare Pages, or IPFS:
```bash
npx serve web
```
