# Web3 Message Signer Backend

A Node.js + Express backend API for verifying cryptographic signatures from Web3 wallets.

## Features

- **Signature Verification**: Cryptographically verify Ethereum message signatures using ethers.js
- **CORS Support**: Configured to work with frontend applications
- **Error Handling**: Comprehensive error handling with detailed responses
- **Health Check**: Built-in health check endpoint for monitoring
- **Security**: Helmet.js for security headers and input validation
- **TypeScript**: Full TypeScript support with type definitions

## API Endpoints

### `GET /health`
Health check endpoint to verify server status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "Web3 Message Signer Backend"
}
```

### `POST /verify-signature`
Verify a cryptographic signature for a given message.

**Request Body:**
```json
{
  "message": "Hello, Web3!",
  "signature": "0x1234567890abcdef..."
}
```

**Success Response (200):**
```json
{
  "isValid": true,
  "signer": "0x742d35Cc6634C0532925a3b8D4C2C4e0C8A7d3E2",
  "originalMessage": "Hello, Web3!",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Response (400):**
```json
{
  "isValid": false,
  "error": "Invalid signature format",
  "originalMessage": "Hello, Web3!",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Development:**
   ```bash
   npm run dev
   ```

4. **Production Build:**
   ```bash
   npm run build
   npm start
   ```

5. **Testing:**
   ```bash
   npm test
   ```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)

## Architecture

The backend uses a modular architecture:

- **`src/index.ts`** - Main Express server setup
- **`src/utils/signatureVerification.ts`** - Signature verification logic using ethers.js
- **`src/middleware/errorHandler.ts`** - Global error handling middleware

## Security Features

- **Input Validation**: Validates message and signature format
- **CORS Configuration**: Restricts cross-origin requests to allowed origins
- **Helmet.js**: Adds security headers
- **Error Sanitization**: Prevents sensitive information leakage

## Signature Verification Process

1. **Input Validation**: Checks for required fields and proper format
2. **Ethers.js Verification**: Uses `ethers.verifyMessage()` which handles EIP-191 prefixing
3. **Address Recovery**: Recovers the signer's Ethereum address
4. **Response**: Returns verification result with signer address

## Testing

The backend includes comprehensive tests for:
- Signature verification functionality
- Error handling
- API endpoint responses
- Input validation

Run tests with: `npm test`

## Deployment

### Docker (Recommended)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

### Manual Deployment
1. Build the project: `npm run build`
2. Set environment variables
3. Start the server: `npm start`

## Contributing

1. Follow TypeScript best practices
2. Add tests for new functionality
3. Use proper error handling
4. Document new endpoints in this README 