# Proof of Effort Network - Technical Architecture

## System Overview

The Proof of Effort Network is a decentralized platform built on three main layers:

1. **Blockchain Layer** - Immutable record keeping
2. **Backend Layer** - Business logic and API
3. **Frontend Layer** - User interface

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Dashboard│  │  Submit  │  │  Verify  │  │ Profile  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API / Web3
                         │
┌────────────────────────┴────────────────────────────────────┐
│                  Backend (Node.js + Express)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Effort  │  │  Verify  │  │  Trust   │   │
│  │ Service  │  │ Service  │  │ Service  │  │  Score   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────┬──────────────────────────────────┬─────────────┘
             │                                  │
     ┌───────┴────────┐                ┌───────┴────────┐
     │   PostgreSQL   │                │   Smart        │
     │   + Redis      │                │   Contracts    │
     │                │                │   (Ethereum)   │
     └────────────────┘                └────────────────┘
```

## Technology Stack

### Blockchain Layer
- **Smart Contracts**: Solidity 0.8.20
- **Framework**: Hardhat
- **Network**: Ethereum-compatible (Polygon, Arbitrum, etc.)
- **Libraries**: OpenZeppelin

### Backend Layer
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 14+
- **Cache**: Redis
- **Storage**: IPFS (via Infura or local node)
- **Authentication**: JWT + Wallet signatures

### Frontend Layer
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Web3**: ethers.js v6
- **Forms**: React Hook Form + Zod

## Data Flow

### 1. Effort Submission Flow
```
User → Frontend → Backend API → PostgreSQL (metadata)
                              → IPFS (proof files)
                              → Smart Contract (record hash)
```

### 2. Verification Flow
```
Verifier → Review Effort → Submit Verification
        → Backend validates
        → Update PostgreSQL
        → Call Smart Contract
        → Update Trust Score
```

### 3. Trust Score Calculation
```
Scheduled Job → Aggregate user data
             → Calculate scores
             → Update database
             → Cache in Redis
```

## Security Measures

1. **Authentication**
   - Wallet signature verification
   - JWT with short expiration
   - Rate limiting per IP/user

2. **Data Protection**
   - Input validation (Zod schemas)
   - SQL injection prevention (parameterized queries)
   - XSS protection (sanitization)
   - CORS configuration

3. **Blockchain Security**
   - ReentrancyGuard on contracts
   - Access control (Ownable)
   - Event logging for transparency

4. **Fraud Detection**
   - Pattern analysis
   - Geographic anomaly detection
   - Time-based validation
   - Peer review consensus

## Scalability Considerations

1. **Database**
   - Indexed queries
   - Connection pooling
   - Read replicas for queries

2. **Caching**
   - Redis for frequently accessed data
   - CDN for static assets
   - Browser caching strategies

3. **Blockchain**
   - Batch transactions
   - Layer 2 solutions
   - Off-chain computation with on-chain verification

4. **IPFS**
   - Pinning service
   - CDN gateway
   - Content addressing

## Deployment Architecture

### Development
- Local PostgreSQL
- Local Redis
- Hardhat local node
- Vite dev server

### Production
- PostgreSQL (managed service)
- Redis (managed service)
- IPFS node or Infura
- CDN (Cloudflare)
- Load balancer
- Container orchestration (Docker + Kubernetes)

## Monitoring & Logging

- **Application**: Winston (structured logging)
- **Infrastructure**: Prometheus + Grafana
- **Errors**: Sentry
- **Analytics**: Custom dashboard

## Future Enhancements

1. Mobile applications (React Native)
2. Multi-chain support
3. AI-powered fraud detection
4. Social features (endorsements, teams)
5. Advanced analytics dashboard
6. Decentralized identity integration
7. Zero-knowledge proofs for privacy
