import 'dotenv/config';
import http from 'http';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';

const runCityFilterVerification = async () => {
  console.log('=====================================================================');
  console.log('--- Verifying City Filtering Backend API ---');
  console.log('=====================================================================');

  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  try {
    // 1. Test GET /api/theaters/cities
    console.log('\n1. Testing GET /api/theaters/cities...');
    const citiesRes = await fetch(`${baseUrl}/theaters/cities`);
    const citiesData = await citiesRes.json();
    if (
      !citiesData.success ||
      !Array.isArray(citiesData.cities) ||
      citiesData.cities.length === 0
    ) {
      throw new Error(`Failed to fetch cities: ${JSON.stringify(citiesData)}`);
    }
    console.log('   ✅ Available cities:', citiesData.cities.join(', '));

    // 2. Test GET /api/movies without city filter (All Cities)
    console.log('\n2. Testing GET /api/movies (All Cities)...');
    const allMoviesRes = await fetch(`${baseUrl}/movies`);
    const allMoviesData = await allMoviesRes.json();
    if (!allMoviesData.success || !Array.isArray(allMoviesData.movies)) {
      throw new Error(`Failed to fetch all movies: ${JSON.stringify(allMoviesData)}`);
    }
    console.log(`   ✅ All movies count: ${allMoviesData.count}`);

    // 3. Test GET /api/movies?city=Bengaluru
    console.log('\n3. Testing GET /api/movies?city=Bengaluru...');
    const blrRes = await fetch(`${baseUrl}/movies?city=Bengaluru`);
    const blrData = await blrRes.json();
    if (!blrData.success || !Array.isArray(blrData.movies)) {
      throw new Error(`Failed to fetch Bengaluru movies: ${JSON.stringify(blrData)}`);
    }
    console.log(`   ✅ Bengaluru movies count: ${blrData.count}`);

    // 4. Test GET /api/movies?city=Chennai
    console.log('\n4. Testing GET /api/movies?city=Chennai...');
    const maaRes = await fetch(`${baseUrl}/movies?city=Chennai`);
    const maaData = await maaRes.json();
    if (!maaData.success || !Array.isArray(maaData.movies)) {
      throw new Error(`Failed to fetch Chennai movies: ${JSON.stringify(maaData)}`);
    }
    console.log(`   ✅ Chennai movies count: ${maaData.count}`);

    // 5. Test GET /api/movies?city=Hyderabad
    console.log('\n5. Testing GET /api/movies?city=Hyderabad...');
    const hydRes = await fetch(`${baseUrl}/movies?city=Hyderabad`);
    const hydData = await hydRes.json();
    if (!hydData.success || !Array.isArray(hydData.movies)) {
      throw new Error(`Failed to fetch Hyderabad movies: ${JSON.stringify(hydData)}`);
    }
    console.log(`   ✅ Hyderabad movies count: ${hydData.count}`);

    // 6. Test GET /api/movies?city=UnknownCity (Expect 0 movies)
    console.log('\n6. Testing GET /api/movies?city=UnknownCity...');
    const unknownRes = await fetch(`${baseUrl}/movies?city=UnknownCity`);
    const unknownData = await unknownRes.json();
    if (!unknownData.success || unknownData.count !== 0) {
      throw new Error(`Expected 0 movies for unknown city, got: ${JSON.stringify(unknownData)}`);
    }
    console.log(`   ✅ Unknown city correctly returned 0 movies.`);

    console.log('\n=====================================================================');
    console.log('🎉 ALL CITY FILTER VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('=====================================================================');
  } finally {
    server.close();
    await mongoose.connection.close();
  }
};

runCityFilterVerification().catch((err) => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err);
  process.exit(1);
});
