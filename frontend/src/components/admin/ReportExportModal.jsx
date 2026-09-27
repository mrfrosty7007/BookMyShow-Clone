import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  X,
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';
import { exportAnalyticsReport } from '../../services/api.js';

export const ReportExportModal = ({ isOpen, onClose, filters = {} }) => {
  const [format, setFormat] = useState('csv');
  const [downloading, setDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError(null);
      setStatusMessage(`Generating executive ${format.toUpperCase()} report...`);

      if (format === 'csv') {
        const response = await exportAnalyticsReport({
          ...filters,
          format: 'csv',
        });

        // Response is blob from axios with responseType: 'blob'
        const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const nowStr = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `BookMyShow_Report_${nowStr}.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

        setStatusMessage('CSV report downloaded successfully!');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        // PDF Export - Fetch structured report data and render printable executive executive brief
        const response = await exportAnalyticsReport({
          ...filters,
          format: 'pdf',
        });

        const reportData = response.reportData || response;
        const filename = response.filename || `BookMyShow_Report_${new Date().toISOString().split('T')[0]}.pdf`;

        // Create an executive printable report window with cyber executive styling
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          throw new Error('Popup blocked! Please allow popups to generate PDF.');
        }

        const kpis = reportData.kpis || {};
        const movies = reportData.movies || [];
        const theaters = reportData.theaters?.screenFormats || [];
        const refunds = reportData.refunds || {};

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${filename}</title>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; color: #111827; background: #fff; }
                .header { border-bottom: 3px solid #06b6d4; padding-bottom: 15px; margin-bottom: 25px; }
                .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
                .subtitle { font-size: 13px; color: #64748b; margin-top: 5px; }
                .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #e0f2fe; color: #0369a1; }
                .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
                .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #f8fafc; }
                .card-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
                .card-val { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 4px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
                th { background: #0f172a; color: #fff; text-align: left; padding: 8px; font-size: 11px; text-transform: uppercase; }
                td { border-bottom: 1px solid #e2e8f0; padding: 8px; }
                .section-title { font-size: 15px; font-weight: 700; margin-bottom: 10px; color: #1e293b; border-left: 4px solid #06b6d4; padding-left: 8px; }
                .footer { border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8; text-align: center; margin-top: 40px; }
                @media print {
                  body { margin: 15px; }
                  button { display: none !important; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <span class="badge">BookMyShow Executive Intelligence</span>
                <h1 class="title">Executive Business Intelligence Report</h1>
                <div class="subtitle">Generated on ${new Date().toLocaleString('en-IN')} • Period Range: ${filters.startDate || 'All-Time'} to ${filters.endDate || 'Present'}</div>
              </div>

              <div class="section-title">Key Performance Indicators</div>
              <div class="grid">
                <div class="card">
                  <div class="card-title">Gross Revenue</div>
                  <div class="card-val">₹${(kpis.grossRevenue || kpis.totalRevenue || 0).toLocaleString('en-IN')}</div>
                </div>
                <div class="card">
                  <div class="card-title">Tickets Sold</div>
                  <div class="card-val">${(kpis.totalTicketsSold || 0).toLocaleString('en-IN')}</div>
                </div>
                <div class="card">
                  <div class="card-title">Average Occupancy</div>
                  <div class="card-val">${kpis.overallOccupancy || kpis.occupancy || 0}%</div>
                </div>
                <div class="card">
                  <div class="card-title">Refund Rate</div>
                  <div class="card-val">${kpis.refundRatePercent || kpis.refundRate || 0}%</div>
                </div>
              </div>

              <div class="section-title">Top Grossing Movies</div>
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Movie Title</th>
                    <th>Gross Revenue</th>
                    <th>Tickets Sold</th>
                    <th>Avg Occupancy</th>
                    <th>Shows</th>
                  </tr>
                </thead>
                <tbody>
                  ${movies.slice(0, 8).map((m, i) => `
                    <tr>
                      <td>#${i + 1}</td>
                      <td><strong>${m.title}</strong></td>
                      <td>₹${(m.revenue || 0).toLocaleString('en-IN')}</td>
                      <td>${m.ticketsSold || 0}</td>
                      <td>${m.averageOccupancy || 0}%</td>
                      <td>${m.showCount || 0}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="section-title">Screen Format Utilization</div>
              <table>
                <thead>
                  <tr>
                    <th>Format</th>
                    <th>Shows</th>
                    <th>Total Capacity</th>
                    <th>Seats Booked</th>
                    <th>Occupancy %</th>
                    <th>Estimated Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  ${theaters.map((t) => `
                    <tr>
                      <td><strong>${t.screenType}</strong></td>
                      <td>${t.showCount || 0}</td>
                      <td>${t.totalCapacity || 0}</td>
                      <td>${t.totalBooked || 0}</td>
                      <td>${t.occupancyPercent || 0}%</td>
                      <td>₹${(t.estimatedRevenue || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="section-title">Operational Integrity &amp; Refunds</div>
              <div class="grid" style="grid-template-columns: repeat(2, 1fr);">
                <div class="card">
                  <div class="card-title">Total Refunds Processed</div>
                  <div class="card-val">${refunds.refundCount || 0}</div>
                </div>
                <div class="card">
                  <div class="card-title">Admission Check-In Rate</div>
                  <div class="card-val">${reportData.conversion?.admissionConversionRate || 0}%</div>
                </div>
              </div>

              <div class="footer">
                BookMyShow MERN Executive Analytics System • Phase 4.6 • Confidential Executive Report
              </div>

              <div style="text-align: center; margin-top: 20px;">
                <button onclick="window.print()" style="padding: 10px 24px; background: #06b6d4; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                  Save / Print as PDF
                </button>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();

        setStatusMessage('PDF Executive Brief opened for printing/saving!');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to export report');
      setStatusMessage(null);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0d1527] border border-cyan-500/30 p-6 shadow-2xl shadow-cyan-950/40">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Export Executive BI Report
              </h2>
              <p className="text-xs text-gray-400">
                Generate high-fidelity business intelligence documentation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="my-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Select Export Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                format === 'csv'
                  ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                  : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <FileSpreadsheet
                  className={`w-5 h-5 ${format === 'csv' ? 'text-cyan-400' : 'text-gray-500'}`}
                />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">
                  Spreadsheet
                </span>
              </div>
              <div className="mt-2">
                <div className="text-sm font-bold text-white">CSV Format</div>
                <div className="text-[11px] text-gray-400">Raw aggregated datasets</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormat('pdf')}
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                format === 'pdf'
                  ? 'bg-purple-500/15 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                  : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <FileText
                  className={`w-5 h-5 ${format === 'pdf' ? 'text-purple-400' : 'text-gray-500'}`}
                />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">
                  Document
                </span>
              </div>
              <div className="mt-2">
                <div className="text-sm font-bold text-white">PDF Executive Brief</div>
                <div className="text-[11px] text-gray-400">Formatted tables &amp; KPIs</div>
              </div>
            </button>
          </div>
        </div>

        {/* Scope details */}
        <div className="rounded-xl bg-gray-950/60 border border-gray-800/80 p-3.5 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-gray-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Date Scope:
            </span>
            <span className="text-white font-semibold">
              {filters.startDate || 'Historic'} → {filters.endDate || 'Live'}
            </span>
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span>Target Output:</span>
            <span className="text-cyan-300">
              BookMyShow_Report_{new Date().toISOString().split('T')[0]}.{format}
            </span>
          </div>
        </div>

        {/* Status / Error */}
        {statusMessage && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={downloading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {format.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

ReportExportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  filters: PropTypes.object,
};

export default ReportExportModal;
