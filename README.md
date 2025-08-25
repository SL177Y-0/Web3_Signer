Dynamic Sdk has a bug for verify code for now , hoping for a fix in future 

Live Link -- https://web3-signer-mu.vercel.app/

# Web3 Message Signer & Verifier

A full-stack Web3 application that enables users to authenticate with Dynamic.xyz embedded wallets, sign custom messages, and verify signatures cryptographically.

##  Features

- **Headless Dynamic.xyz Integration**: Email-first authentication with embedded wallet creation
- **Cryptographic Message Signing**: Sign custom messages using Web3 wallets
- **Backend Signature Verification**: Verify signatures using ethers.js with EIP-191 standard
- **Beautiful Modern UI**: Responsive design with dark theme and Web3 aesthetics
- **Signature History**: Local storage of signed messages with full details
- **Real-time Backend Health**: Monitor backend connectivity status
- **Comprehensive Error Handling**: User-friendly error messages and robust validation

##  Architecture

### Frontend (Next.js 15 + React 19)
- **Dynamic.xyz SDK**: Headless authentication and wallet management
- **Ethers.js**: Web3 wallet interactions and message signing
- **Radix UI**: Accessible, unstyled UI components
- **Tailwind CSS**: Utility-first styling
- **React Hot Toast**: User notifications

### Backend (Node.js + Express)
- **Express.js**: RESTful API server
- **Ethers.js**: Cryptographic signature verification
- **TypeScript**: Full type safety
- **CORS & Security**: Helmet.js and input validation

##  Prerequisites

- **Node.js 18+** (with npm, yarn, or pnpm)
- **Dynamic.xyz Account**: Free tier at [app.dynamic.xyz](https://app.dynamic.xyz)

##  **Complete User Flow (According to Guide)**

### **Step-by-Step User Journey**

1. **Authentication Phase**
   ```
   User visits app → Sees email input → Enters email → 
   Receives OTP email → Enters OTP → Creates embedded wallet
   ```

2. **Wallet Connection Phase**
   ```
   Email verified → Embedded wallet auto-created → 
   Wallet address displayed → Ready to sign messages
   ```

3. **Message Signing Phase**
   ```
   User types custom message → Clicks "Sign Message" → 
   Browser wallet prompt → User confirms → Signature generated
   ```

4. **Verification Phase**
   ```
   Signature sent to backend → Backend verifies with ethers.js → 
   Returns {isValid, signer, originalMessage} → Results displayed
   ```

5. **History Management**
   ```
   Each signature saved to localStorage → 
   User can view history → Copy signatures → Delete entries
   ```

### **Expected Flow Details**
- **Authentication**: Email + OTP (no MetaMask popup required)
- **Wallet**: Embedded wallet automatically created by Dynamic.xyz
- **Signing**: Browser-based signing (may show embedded wallet UI)
- **Verification**: Backend cryptographically verifies signature
- **Storage**: History persists across browser sessions

##  Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd Web3_Signeer

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Dynamic.xyz Configuration

1. Create a Dynamic.xyz account at [app.dynamic.xyz](https://app.dynamic.xyz)
2. Create a new environment
3. Enable **Embedded Wallets** in your dashboard:
   - Go to **Wallets > Embedded Wallets**
   - Enable embedded wallet creation
4. Copy your **Environment ID**

### 3. Environment Configuration

#### Frontend Environment (.env.local)
```bash
# Copy the example file
cp .env.local.example .env.local

# Edit with your values
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=2e180032-bc06-43e7-8b29-f155290619ca
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_DYNAMIC_DEBUG=false
```

#### Backend Environment (backend/.env)
```bash
# Copy the example file
cd backend
cp .env.example .env

# Edit with your values
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. Development Setup

#### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will start on [http://localhost:3001](http://localhost:3001)

#### Start Frontend (in new terminal)
```bash
# From project root
npm run dev
```
The frontend will start on [http://localhost:3000](http://localhost:3000)

### 5. Quick Setup (All-in-One)

```bash
# Install all dependencies
npm run setup

# Setup environment files
cp .env.local.example .env.local
cp backend/.env.example backend/.env

# Add your Dynamic.xyz Environment ID to .env.local
# NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your-env-id-here
```

### 6. Verify Setup

```bash
# Run diagnostic tool
npm run debug

# If all checks pass, start the servers:
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
npm run dev
```

**Manual Verification:**
1. Open [http://localhost:3000](http://localhost:3000)
2. You should see the Web3 Message Signer interface
3. Check that "Backend Online" indicator is green
4. Test authentication with your email
5. Sign a test message and verify it works end-to-end

### Manual Testing Checklist
- [ ] Email authentication works
- [ ] OTP verification completes successfully
- [ ] Wallet address displays correctly
- [ ] Message signing prompts wallet interaction
- [ ] Backend verification returns correct results
- [ ] Signature history persists across sessions
- [ ] Copy-to-clipboard functions work
- [ ] Disconnect clears all state


### Dynamic.xyz Dashboard Settings

1. **CORS Configuration**: Add your deployment domains
2. **Webhook Endpoints**: Configure if needed for production
3. **Rate Limiting**: Set appropriate limits for your use case
4. **Security Settings**: Review and configure security policies


##  Project Structure

```
Web3_Signeer/
├── app/                          # Next.js app directory
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Main application component
├── backend/                      # Express.js backend
│   ├── src/
│   │   ├── index.ts            # Express server setup
│   │   ├── utils/              # Utility functions
│   │   │   └── signatureVerification.ts
│   │   └── middleware/         # Express middleware
│   │       └── errorHandler.ts
│   ├── package.json            # Backend dependencies
│   └── tsconfig.json           # TypeScript config
├── components/                   # React components
│   ├── dynamic-provider.tsx    # Dynamic.xyz context provider
│   └── ui/                     # Radix UI components
├── lib/                         # Utility libraries
│   ├── utils.ts                # General utilities
│   └── web3.ts                 # Web3-specific functions
├── GUIDE/                       # Development guides
├── package.json                # Frontend dependencies
└── README.md                   # This file
```

##  API Endpoints

### Backend API

#### `GET /health`
Health check endpoint
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "Web3 Message Signer Backend"
}
```

#### `POST /verify-signature`
Verify a message signature
```json
// Request
{
  "message": "Hello, Web3!",
  "signature": "0x1234..."
}

// Response (Success)
{
  "isValid": true,
  "signer": "0x742d35Cc6634C0532925a3b8D4C2C4e0C8A7d3E2",
  "originalMessage": "Hello, Web3!",
  "timestamp": "2024-01-01T12:00:00.000Z"
}

// Response (Error)
{
  "isValid": false,
  "error": "Invalid signature format",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```


#### Browser Developer Tools
- Check Console for JavaScript errors
- Verify Network tab for API call failures
- Check Application > Local Storage for saved history

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Add tests for new functionality
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## Acknowledgments

- [Dynamic.xyz](https://dynamic.xyz) for Web3 authentication infrastructure
- [Ethers.js](https://ethers.org) for Ethereum interactions
