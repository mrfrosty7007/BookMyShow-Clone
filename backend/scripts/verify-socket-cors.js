import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { io as Client } from '../../frontend/node_modules/socket.io-client/build/esm/index.js';
import { initSocket } from '../socket/index.js';
import { connectDB } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const runCorsVerification = async () => {
  console.log('=====================================================================');
  console.log('--- Starting Sprint 5.1 Socket.IO CORS Alignment Verification ---');
  console.log('=====================================================================');

  await connectDB();

  const app = express();
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  await new Promise((resolve) => httpServer.listen(0, resolve));
  const port = httpServer.address().port;
  const socketUrl = `http://localhost:${port}`;

  console.log(`[Test Server] Temporary Socket.IO instance listening on port ${port}\n`);

  const testCases = [
    {
      name: 'Local Frontend Development (localhost:5173)',
      origin: 'http://localhost:5173',
      expectedAllowed: true,
    },
    {
      name: 'Production Vercel Domain (bookmyshow.vercel.app)',
      origin: 'https://bookmyshow.vercel.app',
      expectedAllowed: true,
    },
    {
      name: 'Vercel Feature Branch Preview URL (bms-git-feature-preview.vercel.app)',
      origin: 'https://bms-git-feature-preview.vercel.app',
      expectedAllowed: true,
    },
    {
      name: 'Vercel PR Preview URL (bms-pr-42-team.vercel.app)',
      origin: 'https://bms-pr-42-team.vercel.app',
      expectedAllowed: true,
    },
    {
      name: 'Unauthorized External Origin (evil-hacker-site.com)',
      origin: 'https://evil-hacker-site.com',
      expectedAllowed: false,
    },
    {
      name: 'Spoofed Fake Vercel Subdomain (malicious.vercel.app.attacker.com)',
      origin: 'https://malicious.vercel.app.attacker.com',
      expectedAllowed: false,
    },
  ];

  let passed = 0;

  for (const tc of testCases) {
    process.stdout.write(`Testing: ${tc.name} ... `);

    // 1. Test via Engine.IO HTTP Handshake request
    const handshakeRes = await fetch(`${socketUrl}/socket.io/?EIO=4&transport=polling`, {
      headers: {
        Origin: tc.origin,
      },
    });

    const acaoHeader = handshakeRes.headers.get('access-control-allow-origin');
    const isAllowed = acaoHeader === tc.origin;

    if (isAllowed === tc.expectedAllowed) {
      if (tc.expectedAllowed) {
        console.log(`✓ ALLOWED (Access-Control-Allow-Origin: ${acaoHeader})`);
      } else {
        console.log(`✓ BLOCKED (CORS properly denied, origin not reflected)`);
      }
      passed++;
    } else {
      console.log(`❌ FAILED! Expected allowed=${tc.expectedAllowed}, got allowed=${isAllowed}`);
      throw new Error(`CORS validation failed for ${tc.origin}`);
    }
  }

  // 2. Full WebSocket Client connection test from a Vercel Preview origin
  console.log('\nTesting full client connection simulation with .vercel.app origin...');
  await new Promise((resolve, reject) => {
    const socket = Client(socketUrl, {
      extraHeaders: {
        Origin: 'https://bms-preview-staging.vercel.app',
      },
      transports: ['polling', 'websocket'],
      timeout: 5000,
    });

    socket.on('connect', () => {
      console.log(`✓ Socket client successfully connected! Socket ID: ${socket.id}`);
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (err) => {
      reject(new Error(`Socket connection failed unexpectedly: ${err.message}`));
    });
  });

  httpServer.close();
  await mongoose.connection.close();

  console.log('\n=====================================================================');
  console.log(`RESULT: ALL ${passed}/${testCases.length} CORS TESTS PASSED SUCCESSFULLY!`);
  console.log('Socket.IO CORS is now fully aligned with Express.');
  console.log('=====================================================================');
  process.exit(0);
};

runCorsVerification().catch((err) => {
  console.error('\n❌ Verification failed:', err);
  process.exit(1);
});
