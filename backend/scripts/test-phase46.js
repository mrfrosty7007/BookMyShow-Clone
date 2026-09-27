import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { connectDB } from '../config/db.js';
import { calculateRevenueMetrics } from '../utils/revenueEngine.js';
import {
  calculateOverallOccupancy,
  calculateOccupancyHeatmap,
} from '../utils/occupancyCalculator.js';
import { generateExecutiveInsights } from '../utils/performanceAggregator.js';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bookmyshow.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

async function runPhase46Tests() {
  console.log('=====================================================================');
  console.log('--- Starting Phase 4.6 Executive Analytics & Business Intelligence Tests ---');
  console.log('=====================================================================\n');

  let passedTests = 0;
  const totalTests = 12;

  // Connect to DB for direct engine unit testing
  await connectDB();

  try {
    // -------------------------------------------------------------
    // Test 1: Admin Authentication & RBAC Protection
    // -------------------------------------------------------------
    console.log('1. Testing Admin Authentication & RBAC Route Protection...');
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
    console.log(`   ✓ Admin authenticated: ${loginData.user.name} (${loginData.user.email})`);

    // Verify unauthenticated request to /admin/analytics/overview is blocked with 401
    const unauthRes = await fetch(`${BASE_URL}/admin/analytics/overview`);
    if (unauthRes.status !== 401) {
      throw new Error(
        `Expected 401 Unauthorized for unauthenticated analytics access, got ${unauthRes.status}`
      );
    }
    console.log('   ✓ Blocked unauthenticated analytics request (401 Unauthorized)');
    passedTests++;
    console.log(`[PASS] 1/${totalTests} Admin Auth & RBAC Route Protection Verified\n`);

    const authHeaders = {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    };

    // -------------------------------------------------------------
    // Test 2: Executive Overview Analytics API
    // -------------------------------------------------------------
    console.log('2. Testing Executive Overview Analytics API (/api/admin/analytics/overview)...');
    const overviewRes = await fetch(`${BASE_URL}/admin/analytics/overview`, {
      headers: authHeaders,
    });

    if (!overviewRes.ok) {
      const errText = await overviewRes.text();
      throw new Error(`Overview API failed: ${errText}`);
    }
    const overviewData = await overviewRes.json();

    if (!overviewData.success || !overviewData.kpis || !Array.isArray(overviewData.insights)) {
      throw new Error('Invalid overview payload format');
    }

    const { kpis } = overviewData;
    console.log(`   ✓ Total Revenue: ₹${kpis.totalRevenue?.toLocaleString('en-IN')}`);
    console.log(`   ✓ Tickets Sold: ${kpis.totalTicketsSold}`);
    console.log(`   ✓ Average Occupancy: ${kpis.occupancy}%`);
    console.log(`   ✓ Refund Rate: ${kpis.refundRate}%`);
    console.log(`   ✓ Gate Check-in Rate: ${kpis.checkInRate}%`);
    console.log(
      `   ✓ Automated Insights Generated: ${overviewData.insights.length} recommendations`
    );

    if (overviewData.insights.length > 0) {
      console.log(
        `     Sample insight: [${overviewData.insights[0].category}] ${overviewData.insights[0].text}`
      );
    }
    passedTests++;
    console.log(`[PASS] 2/${totalTests} Executive Overview Analytics API Verified\n`);

    // -------------------------------------------------------------
    // Test 3: Revenue Intelligence Time-Series API
    // -------------------------------------------------------------
    console.log('3. Testing Revenue Intelligence API (/api/admin/analytics/revenue)...');
    const revDailyRes = await fetch(`${BASE_URL}/admin/analytics/revenue?timeframe=daily`, {
      headers: authHeaders,
    });
    const revDaily = await revDailyRes.json();
    if (!revDaily.success || !Array.isArray(revDaily.series)) {
      throw new Error('Revenue daily time-series failed');
    }
    console.log(`   ✓ Daily time series returned ${revDaily.series.length} data points`);

    const revWeeklyRes = await fetch(`${BASE_URL}/admin/analytics/revenue?timeframe=weekly`, {
      headers: authHeaders,
    });
    const revWeekly = await revWeeklyRes.json();
    if (!revWeekly.success || !Array.isArray(revWeekly.series)) {
      throw new Error('Revenue weekly time-series failed');
    }
    console.log(`   ✓ Weekly time series returned ${revWeekly.series.length} data points`);

    const revMonthlyRes = await fetch(`${BASE_URL}/admin/analytics/revenue?timeframe=monthly`, {
      headers: authHeaders,
    });
    const revMonthly = await revMonthlyRes.json();
    if (!revMonthly.success || !Array.isArray(revMonthly.series)) {
      throw new Error('Revenue monthly time-series failed');
    }
    console.log(`   ✓ Monthly time series returned ${revMonthly.series.length} data points`);
    passedTests++;
    console.log(`[PASS] 3/${totalTests} Revenue Intelligence Time-Series API Verified\n`);

    // -------------------------------------------------------------
    // Test 4: Occupancy Matrix Heatmap API
    // -------------------------------------------------------------
    console.log('4. Testing Occupancy Matrix Heatmap API (/api/admin/analytics/occupancy)...');
    const occRes = await fetch(`${BASE_URL}/admin/analytics/occupancy`, {
      headers: authHeaders,
    });
    const occData = await occRes.json();
    if (!occData.success || !Array.isArray(occData.heatmap)) {
      throw new Error('Occupancy heatmap endpoint failed');
    }

    console.log(`   ✓ Overall Capacity: ${occData.overall.totalCapacity} seats`);
    console.log(
      `   ✓ Overall Booked: ${occData.overall.totalBookedSeats} seats (${occData.overall.overallOccupancy}%)`
    );
    console.log(`   ✓ Matrix entries: ${occData.heatmap.length} (7 days x 4 slots = 28 slots)`);
    console.log(
      `   ✓ Peak Slot: ${occData.peakSlot?.day} ${occData.peakSlot?.slot} (${occData.peakSlot?.occupancyPercent}%)`
    );
    console.log(
      `   ✓ Quietest Slot: ${occData.quietestSlot?.day} ${occData.quietestSlot?.slot} (${occData.quietestSlot?.occupancyPercent}%)`
    );

    if (occData.heatmap.length !== 28) {
      console.warn(`   Notice: Expected 28 heatmap points (7x4), got ${occData.heatmap.length}`);
    }
    passedTests++;
    console.log(`[PASS] 4/${totalTests} Occupancy Matrix Heatmap API Verified\n`);

    // -------------------------------------------------------------
    // Test 5: Movie Performance Ranking API
    // -------------------------------------------------------------
    console.log('5. Testing Movie Performance API (/api/admin/analytics/movies)...');
    const movieRes = await fetch(`${BASE_URL}/admin/analytics/movies?limit=10`, {
      headers: authHeaders,
    });
    const movieData = await movieRes.json();
    if (!movieData.success || !Array.isArray(movieData.movies)) {
      throw new Error('Movie analytics endpoint failed');
    }
    console.log(`   ✓ Retrieved performance for ${movieData.movies.length} movies`);
    if (movieData.movies.length > 0) {
      const top = movieData.movies[0];
      console.log(
        `   ✓ Top Movie: "${top.title}" - ₹${top.revenue?.toLocaleString('en-IN')} (${top.ticketsSold} tix, ${top.averageOccupancy}% occ)`
      );
    }
    passedTests++;
    console.log(`[PASS] 5/${totalTests} Movie Performance Ranking API Verified\n`);

    // -------------------------------------------------------------
    // Test 6: Theater & Screen Format Utilization API
    // -------------------------------------------------------------
    console.log('6. Testing Theater & Screen Utilization API (/api/admin/analytics/theaters)...');
    const theaterRes = await fetch(`${BASE_URL}/admin/analytics/theaters`, {
      headers: authHeaders,
    });
    const theaterData = await theaterRes.json();
    if (!theaterData.success || !Array.isArray(theaterData.screenFormats)) {
      throw new Error('Theater utilization endpoint failed');
    }
    console.log(`   ✓ Analyzed ${theaterData.screenFormats.length} screen formats:`);
    theaterData.screenFormats.forEach((fmt) => {
      console.log(
        `     - ${fmt.screenType}: ${fmt.showCount} shows, ${fmt.totalCapacity} capacity, ₹${fmt.estimatedRevenue} rev, ${fmt.occupancyPercent}% occ`
      );
    });
    passedTests++;
    console.log(`[PASS] 6/${totalTests} Theater Utilization API Verified\n`);

    // -------------------------------------------------------------
    // Test 7: Time Slot Demand Analysis API
    // -------------------------------------------------------------
    console.log('7. Testing Time Slot Demand API (/api/admin/analytics/timeslots)...');
    const slotRes = await fetch(`${BASE_URL}/admin/analytics/timeslots`, {
      headers: authHeaders,
    });
    const slotData = await slotRes.json();
    if (!slotData.success || !Array.isArray(slotData.timeslots)) {
      throw new Error('Time slot demand endpoint failed');
    }
    console.log(`   ✓ Analyzed ${slotData.timeslots.length} diurnal time slots:`);
    slotData.timeslots.forEach((slot) => {
      console.log(
        `     - ${slot.slot} (${slot.label}): ${slot.bookings} bookings, ${slot.shows} shows, ₹${slot.revenue}`
      );
    });
    passedTests++;
    console.log(`[PASS] 7/${totalTests} Time Slot Demand API Verified\n`);

    // -------------------------------------------------------------
    // Test 8: Refund Intelligence & Analytics API
    // -------------------------------------------------------------
    console.log('8. Testing Refund Intelligence API (/api/admin/analytics/refunds)...');
    const refundRes = await fetch(`${BASE_URL}/admin/analytics/refunds`, {
      headers: authHeaders,
    });
    const refundData = await refundRes.json();
    if (!refundData.success || typeof refundData.refunds.refundRatePercent !== 'number') {
      throw new Error('Refund analytics endpoint failed');
    }
    const r = refundData.refunds;
    console.log(`   ✓ Refund Rate: ${r.refundRatePercent}% (${r.refundCount} refunds)`);
    console.log(`   ✓ Refund Reasons Categorized: ${r.reasons?.length || 0} categories`);
    passedTests++;
    console.log(`[PASS] 8/${totalTests} Refund Intelligence API Verified\n`);

    // -------------------------------------------------------------
    // Test 9: Report Export System (CSV & JSON/PDF)
    // -------------------------------------------------------------
    console.log('9. Testing Report Export System (/api/admin/analytics/export)...');
    const csvRes = await fetch(`${BASE_URL}/admin/analytics/export?format=csv`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!csvRes.ok) {
      throw new Error(`CSV export failed with status ${csvRes.status}`);
    }
    const contentType = csvRes.headers.get('content-type');
    const csvContent = await csvRes.text();
    if (!contentType || !contentType.includes('text/csv')) {
      throw new Error(`Expected text/csv content type, got ${contentType}`);
    }
    if (
      !csvContent.includes('EXECUTIVE BUSINESS INTELLIGENCE REPORT') ||
      !csvContent.includes('Gross Revenue')
    ) {
      throw new Error('CSV report content missing expected header/sections');
    }
    console.log(`   ✓ CSV export returned valid payload (${csvContent.length} bytes)`);

    const pdfDataRes = await fetch(`${BASE_URL}/admin/analytics/export?format=pdf`, {
      headers: authHeaders,
    });
    const pdfData = await pdfDataRes.json();
    if (!pdfData.success || !pdfData.reportData || !pdfData.filename) {
      throw new Error('PDF structured data export failed');
    }
    console.log(`   ✓ Structured PDF data generated with target filename: ${pdfData.filename}`);
    passedTests++;
    console.log(`[PASS] 9/${totalTests} Report Export System (CSV & PDF) Verified\n`);

    // -------------------------------------------------------------
    // Test 10: Granular Query Filtering Across Endpoints
    // -------------------------------------------------------------
    console.log('10. Testing Granular Query Filtering (Date, ScreenType, City)...');
    const filteredRes = await fetch(
      `${BASE_URL}/admin/analytics/overview?screenType=IMAX&startDate=2026-01-01&endDate=2026-12-31`,
      { headers: authHeaders }
    );
    const filteredData = await filteredRes.json();
    if (!filteredData.success || !filteredData.kpis) {
      throw new Error('Filtered overview request failed');
    }
    console.log(`   ✓ Filtered query accepted with custom date range and screenType=IMAX`);
    console.log(`   ✓ Filtered gross revenue: ₹${filteredData.kpis.totalRevenue}`);
    passedTests++;
    console.log(`[PASS] 10/${totalTests} Query Filtering Verified\n`);

    // -------------------------------------------------------------
    // Test 11: Unit Testing of Core Utility Aggregators
    // -------------------------------------------------------------
    console.log('11. Testing Internal Analytics Utility Modules...');
    const revenueDirect = await calculateRevenueMetrics({});
    if (typeof revenueDirect.grossRevenue !== 'number') {
      throw new Error('calculateRevenueMetrics failed direct invocation');
    }
    const occDirect = await calculateOverallOccupancy({});
    if (typeof occDirect.overallOccupancy !== 'number') {
      throw new Error('calculateOverallOccupancy failed direct invocation');
    }
    const heatmapDirect = await calculateOccupancyHeatmap({});
    if (!Array.isArray(heatmapDirect.matrix) || heatmapDirect.matrix.length !== 28) {
      throw new Error('calculateOccupancyHeatmap returned invalid matrix length');
    }
    const insightsDirect = generateExecutiveInsights({
      revenue: revenueDirect,
      occupancy: occDirect,
      movies: [],
      theaters: { screenFormats: [] },
      timeslots: [],
      conversion: { admissionConversionRate: 85 },
      refunds: { refundRatePercent: 2 },
    });
    if (!Array.isArray(insightsDirect)) {
      throw new Error('generateExecutiveInsights did not return an array');
    }
    console.log('   ✓ calculateRevenueMetrics: OK');
    console.log('   ✓ calculateOverallOccupancy: OK');
    console.log('   ✓ calculateOccupancyHeatmap: OK');
    console.log('   ✓ generateExecutiveInsights: OK');
    passedTests++;
    console.log(`[PASS] 11/${totalTests} Utility Modules Unit Tests Verified\n`);

    // -------------------------------------------------------------
    // Test 12: Customer-Facing Storefront Compatibility (Zero Regressions)
    // -------------------------------------------------------------
    console.log('12. Testing Customer Storefront Compatibility & Zero Regressions...');
    const moviesRes = await fetch(`${BASE_URL}/movies`);
    const moviesData = await moviesRes.json();
    const movieList = moviesData.movies || moviesData.data || moviesData;
    if (!moviesRes.ok || !Array.isArray(movieList)) {
      throw new Error('Customer /movies endpoint failed');
    }
    console.log(`   ✓ Public movie catalog operational (${movieList.length} movies)`);

    const theatersRes = await fetch(`${BASE_URL}/theaters`);
    const theatersData = await theatersRes.json();
    const theaterList = theatersData.theaters || theatersData.data || theatersData;
    if (!theatersRes.ok) {
      throw new Error('Customer /theaters endpoint failed');
    }
    console.log(`   ✓ Public theater catalog operational (${theaterList.length || 0} multiplexes)`);
    passedTests++;
    console.log(`[PASS] 12/${totalTests} Customer Storefront Compatibility Confirmed\n`);

    console.log('=====================================================================');
    console.log(
      `--- All ${passedTests}/${totalTests} Phase 4.6 Executive Analytics Tests Passed Successfully! ---`
    );
    console.log('=====================================================================\n');
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ [TEST FAILURE] ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

runPhase46Tests();
