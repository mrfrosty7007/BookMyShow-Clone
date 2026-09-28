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

const runSecurityVerification = async () => {
  console.log('=====================================================================');
  console.log('--- Starting Sprint 5.1 Registration Security Verification ---');
  console.log('=====================================================================');

  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  try {
    // 1. Test Privilege Escalation Prevention on Public Registration
    console.log('\n1. Testing Privilege Escalation Attempt via POST /api/auth/register...');
    const testEmail = `attacker_${Date.now()}@securitytest.com`;
    const attackPayload = {
      name: 'Security Test Attacker',
      email: testEmail,
      password: 'AttackerPassword123!',
      role: 'admin', // Attempting to escalate to admin
    };

    const registerRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attackPayload),
    });

    const registerData = await registerRes.json();

    if (registerRes.status !== 201) {
      throw new Error(`Registration failed with status ${registerRes.status}: ${JSON.stringify(registerData)}`);
    }

    // Verify response payload role
    if (registerData.user?.role !== 'user') {
      throw new Error(`CRITICAL SECURITY FAILURE: Response user.role is '${registerData.user?.role}' instead of 'user'!`);
    }

    // Verify persisted database document
    const savedUser = await User.findOne({ email: testEmail });
    if (!savedUser) {
      throw new Error(`User not found in database for email ${testEmail}`);
    }

    if (savedUser.role !== 'user') {
      throw new Error(`CRITICAL SECURITY FAILURE: Persisted user.role in MongoDB is '${savedUser.role}' instead of 'user'!`);
    }

    console.log('   ✓ Attacker requested role: "admin"');
    console.log(`   ✓ Server assigned role: "${registerData.user.role}"`);
    console.log(`   ✓ Database persisted role: "${savedUser.role}"`);
    console.log('   ✓ Privilege escalation successfully neutralized! [PASS]');

    // Extract cookie from registration for normal user test
    const userCookie = registerRes.headers.get('set-cookie');

    // 2. Test Existing Admin Login Behavior
    console.log('\n2. Testing Existing Admin Authentication via POST /api/admin/login...');
    const adminLoginRes = await fetch(`${baseUrl}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@bookmyshow.com',
        password: 'AdminPassword123!',
      }),
    });

    const adminLoginData = await adminLoginRes.json();
    if (adminLoginRes.status !== 200 || !adminLoginData.token) {
      throw new Error(`Admin login failed with status ${adminLoginRes.status}: ${JSON.stringify(adminLoginData)}`);
    }

    if (adminLoginData.user?.role !== 'admin') {
      throw new Error(`Admin user has invalid role: ${adminLoginData.user?.role}`);
    }

    console.log(`   ✓ Authenticated admin: ${adminLoginData.user.name} (${adminLoginData.user.email})`);
    console.log(`   ✓ Admin role preserved: "${adminLoginData.user.role}"`);
    console.log('   ✓ Admin login verified! [PASS]');

    const adminCookie = adminLoginRes.headers.get('set-cookie');

    // 3. Test AdminRoute RBAC Protection with User Token vs Admin Token
    console.log('\n3. Testing Admin Authorization Protection on GET /api/admin/dashboard...');

    // A. Unauthenticated Request
    const unauthRes = await fetch(`${baseUrl}/admin/dashboard`);
    if (unauthRes.status !== 401) {
      throw new Error(`Unauthenticated request expected 401, got ${unauthRes.status}`);
    }
    console.log('   ✓ Blocked unauthenticated access with HTTP 401 Unauthorized');

    // B. Normal User Request (Attacker trying to access admin dashboard)
    const userAccessRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: {
        Cookie: userCookie || '',
      },
    });
    if (userAccessRes.status !== 403) {
      throw new Error(`Standard user accessing admin dashboard expected 403, got ${userAccessRes.status}`);
    }
    console.log('   ✓ Blocked standard user token with HTTP 403 Forbidden (RBAC enforced)');

    // C. Legitimate Admin Request
    const adminAccessRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: {
        Cookie: adminCookie || '',
      },
    });
    if (adminAccessRes.status !== 200) {
      throw new Error(`Admin accessing dashboard expected 200, got ${adminAccessRes.status}`);
    }
    console.log('   ✓ Granted legitimate admin access with HTTP 200 OK');

    // Cleanup ephemeral attacker user
    await User.deleteOne({ email: testEmail });
    console.log('\n✓ Cleaned up ephemeral test user record from database.');

    console.log('\n=====================================================================');
    console.log('RESULT: ALL REGISTRATION PRIVILEGE ESCALATION SECURITY CHECKS PASSED!');
    console.log('=====================================================================');
  } finally {
    server.close();
    await mongoose.connection.close();
  }
};

runSecurityVerification().catch((err) => {
  console.error('\n❌ Security Verification Failed:', err);
  process.exit(1);
});
