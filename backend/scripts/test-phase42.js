const BASE_URL = 'http://localhost:5000/api';

async function runPhase42Tests() {
  console.log('===============================================================');
  console.log('--- Starting Phase 4.2 Movie Management CMS Test Suite ---');
  console.log('===============================================================\n');

  // 1. Admin Login
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
  console.log(
    `✓ Admin authenticated successfully: ${loginData.user.name} (${loginData.user.email})`
  );

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
    Cookie: adminCookie,
  };

  // 2. Security & Unauthorized Access Checks
  console.log('\n2. Testing Access Control on /api/admin/movies...');
  // A: No token
  const noTokenRes = await fetch(`${BASE_URL}/admin/movies`);
  if (noTokenRes.status === 401) {
    console.log('✓ Blocked unauthenticated access (401 Unauthorized)');
  } else {
    throw new Error(`Expected 401 for unauthenticated access, got ${noTokenRes.status}`);
  }

  // B: Regular user token
  const regEmail = `testuser_${Date.now()}@example.com`;
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

  const regAccessRes = await fetch(`${BASE_URL}/admin/movies`, {
    headers: {
      Cookie: regCookie,
    },
  });
  if (regAccessRes.status === 403) {
    console.log('✓ Blocked regular customer from admin endpoint (403 Forbidden)');
  } else {
    throw new Error(`Expected 403 for customer access, got ${regAccessRes.status}`);
  }

  // 3. Create Movie via Admin API
  console.log('\n3. Testing POST /api/admin/movies (Create Movie)...');
  const uniqueTitle = `Cyber Odyssey 2099 - ${Date.now()}`;
  const newMoviePayload = {
    title: uniqueTitle,
    description: 'An epic cyberpunk exploration through the depths of neon-drenched megacities.',
    genre: ['Sci-Fi', 'Action', 'Thriller'],
    language: ['English', 'Japanese'],
    duration: 154,
    releaseDate: '2026-12-25',
    rating: 9.1,
    certificate: 'U/A',
    poster:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    trailer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    featured: true,
  };

  const createRes = await fetch(`${BASE_URL}/admin/movies`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify(newMoviePayload),
  });

  const createData = await createRes.json();
  if (createRes.status !== 201 || !createData.success || !createData.movie?._id) {
    throw new Error(`Create movie failed: ${JSON.stringify(createData)}`);
  }
  const createdMovieId = createData.movie._id;
  console.log(`✓ Movie created successfully with ID: ${createdMovieId}`);
  console.log(
    `  Title: "${createData.movie.title}", Duration: ${createData.movie.duration}m, Rating: ${createData.movie.rating}`
  );
  console.log(
    `  Certificate: ${createData.movie.certificate}, Featured: ${createData.movie.featured}, Active: ${createData.movie.isActive}`
  );

  // 3B. Create Movie with Multipart/form-data image upload (Multer)
  console.log('\n3B. Testing POST /api/admin/movies with multipart image upload (Multer)...');
  const formData = new FormData();
  formData.append('title', `Neon Blade - ${Date.now()}`);
  formData.append('description', 'A rogue synthetic runner journeys across cybernetic wasteland.');
  formData.append('genre', 'Action,Sci-Fi');
  formData.append('language', 'English');
  formData.append('duration', '135');
  formData.append('releaseDate', '2026-11-15');
  formData.append('rating', '8.9');
  formData.append('certificate', 'A');
  formData.append('featured', 'true');

  // Valid 1x1 PNG bytes
  const fakePngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  const posterBlob = new Blob([fakePngBuffer], { type: 'image/png' });
  const backdropBlob = new Blob([fakePngBuffer], { type: 'image/png' });
  formData.append('poster', posterBlob, 'poster.png');
  formData.append('backdrop', backdropBlob, 'backdrop.png');

  const uploadRes = await fetch(`${BASE_URL}/admin/movies`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      Cookie: adminCookie,
    },
    body: formData,
  });
  const uploadData = await uploadRes.json();
  if (uploadRes.status !== 201 || !uploadData.movie?.poster?.startsWith('/uploads/movies/')) {
    throw new Error(`Multipart image upload failed: ${JSON.stringify(uploadData)}`);
  }
  console.log(`✓ Multer upload successful! Poster URL: ${uploadData.movie.poster}`);
  console.log(`  Backdrop URL: ${uploadData.movie.backdrop}`);

  // Verify static asset serving
  const staticFileRes = await fetch(`http://localhost:5000${uploadData.movie.poster}`);
  if (!staticFileRes.ok) {
    throw new Error(`Static file serving failed for: ${uploadData.movie.poster}`);
  }
  console.log(`✓ Uploaded static asset served successfully (Status: ${staticFileRes.status})`);

  // 4. Test Query Features (Search, Genre, Status, Pagination)
  console.log('\n4. Testing GET /api/admin/movies Query Features...');

  // A: Search
  const searchRes = await fetch(
    `${BASE_URL}/admin/movies?search=${encodeURIComponent(uniqueTitle)}`,
    {
      headers: adminHeaders,
    }
  );
  const searchData = await searchRes.json();
  if (
    !searchRes.ok ||
    searchData.movies.length === 0 ||
    searchData.movies[0]._id !== createdMovieId
  ) {
    throw new Error(`Search by title failed: ${JSON.stringify(searchData)}`);
  }
  console.log(`✓ Search verification: Found "${searchData.movies[0].title}" matching query`);

  // B: Genre Filter
  const genreRes = await fetch(`${BASE_URL}/admin/movies?genre=Sci-Fi`, {
    headers: adminHeaders,
  });
  const genreData = await genreRes.json();
  const hasSciFi = genreData.movies.some((m) => m._id === createdMovieId);
  if (!genreRes.ok || !hasSciFi) {
    throw new Error(`Genre filtering for Sci-Fi failed to include newly created movie`);
  }
  console.log(
    `✓ Genre filter verification: Correctly returned ${genreData.movies.length} Sci-Fi movies`
  );

  // C: Pagination
  const pageRes = await fetch(`${BASE_URL}/admin/movies?page=1&limit=3`, {
    headers: adminHeaders,
  });
  const pageData = await pageRes.json();
  if (!pageRes.ok || pageData.movies.length > 3 || !pageData.pagination?.totalPages) {
    throw new Error(`Pagination verification failed: ${JSON.stringify(pageData.pagination)}`);
  }
  console.log(
    `✓ Pagination verification: Page ${pageData.pagination.page}/${pageData.pagination.totalPages}, Total Movies: ${pageData.pagination.total}`
  );

  // 5. Update Movie
  console.log('\n5. Testing PUT /api/admin/movies/:id (Update Movie)...');
  const updatePayload = {
    title: `${uniqueTitle} (Director's Cut)`,
    rating: 9.4,
    duration: 168,
    featured: false,
  };

  const updateRes = await fetch(`${BASE_URL}/admin/movies/${createdMovieId}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify(updatePayload),
  });
  const updateData = await updateRes.json();
  if (!updateRes.ok || updateData.movie?.rating !== 9.4 || updateData.movie?.duration !== 168) {
    throw new Error(`Update movie failed: ${JSON.stringify(updateData)}`);
  }
  console.log(`✓ Movie updated successfully: "${updateData.movie.title}"`);
  console.log(
    `  New Rating: ${updateData.movie.rating}, New Duration: ${updateData.movie.duration}m`
  );

  // 6. Toggle Featured Status
  console.log('\n6. Testing PATCH /api/admin/movies/:id/featured (Toggle Featured)...');
  const toggleRes1 = await fetch(`${BASE_URL}/admin/movies/${createdMovieId}/featured`, {
    method: 'PATCH',
    headers: adminHeaders,
  });
  const toggleData1 = await toggleRes1.json();
  if (!toggleRes1.ok || toggleData1.movie?.featured !== true) {
    throw new Error(`Featured toggle (to true) failed: ${JSON.stringify(toggleData1)}`);
  }
  console.log('✓ Featured toggled to: true');

  const toggleRes2 = await fetch(`${BASE_URL}/admin/movies/${createdMovieId}/featured`, {
    method: 'PATCH',
    headers: adminHeaders,
  });
  const toggleData2 = await toggleRes2.json();
  if (!toggleRes2.ok || toggleData2.movie?.featured !== false) {
    throw new Error(`Featured toggle (to false) failed: ${JSON.stringify(toggleData2)}`);
  }
  console.log('✓ Featured toggled to: false');

  // 7. Test Soft Delete & Storefront Integration
  console.log('\n7. Testing DELETE /api/admin/movies/:id (Soft Delete)...');
  const deleteRes = await fetch(`${BASE_URL}/admin/movies/${createdMovieId}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  const deleteData = await deleteRes.json();
  if (!deleteRes.ok || deleteData.movie?.isActive !== false || !deleteData.movie?.deletedAt) {
    throw new Error(`Soft delete failed: ${JSON.stringify(deleteData)}`);
  }
  console.log(
    `✓ Movie soft deleted: isActive=${deleteData.movie.isActive}, deletedAt=${deleteData.movie.deletedAt}`
  );

  // Customer Storefront Verification (Should NOT see soft deleted movie)
  console.log('  Checking Customer Public Storefront (/api/movies)...');
  const publicStoreRes = await fetch(`${BASE_URL}/movies`);
  const publicStoreData = await publicStoreRes.json();
  const foundInPublic = (publicStoreData.movies || []).some((m) => m._id === createdMovieId);
  if (foundInPublic) {
    throw new Error(
      `CRITICAL: Soft deleted movie still visible in public customer storefront /api/movies!`
    );
  }
  console.log('✓ Soft deleted movie is successfully hidden from customer storefront!');

  // Verify Admin can still see it under inactive status filter
  const inactiveRes = await fetch(`${BASE_URL}/admin/movies?status=inactive`, {
    headers: adminHeaders,
  });
  const inactiveData = await inactiveRes.json();
  const foundInInactive = inactiveData.movies.some((m) => m._id === createdMovieId);
  if (!foundInInactive) {
    throw new Error(`Soft deleted movie missing from admin inactive filter!`);
  }
  console.log('✓ Soft deleted movie correctly visible to Admin in inactive status view.');

  // 8. Test Restore Movie
  console.log('\n8. Testing PATCH /api/admin/movies/:id/restore (Restore Movie)...');
  const restoreRes = await fetch(`${BASE_URL}/admin/movies/${createdMovieId}/restore`, {
    method: 'PATCH',
    headers: adminHeaders,
  });
  const restoreData = await restoreRes.json();
  if (
    !restoreRes.ok ||
    restoreData.movie?.isActive !== true ||
    restoreData.movie?.deletedAt !== null
  ) {
    throw new Error(`Restore movie failed: ${JSON.stringify(restoreData)}`);
  }
  console.log(
    `✓ Movie restored: isActive=${restoreData.movie.isActive}, deletedAt=${restoreData.movie.deletedAt}`
  );

  // Customer Storefront Verification (Should now see restored movie)
  const publicStoreAfterRestore = await fetch(`${BASE_URL}/movies`);
  const publicStoreDataAfter = await publicStoreAfterRestore.json();
  const foundAfterRestore = (publicStoreDataAfter.movies || []).some(
    (m) => m._id === createdMovieId
  );
  if (!foundAfterRestore) {
    throw new Error(`Restored movie not appearing in customer storefront!`);
  }
  console.log('✓ Restored movie is immediately visible in customer storefront again!');

  // 9. Regression Testing: Ensure Customer Booking Pipeline Routes Still Function
  console.log('\n9. Running Regression Verification on Existing Services...');
  const theatersRes = await fetch(`${BASE_URL}/theaters`);
  if (!theatersRes.ok) throw new Error('Theaters API failed regression check');
  console.log('✓ /api/theaters operational');

  const showsRes = await fetch(`${BASE_URL}/shows`);
  if (!showsRes.ok) throw new Error('Shows API failed regression check');
  console.log('✓ /api/shows operational');

  console.log('\n===============================================================');
  console.log('🎉 ALL PHASE 4.2 BACKEND & STOREFRONT INTEGRATION TESTS PASSED!');
  console.log('===============================================================\n');
}

runPhase42Tests().catch((err) => {
  console.error('\n❌ Phase 4.2 Test Suite Failed:', err.message);
  process.exit(1);
});
