# Proof-of-Effort Network

A fraud-resistant reputation network that makes verified efforts as legible as real currency.

A global, decentralized, fraud-resistant platform where humans earn, verify, and leverage proof-of-effort points.

## 🎯 Core Concept

Create portable, verifiable trust and impact, giving people a tangible way to:
- Prove their effort and contributions
- Demonstrate genuine needs when seeking help
- Unlock opportunities based on verified work history
- Reduce fraud in charity, employment, and social support systems

## 🏗️ Architecture

### Tech Stack
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Redis (caching)
- **Blockchain**: Ethereum-compatible smart contracts (Solidity)
- **Decentralized Storage**: IPFS for proof artifacts
- **Frontend**: React + TypeScript + Tailwind CSS
- **Authentication**: JWT + Wallet signatures

### Key Components

1. **Effort Recording System**
   - Multi-modal proof submission (photos, videos, documents, witness verification)
   - Timestamped, immutable records on blockchain
   - IPFS storage for proof artifacts

2. **Verification Network**
   - Peer-to-peer verification with reputation weighting
   - Multi-signature approval for high-value claims
   - AI-assisted fraud detection

3. **Trust Score Engine**
   - Algorithmic calculation based on verified efforts
   - Time-weighted contributions
   - Peer endorsements and verifications

4. **Fraud Detection**
   - Pattern recognition for suspicious activities
   - Geographic and temporal anomaly detection
   - Cross-reference validation

5. **Portable Identity**
   - Self-sovereign identity with cryptographic proofs
   - Exportable proof-of-effort certificates
   - Privacy-preserving credential sharing

## 📁 Project Structure

```
proof_of_effort/
├── backend/             # Node.js API server
│   ├── src/
│   │   ├── models/      # Types and data shapes
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Auth, validation, etc.
│   │   └── utils/       # Helper functions
│   └── package.json
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   └── lib/         # API clients
│   └── package.json
├── contracts/           # Smart contracts
│   ├── contracts/
│   │   └── ProofOfEffort.sol
│   └── hardhat.config.js
├── docs/                # Documentation
└── docker-compose.yml   # Container orchestration (optional)
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- PostgreSQL >= 14.x
- Docker (optional)
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd proof_of_effort

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install contract dependencies
cd ../contracts
npm install
```

### Configuration

Create `.env` files in backend and frontend directories.

**backend/.env**
```
DATABASE_URL=postgresql://user:password@localhost:5432/proof_of_effort
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
IPFS_API_URL=https://ipfs.infura.io:5001
ETHEREUM_RPC_URL=your-rpc-url
CONTRACT_ADDRESS=deployed-contract-address
```

### Running the Application

```bash
# Start backend server
cd backend
npm run dev

# Start frontend (in another terminal)
cd frontend
npm run dev

# Deploy contracts (first time only)
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

## 🔑 Key Features

### For Individuals
- **Earn Points**: Document work, volunteering, caregiving, skills development
- **Verify Needs**: Provide verifiable proof when seeking assistance
- **Build Reputation**: Accumulate trust through consistent, verified efforts
- **Portable Credentials**: Take your proof-of-effort anywhere

### For Organizations
- **Reduce Fraud**: Verify claims with decentralized consensus
- **Fair Distribution**: Allocate resources based on verified need and effort
- **Impact Tracking**: Measure real outcomes and contributions
- **Trust at Scale**: Leverage community verification

### For Verifiers
- **Earn Rewards**: Get incentivized for honest verification
- **Build Authority**: Increase reputation through accurate verifications
- **Community Service**: Help maintain system integrity

## 🔒 Security & Privacy

- End-to-end encryption for sensitive data
- Zero-knowledge proofs for privacy-preserving verification
- Decentralized storage prevents single points of failure
- Cryptographic signatures ensure authenticity
- GDPR-compliant data handling

## 🤝 Use Cases

1. **Disaster Relief**: Verify genuine needs and distribute aid fairly
2. **Employment**: Prove work history and skills to employers
3. **Charity**: Ensure donations reach those with verified needs
4. **Micro-lending**: Assess trustworthiness for financial inclusion
5. **Volunteering**: Build portable records of community service
6. **Skills Training**: Document learning and development efforts

## 📊 Verification Levels

- **Level 1 - Self Reported**: Basic claim with evidence (10 points)
- **Level 2 - Peer Verified**: 2+ community verifications (50 points)
- **Level 3 - Authority Verified**: Organization endorsement (100 points)
- **Level 4 - Multi-Sig Consensus**: 5+ trusted verifiers (200 points)

## 🛣️ Roadmap

- [x] Phase 1: Core architecture design
- [ ] Phase 2: Backend API and database implementation
- [ ] Phase 3: Smart contract development
- [ ] Phase 4: Frontend user interface
- [ ] Phase 5: Verification network and fraud detection
- [ ] Phase 6: Mobile application
- [ ] Phase 7: Beta testing and security audit
- [ ] Phase 8: Mainnet launch

## 📄 License

MIT License - See `LICENSE` for details.

## ™️ Trademark / Brand use

This repository is MIT-licensed, which means you can use the code (including commercially). However, the MIT License **does not** grant permission to use the project’s **name, logo, or branding** in ways that could confuse people about what is official or endorsed.

If you fork or host your own version, please **rename your project** and **remove/replace** Proof of Effort branding.

See `TRADEMARKS.md` for details.

## 🤝 Contributing

Contributions are welcome! Please read `CONTRIBUTING.md` for guidelines.

## 📧 Contact

Maintainer: **@FormulaBell6239** (pseudonymous).

For questions or support, please open a GitHub issue.