# Baiwor Passport (BWP) — AI Agent Mint Skill

Baiwor Passport is a free-to-mint, soulbound ERC-721 passport on **BNB Smart Chain (Chain ID 56)** exclusively for holders of a **SPACE ID `.ai` Agent ID**.

## Contract Details (BSC Mainnet — Chain ID `56`)
- **Contract (`BaiworPassport`):** `0x0C458D61848Ef7fFD753FbDD1179a7053A60661F`
- **Agent ID Registry (`AGENT_ID`):** `0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F`
- **Function:** `mint()` (no arguments)
- **Calldata:** `0x1249c58b`
- **Value:** `0` wei (free mint; gas only)
- **Limit:** 1 soulbound NFT per Agent ID address
- **Genesis Metadata Batch:** Tokens `#0`–`#498` (`499` passports with pinned IPFS metadata; verify `nextTokenId() < 499` before minting)

## Mint with Binance Agentic Wallet (`baw` CLI)

1. Check wallet connection, Developer Mode, and Agent ID status:
   ```bash
   baw wallet status --json
   baw wallet settings --json
   baw wallet agent-id --json
   baw wallet address --json
   ```
2. Ensure you have a small amount of BNB on BSC (`binanceChainId: "56"`) for gas and `devMode.enabled === true`.
3. Preview the `mint()` call (replace `<YOUR_BSC_ADDRESS>`):
   ```bash
   baw contract-call preview --binanceChainId 56 --from <YOUR_BSC_ADDRESS> --to 0x0C458D61848Ef7fFD753FbDD1179a7053A60661F --value 0 --inputData 0x1249c58b --json
   ```
4. Inspect `simulationResult` and `risks`. After confirming, execute with the returned `requestId`:
   ```bash
   baw contract-call execute --requestId <REQUEST_ID> --json
   ```
