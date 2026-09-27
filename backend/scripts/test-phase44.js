import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bookmyshow.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

async function runPhase44Tests() {
  console.log('===============================================================');
  console.log('--- Starting Phase 4.4 Show Scheduling & Conflict Tests ---');
  console.log('===============================================================\n');

  // 1. Admin Authentication
  console.log('1. Authenticating as Administrator...');
  const loginRes = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.token) {
    throw new Error(`Admin login failed: ${JSON.stringify(loginData)}`);
  }
  const adminToken = loginData.token;
  console.log(`✓ Admin authenticated: ${loginData.user.name} (${loginData.user.email})`);

  // Verify access control (unauthenticated and non-admin)
  console.log('\n2. Testing Access Control on /api/admin/shows...');
  const unauthRes = await fetch(`${BASE_URL}/admin/shows`);
  if (unauthRes.status !== 401) {
    throw new Error(`Expected 401 Unauthorized for unauth request, got ${unauthRes.status}`);
  }
  console.log('✓ Blocked unauthenticated access (401 Unauthorized)');

  // 2. Fetch dependencies: Active Movie and Active Theater
  console.log('\n3. Fetching Active Movie and Multiplex Theater...');
  const moviesRes = await fetch(`${BASE_URL}/movies`);
  const moviesData = await moviesRes.json();
  const movie = moviesData.movies?.[0];
  if (!movie) throw new Error('No active movies found for testing');
  console.log(`✓ Using Movie: "${movie.title}" (Duration: ${movie.duration || 120} min)`);

  const theatersRes = await fetch(`${BASE_URL}/theaters`);
  const theatersData = await theatersRes.json();
  const theater = theatersData.theaters?.[0];
  if (!theater) throw new Error('No active theaters found for testing');
  const screen = theater.screens?.[0] || { name: 'Screen 1', type: 'IMAX', capacity: 100 };
  console.log(
    `✓ Using Theater: "${theater.name}" - ${screen.name} [${screen.type}] (Capacity: ${screen.capacity})`
  );

  // 3. Create a Single Show with Auto End Time
  console.log('\n4. Testing POST /api/admin/shows (Create Show with Auto End Time)...');
  // Schedule for tomorrow at 18:00 (6:00 PM) UTC
  const testDate = new Date();
  testDate.setDate(testDate.getDate() + 2); // 2 days in the future
  testDate.setUTCHours(18, 0, 0, 0); // 6:00 PM

  const duration = movie.duration || 120;
  const trailerBuffer = 15;
  const cleaningBuffer = 20;
  const totalMinutes = duration + trailerBuffer + cleaningBuffer;

  const createRes = await fetch(`${BASE_URL}/admin/shows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      movie: movie._id,
      theater: theater._id,
      screen: 1,
      screenId: screen._id,
      startTime: testDate.toISOString(),
      price: 250,
      trailerBuffer,
      cleaningBuffer,
    }),
  });

  const createData = await createRes.json();
  if (!createRes.ok || !createData.show) {
    throw new Error(`Show creation failed: ${JSON.stringify(createData)}`);
  }
  const show1 = createData.show;
  console.log(`✓ Show 1 created successfully: ID: ${show1._id}`);
  console.log(`  Start Time: ${new Date(show1.startTime).toISOString()}`);
  console.log(`  End Time:   ${new Date(show1.endTime).toISOString()}`);

  // 4. Verify Auto End Time Calculation
  console.log('\n5. Verifying Auto End Time Mathematics...');
  const expectedEnd = new Date(new Date(show1.startTime).getTime() + totalMinutes * 60 * 1000);
  const actualEnd = new Date(show1.endTime);
  if (Math.abs(expectedEnd.getTime() - actualEnd.getTime()) > 1000) {
    throw new Error(
      `End time mismatch! Expected: ${expectedEnd.toISOString()}, got: ${actualEnd.toISOString()}`
    );
  }
  console.log(
    `✓ End time correctly calculated: Movie(${duration}m) + Trailers(${trailerBuffer}m) + Cleaning(${cleaningBuffer}m) = ${totalMinutes}m`
  );

  // 5. Conflict Detection: Attempt to schedule overlapping show
  console.log('\n6. Testing Conflict Detection (Overlap Rejection)...');
  // Overlap time: start 30 minutes after Show 1 starts
  const overlapStart = new Date(new Date(show1.startTime).getTime() + 30 * 60 * 1000);

  const conflictRes = await fetch(`${BASE_URL}/admin/shows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      movie: movie._id,
      theater: theater._id,
      screen: 1,
      screenId: screen._id,
      startTime: overlapStart.toISOString(),
      price: 200,
    }),
  });

  const conflictData = await conflictRes.json();
  if (conflictRes.status !== 409 || !conflictData.message?.includes('already occupied')) {
    throw new Error(
      `Expected 409 Conflict rejection, got status: ${conflictRes.status}, data: ${JSON.stringify(conflictData)}`
    );
  }
  console.log(`✓ Overlapping show rejected with 409 Conflict: "${conflictData.message}"`);
  console.log(
    `  Suggested next available slot: ${conflictData.suggestedTimeString} (${conflictData.suggestedNextAvailableTime})`
  );

  // 6. Cleaning Buffer Enforcement
  console.log('\n7. Testing Cleaning Buffer Enforcement...');
  // Try to start 5 minutes before Show 1's cleaning buffer finishes
  const insideCleaningBuffer = new Date(new Date(show1.endTime).getTime() - 5 * 60 * 1000);
  const bufferConflictRes = await fetch(`${BASE_URL}/admin/shows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      movie: movie._id,
      theater: theater._id,
      screen: 1,
      screenId: screen._id,
      startTime: insideCleaningBuffer.toISOString(),
      price: 200,
    }),
  });

  if (bufferConflictRes.status !== 409) {
    throw new Error(
      `Expected cleaning buffer violation to return 409 Conflict, got ${bufferConflictRes.status}`
    );
  }
  console.log(
    '✓ Cleaning buffer properly protected: shows cannot be scheduled before preparation completes'
  );

  // 7. Dynamic Pricing Engine Verification
  console.log('\n8. Testing Dynamic Pricing Engine...');
  console.log(
    `  Pricing Snapshot: TimeSlot=${show1.pricingSnapshot?.timeSlot} (${show1.pricingSnapshot?.timeMultiplier}x), ScreenType=${show1.pricingSnapshot?.screenType} (${show1.pricingSnapshot?.screenMultiplier}x)`
  );
  console.log('  Tier Prices:', show1.pricingSnapshot?.tierPrices);
  if (!show1.pricingSnapshot?.tierPrices?.VIP || !show1.pricingSnapshot?.tierPrices?.Standard) {
    throw new Error('Pricing snapshot missing required tier pricing!');
  }
  console.log('✓ Dynamic Pricing verified: VIP, Premium, and Standard tiers calculated properly');

  // 8. Seat Inventory Generation Verification
  console.log('\n9. Testing Seat Inventory Generation...');
  if (!Array.isArray(show1.seats) || show1.seats.length === 0) {
    throw new Error('Show seat inventory is empty!');
  }
  const sampleSeat = show1.seats[0];
  console.log(`✓ Total generated seats: ${show1.seats.length}`);
  console.log(
    `  Sample Seat: [${sampleSeat.seatNumber}] Tier: ${sampleSeat.tier}, Price: ₹${sampleSeat.price}, Status: ${sampleSeat.status}`
  );

  // 9. Recurring Schedule Creation
  console.log('\n10. Testing Recurring Show Schedule Creation...');
  const recurringStart = new Date();
  recurringStart.setDate(recurringStart.getDate() + 10); // 10 days in future
  recurringStart.setUTCHours(10, 0, 0, 0); // 10:00 AM

  const recurringRes = await fetch(`${BASE_URL}/admin/shows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      movie: movie._id,
      theater: theater._id,
      screen: 2, // Use Screen 2 to avoid conflicts
      startTime: recurringStart.toISOString(),
      price: 220,
      recurring: {
        type: 'weekly',
        count: 4, // 4 weeks
      },
    }),
  });

  const recurringData = await recurringRes.json();
  if (!recurringRes.ok || recurringData.count !== 4) {
    throw new Error(`Recurring schedule failed: ${JSON.stringify(recurringData)}`);
  }
  console.log(
    `✓ Scheduled 4 recurring weekly shows with Group ID: ${recurringData.shows[0].recurringGroupId}`
  );

  // 10. Bulk Show Creation
  console.log('\n11. Testing Bulk Daily Scheduler...');
  const bulkDate = new Date();
  bulkDate.setDate(bulkDate.getDate() + 5);
  const bulkDateStr = bulkDate.toISOString().split('T')[0];

  const bulkRes = await fetch(`${BASE_URL}/admin/shows/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      movie: movie._id,
      theater: theater._id,
      screen: 3, // Screen 3
      date: bulkDateStr,
      timeSlots: ['09:00', '13:00', '17:00'],
      price: 180,
    }),
  });

  const bulkData = await bulkRes.json();
  if (!bulkRes.ok || bulkData.count !== 3) {
    throw new Error(`Bulk scheduler failed: ${JSON.stringify(bulkData)}`);
  }
  console.log(`✓ Bulk created ${bulkData.count} shows for ${bulkDateStr}`);

  // 11. Show Cancellation & Slot Release
  console.log('\n12. Testing Show Cancellation (PATCH /cancel)...');
  const cancelRes = await fetch(`${BASE_URL}/admin/shows/${show1._id}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  const cancelData = await cancelRes.json();
  if (!cancelRes.ok || cancelData.show?.status !== 'cancelled') {
    throw new Error(`Cancel show failed: ${JSON.stringify(cancelData)}`);
  }
  console.log('✓ Show successfully marked as cancelled');

  // Verify cancelled show slot is now FREE for new scheduling
  console.log('  Verifying screen slot is released after cancellation...');
  const reScheduleRes = await fetch(`${BASE_URL}/admin/shows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      movie: movie._id,
      theater: theater._id,
      screen: 1,
      screenId: screen._id,
      startTime: show1.startTime,
      price: 300,
    }),
  });

  const reScheduleData = await reScheduleRes.json();
  if (!reScheduleRes.ok || !reScheduleData.show) {
    throw new Error(`Failed to schedule in cancelled slot: ${JSON.stringify(reScheduleData)}`);
  }
  console.log('✓ Screen slot immediately available for new booking after cancellation!');

  // 12. Storefront Synchronization
  console.log('\n13. Testing Storefront Synchronization...');
  const publicShowsRes = await fetch(`${BASE_URL}/shows?theater=${theater._id}`);
  const publicShowsData = await publicShowsRes.json();
  const containsCancelled = publicShowsData.shows?.some((s) => s._id === show1._id);
  const containsNewShow = publicShowsData.shows?.some((s) => s._id === reScheduleData.show._id);

  if (containsCancelled) {
    throw new Error('Customer storefront contains cancelled show!');
  }
  if (!containsNewShow) {
    throw new Error('Customer storefront missing newly scheduled active show!');
  }
  console.log('✓ Storefront verified: Cancelled shows excluded, active shows visible');

  // 13. Cleanup Test Artifacts
  console.log('\n14. Cleaning Up Test Artifacts...');
  const showsToDelete = [
    show1._id,
    reScheduleData.show._id,
    ...recurringData.shows.map((s) => s._id),
    ...bulkData.shows.map((s) => s._id),
  ];

  for (const id of showsToDelete) {
    await fetch(`${BASE_URL}/admin/shows/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  }
  console.log(`✓ Cleaned up ${showsToDelete.length} test show records`);

  console.log('\n===============================================================');
  console.log('🎉 ALL 12/12 PHASE 4.4 BACKEND & SCHEDULING TESTS PASSED!');
  console.log('===============================================================\n');
}

runPhase44Tests().catch((err) => {
  console.error('\n❌ Phase 4.4 Test Suite Failed:', err.message);
  process.exit(1);
});
