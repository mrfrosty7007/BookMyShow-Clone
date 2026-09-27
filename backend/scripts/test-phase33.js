const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
  console.log('--- Starting Phase 3.3 End-to-End Verification ---');

  // 1. Authenticate user
  const email = `tester_${Date.now()}@example.com`;
  const password = 'Password123!';
  console.log(`1. Registering user: ${email}`);

  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Phase3.3 Tester', email, password }),
  });
  const regData = await regRes.json();
  if (!regRes.ok) {
    throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
  }
  const setCookie = regRes.headers.get('set-cookie');
  const tokenMatch = setCookie?.match(/jwt=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  const cookieHeader = setCookie ? setCookie.split(';')[0] : '';
  console.log(
    `✓ User registered and authenticated. Cookie/Token extracted: ${token ? 'OK' : 'MISSING'}`
  );

  // 2. Fetch available shows
  console.log('2. Fetching available shows...');
  const showsRes = await fetch(`${BASE_URL}/shows`);
  const showsData = await showsRes.json();
  const showList = showsData.data || showsData.shows || showsData;
  if (!showList || showList.length === 0) {
    throw new Error('No shows available in database');
  }
  const show = showList[0];
  console.log(`✓ Selected show: ${show._id} (Movie: ${show.movie?.title || 'Unknown'})`);

  // Fetch detailed show with live bookedSeats
  const detailRes = await fetch(`${BASE_URL}/shows/${show._id}`);
  const detailData = await detailRes.json();
  const detailedShow = detailData.data || detailData;

  // Pick seats not currently booked
  const booked = new Set(detailedShow.bookedSeats || []);
  const allSeatCandidates = [];
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((row) => {
    for (let i = 1; i <= 10; i++) {
      allSeatCandidates.push(`${row}${i}`);
    }
  });
  const availableSeats = allSeatCandidates.filter((s) => !booked.has(s));
  if (availableSeats.length < 2) {
    throw new Error('Not enough unbooked seats for test');
  }
  const testSeats = [availableSeats[0], availableSeats[1]];
  console.log(`3. Attempting to book available seats: ${testSeats.join(', ')}`);

  // 3. Create booking
  const createRes = await fetch(`${BASE_URL}/bookings/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      showId: show._id,
      seats: testSeats,
      paymentMethod: 'UPI',
    }),
  });

  const createData = await createRes.json();
  if (!createRes.ok) {
    throw new Error(`Booking creation failed: ${JSON.stringify(createData)}`);
  }
  console.log('✓ Booking created successfully!');
  console.log(`  Booking ID: ${createData.booking.bookingId}`);
  console.log(`  Total Amount: ₹${createData.booking.totalAmount}`);
  console.log(`  QR Token: ${createData.booking.qrToken.substring(0, 40)}...`);

  // 4. Fetch user's bookings (GET /api/bookings/me)
  console.log('4. Fetching user bookings (/api/bookings/me)...');
  const meRes = await fetch(`${BASE_URL}/bookings/me`, {
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader },
  });
  const meData = await meRes.json();
  if (!meRes.ok || !meData.bookings || meData.bookings.length === 0) {
    throw new Error(`GET /api/bookings/me failed: ${JSON.stringify(meData)}`);
  }
  console.log(`✓ Successfully retrieved ${meData.count} booking(s) for user.`);

  // 5. Fetch single booking by bookingId (GET /api/bookings/:id)
  console.log(`5. Fetching booking by bookingId: ${createData.booking.bookingId}...`);
  const getRes = await fetch(`${BASE_URL}/bookings/${createData.booking.bookingId}`, {
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader },
  });
  const getData = await getRes.json();
  if (!getRes.ok || !getData.booking) {
    throw new Error(`GET /api/bookings/:id failed: ${JSON.stringify(getData)}`);
  }
  console.log('✓ Booking verified by ID:');
  console.log(`  Movie Title: ${getData.booking.movie?.title}`);
  console.log(`  Theater: ${getData.booking.theater?.name}`);
  console.log(`  Seats: ${getData.booking.seats.join(', ')}`);
  console.log(`  Payment Status: ${getData.booking.paymentStatus}`);

  // 6. Security verification: Unauthorized user should not access booking
  console.log('6. Security check: testing unauthenticated request...');
  const unauthorizedRes = await fetch(`${BASE_URL}/bookings/${createData.booking.bookingId}`);
  if (unauthorizedRes.status === 401) {
    console.log('✓ Security verified: 401 Unauthorized returned when no token provided.');
  } else {
    console.warn(`! Security check returned status ${unauthorizedRes.status}`);
  }

  // 7. Security verification: Cross-user access (User B trying to access User A's ticket)
  console.log('7. Security check: testing cross-user booking access...');
  const regResB = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'User B (Intruder)',
      email: `intruder_${Date.now()}@example.com`,
      password: 'Password123!',
    }),
  });
  const cookieB = regResB.headers.get('set-cookie')?.split(';')[0] || '';
  const crossUserRes = await fetch(`${BASE_URL}/bookings/${createData.booking.bookingId}`, {
    headers: { Cookie: cookieB },
  });
  if (crossUserRes.status === 403) {
    console.log(
      '✓ Cross-user security verified: 403 Forbidden returned when User B attempts to access User A ticket.'
    );
  } else {
    throw new Error(
      `Security failed: User B received status ${crossUserRes.status} instead of 403 Forbidden`
    );
  }

  console.log('\n--- ALL PHASE 3.3 BACKEND & SECURITY TESTS PASSED SUCCESSFULLY! ---');
}

runTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
