const BASE_URL = 'http://localhost:5000/api';

async function runAdminTests() {
  console.log('--- Starting Phase 4.1 Admin Auth & Authorization Tests ---');

  // 1. Test Admin Login with valid credentials
  console.log('1. Testing POST /api/admin/login with valid admin credentials...');
  const loginRes = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@bookmyshow.com',
      password: 'AdminPassword123!',
    }),
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok || loginData.user?.role !== 'admin') {
    throw new Error(`Admin login failed: ${JSON.stringify(loginData)}`);
  }
  const adminToken = loginData.token;
  const adminCookie = loginRes.headers.get('set-cookie')?.split(';')[0] || '';
  console.log('✓ Admin login successful. Role verified as admin.');
  console.log(`  Admin User: ${loginData.user.name} (${loginData.user.email})`);

  // 2. Test Admin Login with wrong password
  console.log('2. Testing POST /api/admin/login with incorrect password...');
  const wrongPassRes = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@bookmyshow.com',
      password: 'WrongPassword999!',
    }),
  });
  if (wrongPassRes.status === 401) {
    console.log('✓ Correctly rejected with 401 Unauthorized for invalid password.');
  } else {
    throw new Error(`Expected 401 for wrong password, got ${wrongPassRes.status}`);
  }

  // 3. Register regular user and test regular user attempting admin login
  console.log('3. Testing POST /api/admin/login with regular user credentials...');
  const regularEmail = `reguser_${Date.now()}@example.com`;
  const regUserRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Regular Customer',
      email: regularEmail,
      password: 'Password123!',
    }),
  });
  await regUserRes.json();
  const regularCookie = regUserRes.headers.get('set-cookie')?.split(';')[0] || '';

  const regUserAdminLoginRes = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: regularEmail,
      password: 'Password123!',
    }),
  });
  if (regUserAdminLoginRes.status === 403) {
    console.log('✓ Correctly rejected with 403 Forbidden: non-admin cannot use admin login.');
  } else {
    throw new Error(`Expected 403 for non-admin login, got ${regUserAdminLoginRes.status}`);
  }

  // 4. Test GET /api/admin/profile with Admin credentials
  console.log('4. Testing GET /api/admin/profile with Admin token...');
  const profileRes = await fetch(`${BASE_URL}/admin/profile`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      Cookie: adminCookie,
    },
  });
  const profileData = await profileRes.json();
  if (!profileRes.ok || profileData.user?.role !== 'admin') {
    throw new Error(`Admin profile fetch failed: ${JSON.stringify(profileData)}`);
  }
  console.log(
    `✓ Admin profile verified: ${profileData.user.name} (Role: ${profileData.user.role})`
  );

  // 5. Test GET /api/admin/profile with Regular User credentials (Forbidden)
  console.log('5. Testing GET /api/admin/profile with Regular user credentials...');
  const regProfileRes = await fetch(`${BASE_URL}/admin/profile`, {
    headers: {
      Cookie: regularCookie,
    },
  });
  if (regProfileRes.status === 403) {
    console.log('✓ Correctly rejected with 403 Forbidden for regular user.');
  } else {
    throw new Error(
      `Expected 403 for regular user accessing admin profile, got ${regProfileRes.status}`
    );
  }

  // 6. Test GET /api/admin/dashboard with Admin credentials
  console.log('6. Testing GET /api/admin/dashboard with Admin token...');
  const dashboardRes = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      Cookie: adminCookie,
    },
  });
  const dashboardData = await dashboardRes.json();
  if (!dashboardRes.ok || !dashboardData.data?.metrics) {
    throw new Error(`Admin dashboard stats fetch failed: ${JSON.stringify(dashboardData)}`);
  }
  const m = dashboardData.data.metrics;
  console.log('✓ Admin dashboard metrics retrieved successfully:');
  console.log(`  Total Revenue: ₹${m.totalRevenue}`);
  console.log(`  Total Bookings: ${m.totalBookings}`);
  console.log(`  Active Movies: ${m.totalMovies}`);
  console.log(`  Theaters: ${m.totalTheaters}`);
  console.log(`  Shows: ${m.totalShows}`);
  console.log(`  Registered Users: ${m.totalUsers}`);
  console.log(`  Total Seats Booked: ${m.totalSeatsBooked}`);
  console.log(`  Recent Bookings: ${dashboardData.data.recentBookings?.length || 0} items`);
  console.log(`  Top Movies: ${dashboardData.data.topMovies?.length || 0} items`);

  // 7. Test GET /api/admin/dashboard with unauthenticated request (401)
  console.log('7. Testing GET /api/admin/dashboard unauthenticated...');
  const unauthDashRes = await fetch(`${BASE_URL}/admin/dashboard`);
  if (unauthDashRes.status === 401) {
    console.log('✓ Correctly rejected with 401 Unauthorized for unauthenticated request.');
  } else {
    throw new Error(
      `Expected 401 for unauthenticated dashboard request, got ${unauthDashRes.status}`
    );
  }

  // 8. Test GET /api/admin/dashboard with regular user (403)
  console.log('8. Testing GET /api/admin/dashboard with Regular user token...');
  const regDashRes = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: { Cookie: regularCookie },
  });
  if (regDashRes.status === 403) {
    console.log('✓ Correctly rejected with 403 Forbidden for regular user.');
  } else {
    throw new Error(`Expected 403 for regular user accessing dashboard, got ${regDashRes.status}`);
  }

  console.log('\n--- ALL PHASE 4.1 BACKEND TESTS PASSED SUCCESSFULLY! ---');
}

runAdminTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
