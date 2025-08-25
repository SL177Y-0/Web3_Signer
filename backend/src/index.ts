import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { verifySignature } from './utils/signatureVerification';
import { errorHandler } from './middleware/errorHandler';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


app.use(helmet());


app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
}));


if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    if (req.body) console.log('Body:', req.body);
    next();
  });
}


app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Web3 Message Signer Backend'
  });
});


app.post('/verify-signature', async (req, res) => {
  try {
    const { message, signature } = req.body;

 
    if (!message || !signature) {
      return res.status(400).json({
        isValid: false,
        error: 'Both message and signature are required',
        details: {
          message: !message ? 'Missing message field' : undefined,
          signature: !signature ? 'Missing signature field' : undefined
        }
      });
    }

    if (typeof message !== 'string' || typeof signature !== 'string') {
      return res.status(400).json({
        isValid: false,
        error: 'Message and signature must be strings'
      });
    }

   
    if (!signature.startsWith('0x') || signature.length !== 132) {
      return res.status(400).json({
        isValid: false,
        error: 'Invalid signature format. Expected 0x-prefixed hex string of 130 characters.'
      });
    }

  
    const verification = await verifySignature(message, signature);
    
    if (verification.isValid) {
      res.json({
        isValid: true,
        signer: verification.signer,
        originalMessage: message,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        isValid: false,
        error: verification.error || 'Invalid signature',
        originalMessage: message,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Signature verification error:', error);
    res.status(500).json({
      isValid: false,
      error: 'Internal server error during signature verification',
      timestamp: new Date().toISOString()
    });
  }
});


app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    availableEndpoints: ['/health', '/verify-signature']
  });
});


app.use(errorHandler);


app.listen(PORT, () => {
  console.log(` Web3 Message Signer Backend running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(` Signature verification: http://localhost:${PORT}/verify-signature`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app; 
