import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const runAuthFixVerification = async () => {
  console.log('=====================================================================');
  console.log('--- Verifying Production Auth Bug Fix & Token Flow ---');
  console.log('=====================================================================');

  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  const testEmail = `auth_fix_test_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let userId = null;

  try {
    // 1. Verify Registration returns token in JSON response
    console.log('\n1. Testing POST /api/auth/register returns Bearer token in response body...');
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Auth Fix Test User',
        email: testEmail,
        password: testPassword,
      }),
    });

    const regData = await regRes.json();
    if (regRes.status !== 201) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }

    if (!regData.token || typeof regData.token !== 'string') {
      throw new Error('FAIL: Register response did not include a valid token string!');
    }
    userId = regData.user?._id;
    console.log('   ✅ Register response returned token:', regData.token.slice(0, 20) + '...');

    // 2. Verify Login returns token in JSON response
    console.log('\n2. Testing POST /api/auth/login returns Bearer token in response body...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const loginData = await loginRes.json();
    if (loginRes.status !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }

    if (!loginData.token || typeof loginData.token !== 'string') {
      throw new Error('FAIL: Login response did not include a valid token string!');
    }
    const authToken = loginData.token;
    console.log('   ✅ Login response returned token:', authToken.slice(0, 20) + '...');

    // 3. Verify GET /api/bookings/me with Bearer token only (NO cookies)
    console.log(
      '\n3. Testing GET /api/bookings/me with Authorization: Bearer <token> (No cookies)...'
    );
    const myBookingsRes = await fetch(`${baseUrl}/bookings/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const myBookingsData = await myBookingsRes.json();
    if (myBookingsRes.status !== 200) {
      throw new Error(
        `GET /api/bookings/me failed with status ${myBookingsRes.status}: ${JSON.stringify(myBookingsData)}`
      );
    }
    console.log(
      '   ✅ GET /api/bookings/me succeeded without cookies! Count:',
      myBookingsData.count
    );

    // 4. Verify GET /api/bookings/my-bookings alias with Bearer token only
    console.log(
      '\n4. Testing GET /api/bookings/my-bookings alias with Authorization: Bearer <token>...'
    );
    const aliasRes = await fetch(`${baseUrl}/bookings/my-bookings`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const aliasData = await aliasRes.json();
    if (aliasRes.status !== 200) {
      throw new Error(
        `GET /api/bookings/my-bookings failed with status ${aliasRes.status}: ${JSON.stringify(aliasData)}`
      );
    }
    console.log(
      '   ✅ GET /api/bookings/my-bookings alias succeeded without cookies! Count:',
      aliasData.count
    );

    // 5. Verify POST /api/bookings/create with Bearer token only passes auth
    console.log('\n5. Testing POST /api/bookings/create with Authorization: Bearer <token>...');
    const createRes = await fetch(`${baseUrl}/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({}), // empty body to check auth passes before validation
    });

    const createData = await createRes.json();
    // It should fail with 400 Bad Request for missing fields, NOT 401 Unauthorized
    if (createRes.status === 401) {
      throw new Error(
        `FAIL: POST /api/bookings/create returned 401 Unauthorized: ${JSON.stringify(createData)}`
      );
    }
    if (createRes.status === 400) {
      console.log(
        '   ✅ POST /api/bookings/create successfully passed auth middleware! (Received expected validation 400):',
        createData.message
      );
    }

    // 6. Verify POST /api/bookings alias with Bearer token only passes auth
    console.log('\n6. Testing POST /api/bookings alias with Authorization: Bearer <token>...');
    const postAliasRes = await fetch(`${baseUrl}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({}),
    });

    const postAliasData = await postAliasRes.json();
    if (postAliasRes.status === 401) {
      throw new Error(
        `FAIL: POST /api/bookings alias returned 401 Unauthorized: ${JSON.stringify(postAliasData)}`
      );
    }
    if (postAliasRes.status === 400) {
      console.log(
        '   ✅ POST /api/bookings alias successfully passed auth middleware! (Received expected validation 400):',
        postAliasData.message
      );
    }

    // 7. Verify request WITHOUT token or cookies fails with 401
    console.log('\n7. Testing GET /api/bookings/me without token or cookies...');
    const unauthRes = await fetch(`${baseUrl}/bookings/me`, {
      method: 'GET',
    });
    const unauthData = await unauthRes.json();
    if (
      unauthRes.status !== 401 ||
      unauthData.message !== 'Not authorized, no authentication token found'
    ) {
      throw new Error(
        `FAIL: Expected 401 'Not authorized, no authentication token found', got: ${unauthRes.status} ${JSON.stringify(unauthData)}`
      );
    }
    console.log('   ✅ Unauthenticated request correctly rejected with 401:', unauthData.message);

    // 8. Verify GET /api/auth/me with Bearer token
    console.log('\n8. Testing GET /api/auth/me with Authorization: Bearer <token>...');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const meData = await meRes.json();
    if (meRes.status !== 200 || meData.user?.email !== testEmail) {
      throw new Error(`FAIL: GET /api/auth/me failed: ${JSON.stringify(meData)}`);
    }
    console.log(
      '   ✅ GET /api/auth/me successfully returned user profile for:',
      meData.user.email
    );

    console.log('\n=====================================================================');
    console.log('🎉 ALL AUTHENTICATION FLOW VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('=====================================================================');
  } finally {
    if (userId) {
      await User.deleteOne({ _id: userId });
      console.log('Cleaned up test user:', testEmail);
    }
    server.close();
    await mongoose.connection.close();
  }
};

runAuthFixVerification().catch((err) => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err);
  process.exit(1);
});
