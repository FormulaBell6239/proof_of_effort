# Quick Start Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** >= 18.x ([Download](https://nodejs.org/))
- **PostgreSQL** >= 14.x ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))
- **MetaMask** browser extension ([Install](https://metamask.io/))

Optional but recommended:
- **Docker** & Docker Compose (for containerized setup)
- **Redis** (for caching)

---

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd proof_of_effort
```

### 2. Install All Dependencies
```bash
npm run install:all
```

This will install dependencies for:
- Root project
- Backend
- Frontend
- Smart contracts

---

## Configuration

### Backend Setup

1. **Create environment file:**
```bash
cd backend
cp .env.example .env
```

2. **Edit `.env` with your settings:**
```env
DATABASE_URL=postgresql://poe_user:poe_password@localhost:5432/proof_of_effort
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key-change-this
IPFS_API_URL=http://localhost:5001
ETHEREUM_RPC_URL=http://localhost:8545
```

3. **Set up the database:**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE proof_of_effort;"
psql -U postgres -c "CREATE USER poe_user WITH PASSWORD 'poe_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE proof_of_effort TO poe_user;"

# Run schema
psql -U poe_user -d proof_of_effort -f database/schema.sql
```

### Smart Contracts Setup

1. **Navigate to contracts directory:**
```bash
cd contracts
```

2. **Create environment file (if deploying to testnet):**
```bash
# .env in contracts directory
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key_here
```

---

## Running the Application

### Option 1: Manual Start (Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

**Terminal 3 - Local Blockchain (optional):**
```bash
cd contracts
npx hardhat node
```
This starts a local Ethereum node on port 8545

**Terminal 4 - Deploy Contracts:**
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

### Option 2: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- IPFS (ports 4001, 5001, 8080)
- Backend API (port 3001)
- Frontend (port 3000)

---

## Verification

### Check Backend
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-17T...",
  "uptime": 123.456
}
```

### Check Frontend
Open browser to: http://localhost:3000

You should see the Proof of Effort homepage.

### Check Smart Contract
After deploying, you'll see output like:
```
✅ ProofOfEffort deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Update `backend/.env`:
```env
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

## First Time Setup

### 1. Connect Wallet
- Click "Connect Wallet" in the frontend
- Approve MetaMask connection
- Switch to localhost network (if using Hardhat)

### 2. Get Test ETH (if using local network)
The Hardhat node provides test accounts with ETH automatically.

### 3. Submit Your First Effort
1. Navigate to "Submit Effort"
2. Fill in the form
3. Upload proof files
4. Submit transaction

### 4. Verify Efforts
1. Navigate to "Verify"
2. Review pending efforts
3. Approve or reject with feedback

---

## Common Issues

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000  # or 3001, 5432, etc.

# Kill the process
kill -9 <PID>
```

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify user permissions

### MetaMask Not Connecting
- Ensure MetaMask is installed
- Check network (should be localhost for development)
- Clear MetaMask activity tab data if needed

### Contract Deployment Fails
- Ensure Hardhat node is running
- Check you have test ETH
- Verify contract syntax with `npx hardhat compile`

---

## Development Workflow

### Making Changes

**Backend:**
```bash
cd backend
npm run dev  # Auto-reloads on changes
```

**Frontend:**
```bash
cd frontend
npm run dev  # Hot-reloads on changes
```

**Smart Contracts:**
```bash
cd contracts
npx hardhat compile  # Compile contracts
npx hardhat test     # Run tests
```

### Testing

**Backend Tests:**
```bash
cd backend
npm test
npm run test:watch  # Watch mode
```

**Contract Tests:**
```bash
cd contracts
npx hardhat test
npx hardhat coverage  # Test coverage
```

---

## Production Deployment

### Backend
1. Build: `npm run build`
2. Set production environment variables
3. Run migrations
4. Start: `npm start`

### Frontend
1. Build: `npm run build`
2. Serve from `dist/` directory
3. Configure CDN

### Smart Contracts
1. Deploy to testnet first
2. Verify on Etherscan
3. Deploy to mainnet
4. Update frontend/backend with contract address

---

## Next Steps

- Read [ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design
- Check [API.md](docs/API.md) for API documentation
- Review [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- Join our community (links coming soon)

---

## Support

- **Issues**: [GitHub Issues](https://github.com/yourrepo/proof_of_effort/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourrepo/proof_of_effort/discussions)
- **Email**: support@proofofeffort.network (coming soon)

---

Happy building! 🚀
