/**
 * Report Generator for BookMyShow Executive BI Suite (Phase 4.6)
 * Generates downloadable multi-dimensional business reports in CSV format.
 */

/**
 * Generates standard executive report filename
 * @param {'csv'|'pdf'} format
 * @returns {string} e.g. BookMyShow_Report_2026-09.csv
 */
export const getReportFilename = (format = 'csv') => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `BookMyShow_Report_${year}-${month}-${day}.${format}`;
};

/**
 * Escapes CSV text fields
 * @param {string|number} text
 * @returns {string}
 */
const escapeCSV = (text) => {
  if (text === null || text === undefined) return '""';
  const str = String(text);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Compiles aggregated analytics data into a clean, multi-section CSV report
 *
 * @param {object} data
 * @param {object} data.kpis
 * @param {Array<object>} data.revenueSeries
 * @param {Array<object>} data.movies
 * @param {object} data.theaters
 * @param {Array<object>} data.heatmap
 * @param {object} data.refunds
 * @returns {string} Formatted CSV text
 */
export const generateCSVReport = ({
  kpis = {},
  revenueSeries = [],
  movies = [],
  theaters = {},
  heatmap = [],
  refunds = {},
}) => {
  const lines = [];

  // Title Banner
  lines.push('================================================================');
  lines.push('BOOKMYSHOW CLONE - EXECUTIVE BUSINESS INTELLIGENCE REPORT');
  lines.push(`Generated On,${new Date().toISOString()}`);
  lines.push('================================================================');
  lines.push('');

  // 1. Executive KPI Summary
  lines.push('--- SECTION 1: EXECUTIVE KPI SUMMARY ---');
  lines.push('Metric,Value');
  lines.push(`Gross Box Office Revenue,₹${kpis.grossRevenue || 0}`);
  lines.push(`Net Box Office Revenue,₹${kpis.netRevenue || 0}`);
  lines.push(`Today's Revenue,₹${kpis.todayRevenue || 0}`);
  lines.push(`Total Tickets Sold,${kpis.totalTicketsSold || 0}`);
  lines.push(`Confirmed Bookings,${kpis.confirmedBookings || 0}`);
  lines.push(`Average Order Value (AOV),₹${kpis.averageOrderValue || 0}`);
  lines.push(`Average Ticket Price (ATP),₹${kpis.averageTicketPrice || 0}`);
  lines.push(`Overall Auditorium Occupancy,${kpis.overallOccupancy || 0}%`);
  lines.push(`Gate Admission Check-in Rate,${kpis.admissionConversionRate || 0}%`);
  lines.push(`Refund Rate,${kpis.refundRatePercent || 0}%`);
  lines.push('');

  // 2. Revenue Time Series Ledger
  lines.push('--- SECTION 2: REVENUE TIME-SERIES LEDGER ---');
  lines.push('Date,Gross Revenue (INR),Net Revenue (INR),Refunds (INR),Tickets Sold,Orders Count');
  if (revenueSeries.length > 0) {
    revenueSeries.forEach((item) => {
      lines.push(
        [
          item.date,
          item.revenue,
          item.netRevenue,
          item.refundedAmount,
          item.ticketsSold,
          item.bookingsCount,
        ]
          .map(escapeCSV)
          .join(',')
      );
    });
  } else {
    lines.push('No time-series data available for the period');
  }
  lines.push('');

  // 3. Top Movies Box Office Performance
  lines.push('--- SECTION 3: BOX OFFICE MOVIE RANKINGS ---');
  lines.push('Movie Title,Genre,Gross Revenue (INR),Tickets Sold,Shows,Average Occupancy %');
  if (movies.length > 0) {
    movies.forEach((m) => {
      lines.push(
        [
          m.title,
          Array.isArray(m.genre) ? m.genre.join(' / ') : m.genre,
          m.revenue,
          m.ticketsSold,
          m.showCount,
          `${m.averageOccupancy}%`,
        ]
          .map(escapeCSV)
          .join(',')
      );
    });
  } else {
    lines.push('No movie performance data recorded');
  }
  lines.push('');

  // 4. Theater & Screen Format Utilization
  lines.push('--- SECTION 4: THEATER & SCREEN UTILIZATION ---');
  lines.push(
    'Multiplex Name,City,Screen Count,Show Count,Capacity,Booked Seats,Occupancy %,Est Revenue (INR)'
  );
  const tList = theaters.theaters || [];
  if (tList.length > 0) {
    tList.forEach((t) => {
      lines.push(
        [
          t.name,
          t.city,
          t.screenCount,
          t.showCount,
          t.totalCapacity,
          t.totalBooked,
          `${t.occupancyPercent}%`,
          t.estimatedRevenue,
        ]
          .map(escapeCSV)
          .join(',')
      );
    });
  } else {
    lines.push('No multiplex data available');
  }
  lines.push('');

  // 5. Screen Format Rankings
  lines.push('--- SECTION 5: SCREEN FORMAT COMPARISON ---');
  lines.push('Screen Format,Show Count,Capacity,Booked Seats,Occupancy %,Est Revenue (INR)');
  const fList = theaters.screenFormats || [];
  if (fList.length > 0) {
    fList.forEach((f) => {
      lines.push(
        [
          f.screenType,
          f.showCount,
          f.totalCapacity,
          f.totalBooked,
          `${f.occupancyPercent}%`,
          f.estimatedRevenue,
        ]
          .map(escapeCSV)
          .join(',')
      );
    });
  }
  lines.push('');

  // 6. Occupancy Heatmap Matrix
  lines.push('--- SECTION 6: OCCUPANCY HEATMAP MATRIX (DAY x TIME SLOT) ---');
  lines.push('Day,Time Slot,Booked Seats,Capacity,Occupancy %,Tier Category');
  if (heatmap.length > 0) {
    heatmap.forEach((cell) => {
      lines.push(
        [
          cell.day,
          cell.slot,
          cell.bookedSeats,
          cell.totalCapacity,
          `${cell.occupancyPercent}%`,
          cell.tier,
        ]
          .map(escapeCSV)
          .join(',')
      );
    });
  }
  lines.push('');

  // 7. Refund & Policy Audit
  lines.push('--- SECTION 7: REFUNDS & CANCELLATIONS ---');
  lines.push('Reason / Policy,Refund Count,Refunded Amount (INR)');
  const rList = refunds.reasons || [];
  if (rList.length > 0) {
    rList.forEach((r) => {
      lines.push([r.reason, r.count, r.amount].map(escapeCSV).join(','));
    });
  }
  lines.push('');

  return lines.join('\n');
};

export default {
  getReportFilename,
  generateCSVReport,
};
