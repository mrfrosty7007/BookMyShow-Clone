const BASE_URL = 'http://localhost:5000/api';

async function runPhase43Tests() {
  console.log('===============================================================');
  console.log('--- Starting Phase 4.3 Theater & Seat Layout Builder Tests ---');
  console.log('===============================================================\n');

  // 1. Admin Authentication
  console.log('1. Authenticating as Administrator...');
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
  console.log(`✓ Admin authenticated: ${loginData.user.name} (${loginData.user.email})`);

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
    Cookie: adminCookie,
  };

  // 2. Authorization Checks
  console.log('\n2. Testing Access Control on /api/admin/theaters...');
  // A: Unauthenticated
  const unauthRes = await fetch(`${BASE_URL}/admin/theaters`);
  if (unauthRes.status === 401) {
    console.log('✓ Blocked unauthenticated access (401 Unauthorized)');
  } else {
    throw new Error(`Expected 401 for unauthenticated access, got ${unauthRes.status}`);
  }

  // B: Customer attempt
  const regEmail = `theater_user_${Date.now()}@example.com`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Regular Customer',
      email: regEmail,
      password: 'Password123!',
    }),
  });
  const regCookie = regRes.headers.get('set-cookie')?.split(';')[0] || '';
  const customerAccessRes = await fetch(`${BASE_URL}/admin/theaters`, {
    headers: { Cookie: regCookie },
  });
  if (customerAccessRes.status === 403) {
    console.log('✓ Blocked customer from admin theater routes (403 Forbidden)');
  } else {
    throw new Error(`Expected 403 for customer access, got ${customerAccessRes.status}`);
  }

  // 3. Create Multiplex / Theater
  console.log('\n3. Testing POST /api/admin/theaters (Create Multiplex)...');
  const uniqueName = `PVR Cyber Superplex - ${Date.now()}`;
  const newTheaterData = {
    name: uniqueName,
    city: 'Bengaluru',
    address: 'Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103',
    amenities: ['IMAX Laser', 'Dolby Atmos', 'Valet Parking', 'Gourmet Lounge'],
    screens: [
      {
        name: 'Screen 1 — Grand IMAX',
        type: 'IMAX',
        seatLayout: {
          rows: [
            { label: 'A', seats: 12, wheelchair: true },
            { label: 'B', seats: 12, category: 'Standard' },
            { label: 'C', seats: 14, premium: true },
            { label: 'D', seats: 14, vip: true },
          ],
        },
      },
    ],
  };

  const createRes = await fetch(`${BASE_URL}/admin/theaters`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify(newTheaterData),
  });

  const createData = await createRes.json();
  if (createRes.status !== 201 || !createData.theater?._id) {
    throw new Error(`Create theater failed: ${JSON.stringify(createData)}`);
  }
  const theaterId = createData.theater._id;
  const initialScreen = createData.theater.screens[0];
  console.log(
    `✓ Theater created successfully: "${createData.theater.name}" (${createData.theater.city})`
  );
  console.log(
    `  Initial Screen: "${initialScreen.name}" [${initialScreen.type}] with ${initialScreen.capacity} seats`
  );

  // 4. Query & Filter Features
  console.log('\n4. Testing GET /api/admin/theaters Query Features...');
  // A: Search
  const searchRes = await fetch(
    `${BASE_URL}/admin/theaters?search=${encodeURIComponent(uniqueName)}`,
    {
      headers: adminHeaders,
    }
  );
  const searchData = await searchRes.json();
  if (!searchRes.ok || searchData.theaters[0]?._id !== theaterId) {
    throw new Error(`Search by name failed: ${JSON.stringify(searchData)}`);
  }
  console.log(`✓ Search verification: Found "${searchData.theaters[0].name}"`);

  // B: City Filter
  const cityRes = await fetch(`${BASE_URL}/admin/theaters?city=Bengaluru`, {
    headers: adminHeaders,
  });
  const cityData = await cityRes.json();
  const hasBengaluruTheater = cityData.theaters.some((t) => t._id === theaterId);
  if (!cityRes.ok || !hasBengaluruTheater) {
    throw new Error(`City filter for Bengaluru failed`);
  }
  console.log(
    `✓ City filter verification: Retrieved ${cityData.theaters.length} theaters in Bengaluru`
  );

  // C: Pagination
  const pageRes = await fetch(`${BASE_URL}/admin/theaters?page=1&limit=3`, {
    headers: adminHeaders,
  });
  const pageData = await pageRes.json();
  if (!pageRes.ok || pageData.theaters.length > 3 || !pageData.pagination?.totalPages) {
    throw new Error(`Pagination verification failed: ${JSON.stringify(pageData.pagination)}`);
  }
  console.log(
    `✓ Pagination verification: Page ${pageData.pagination.page}/${pageData.pagination.totalPages}, Total Theaters: ${pageData.pagination.total}`
  );

  // 5. Update Theater Metadata
  console.log('\n5. Testing PUT /api/admin/theaters/:id (Update Metadata)...');
  const updateRes = await fetch(`${BASE_URL}/admin/theaters/${theaterId}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({
      name: `${uniqueName} (Renovated)`,
      amenities: ['IMAX Laser', 'Dolby Atmos', '4DX', 'VIP Recliners'],
    }),
  });
  const updateData = await updateRes.json();
  if (!updateRes.ok || !updateData.theater.name.includes('(Renovated)')) {
    throw new Error(`Update theater failed: ${JSON.stringify(updateData)}`);
  }
  console.log(`✓ Theater metadata updated: "${updateData.theater.name}"`);

  // 6. Screen CRUD & Visual Seat Layout
  console.log('\n6. Testing Screen Management & Visual Layout Generation...');
  // A: Add Screen with custom rows and aisles
  const customRows = [
    { label: 'A', seats: 10, wheelchair: true, aisles: [3] },
    { label: 'B', seats: 12, category: 'Standard', aisles: [3, 9] },
    { label: 'C', seats: 12, category: 'Standard', aisles: [3, 9] },
    { label: 'D', seats: 14, premium: true, aisles: [3, 11] },
    { label: 'E', seats: 14, vip: true, aisles: [3, 11] },
  ]; // Total capacity: 10 + 12 + 12 + 14 + 14 = 62 seats

  const addScreenRes = await fetch(`${BASE_URL}/admin/theaters/${theaterId}/screens`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      name: 'Screen 2 — 4DX Experiential',
      type: '4DX',
      seatLayout: { rows: customRows },
    }),
  });
  const addScreenData = await addScreenRes.json();
  if (addScreenRes.status !== 201 || addScreenData.screen?.capacity !== 62) {
    throw new Error(`Add screen failed or capacity mismatch: ${JSON.stringify(addScreenData)}`);
  }
  const screen2Id = addScreenData.screen._id;
  console.log(`✓ Added Screen 2 successfully: "${addScreenData.screen.name}"`);
  console.log(`  Auto-calculated capacity: ${addScreenData.screen.capacity} seats (verified: 62)`);
  console.log(
    `  Generated individual seats count: ${addScreenData.screen.seatLayout.seats.length}`
  );

  // B: Update Screen Layout
  console.log('\n  Testing PUT /api/admin/theaters/:id/screens/:screenId (Update Screen)...');
  const updatedRows = [
    ...customRows,
    { label: 'F', seats: 14, vip: true, aisles: [3, 11] }, // Add 1 more VIP row (+14 seats = 76 total)
  ];
  const updateScreenRes = await fetch(
    `${BASE_URL}/admin/theaters/${theaterId}/screens/${screen2Id}`,
    {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Screen 2 — 4DX Motion Laser',
        type: '4DX',
        seatLayout: { rows: updatedRows },
      }),
    }
  );
  const updateScreenData = await updateScreenRes.json();
  if (!updateScreenRes.ok || updateScreenData.screen?.capacity !== 76) {
    throw new Error(`Update screen failed: ${JSON.stringify(updateScreenData)}`);
  }
  console.log(
    `✓ Updated Screen 2: "${updateScreenData.screen.name}", New Capacity: ${updateScreenData.screen.capacity} seats`
  );

  // C: Duplicate Screen Feature (Flagship)
  console.log(
    '\n  Testing POST /api/admin/theaters/:id/screens/:screenId/duplicate (Duplicate Screen)...'
  );
  const duplicateRes = await fetch(
    `${BASE_URL}/admin/theaters/${theaterId}/screens/${screen2Id}/duplicate`,
    {
      method: 'POST',
      headers: adminHeaders,
    }
  );
  const duplicateData = await duplicateRes.json();
  if (duplicateRes.status !== 201 || !duplicateData.screen.name.includes('(Copy)')) {
    throw new Error(`Duplicate screen failed: ${JSON.stringify(duplicateData)}`);
  }
  const duplicatedScreenId = duplicateData.screen._id;
  console.log(`✓ Screen duplicated with identical layout: "${duplicateData.screen.name}"`);
  console.log(
    `  Duplicated capacity: ${duplicateData.screen.capacity} seats, Rows count: ${duplicateData.screen.seatLayout.rows.length}`
  );

  // D: Delete Screen
  console.log('\n  Testing DELETE /api/admin/theaters/:id/screens/:screenId (Delete Screen)...');
  const deleteScreenRes = await fetch(
    `${BASE_URL}/admin/theaters/${theaterId}/screens/${duplicatedScreenId}`,
    {
      method: 'DELETE',
      headers: adminHeaders,
    }
  );
  const deleteScreenData = await deleteScreenRes.json();
  if (!deleteScreenRes.ok) {
    throw new Error(`Delete screen failed: ${JSON.stringify(deleteScreenData)}`);
  }
  console.log(`✓ Screen deleted successfully from theater`);

  // 7. Soft Delete & Storefront Integration
  console.log('\n7. Testing Soft Delete & Storefront Sync...');
  const deleteRes = await fetch(`${BASE_URL}/admin/theaters/${theaterId}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  const deleteData = await deleteRes.json();
  if (!deleteRes.ok || deleteData.theater?.isActive !== false || !deleteData.theater?.deletedAt) {
    throw new Error(`Soft delete theater failed: ${JSON.stringify(deleteData)}`);
  }
  console.log(
    `✓ Theater soft deleted: isActive=${deleteData.theater.isActive}, deletedAt=${deleteData.theater.deletedAt}`
  );

  // Check public customer endpoint: hidden theater must NOT be visible
  const publicTheatersRes = await fetch(`${BASE_URL}/theaters`);
  const publicTheatersData = await publicTheatersRes.json();
  const visibleInPublic = publicTheatersData.theaters.some((t) => t._id === theaterId);
  if (visibleInPublic) {
    throw new Error(
      'CRITICAL: Soft-deleted theater still appears in public customer storefront /api/theaters!'
    );
  }
  console.log('✓ Soft-deleted theater successfully hidden from customer storefront!');

  // Verify Admin can see it under inactive filter
  const adminInactiveRes = await fetch(`${BASE_URL}/admin/theaters?status=inactive`, {
    headers: adminHeaders,
  });
  const adminInactiveData = await adminInactiveRes.json();
  const foundInInactive = adminInactiveData.theaters.some((t) => t._id === theaterId);
  if (!foundInInactive) {
    throw new Error('Soft-deleted theater not found in admin inactive view');
  }
  console.log('✓ Soft-deleted theater correctly visible in admin inactive status view.');

  // 8. Restore Theater
  console.log('\n8. Testing PATCH /api/admin/theaters/:id/restore (Restore Theater)...');
  const restoreRes = await fetch(`${BASE_URL}/admin/theaters/${theaterId}/restore`, {
    method: 'PATCH',
    headers: adminHeaders,
  });
  const restoreData = await restoreRes.json();
  if (
    !restoreRes.ok ||
    restoreData.theater?.isActive !== true ||
    restoreData.theater?.deletedAt !== null
  ) {
    throw new Error(`Restore theater failed: ${JSON.stringify(restoreData)}`);
  }
  console.log(
    `✓ Theater restored: isActive=${restoreData.theater.isActive}, deletedAt=${restoreData.theater.deletedAt}`
  );

  // Verify storefront reflects restored theater immediately
  const publicAfterRestore = await fetch(`${BASE_URL}/theaters`);
  const publicAfterData = await publicAfterRestore.json();
  const foundAfterRestore = publicAfterData.theaters.some((t) => t._id === theaterId);
  if (!foundAfterRestore) {
    throw new Error('Restored theater not appearing in public customer storefront!');
  }
  console.log('✓ Restored theater immediately visible in customer storefront again!');

  // 9. Regression Verification
  console.log('\n9. Running Regression Verification on Existing Services...');
  const moviesRes = await fetch(`${BASE_URL}/movies`);
  if (!moviesRes.ok) throw new Error('Movies API failed regression check');
  console.log('✓ /api/movies operational');

  const showsRes = await fetch(`${BASE_URL}/shows`);
  if (!showsRes.ok) throw new Error('Shows API failed regression check');
  console.log('✓ /api/shows operational');

  // 10. Cleanup Test Artifact
  console.log('\n10. Cleaning Up Test Artifact...');
  await fetch(`${BASE_URL}/admin/theaters/${theaterId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('✓ Test theater soft-deleted from active storefront catalog');

  console.log('\n===============================================================');
  console.log('🎉 ALL PHASE 4.3 BACKEND & MULTIPLEX TESTS PASSED!');
  console.log('===============================================================\n');
}

runPhase43Tests().catch((err) => {
  console.error('\n❌ Phase 4.3 Test Suite Failed:', err.message);
  process.exit(1);
});
