import PropTypes from 'prop-types';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Ticket,
  Users,
  Clock,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

/**
 * Format Indian currency numbers (e.g. ₹12.4L, ₹83.5K, ₹1.2Cr)
 */
const formatIndianCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  const num = Math.abs(Number(amount));
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)}Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)}L`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}k`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
};

/**
 * Executive KPI Ribbon Component
 * Displays 6 core business indicators with animated cards and delta metrics
 */
export const KPIGrid = ({ kpis = {}, loading = false }) => {
  const {
    totalRevenue = 0,
    todayRevenue = 0,
    totalTicketsSold = 0,
    occupancy = 0,
    totalBookedSeats = 0,
    totalCapacity = 0,
    refundRate = 0,
    refundCount = 0,
    checkInRate = 0,
    gateCheckedIn = 0,
    revenueGrowthPercent = 0,
    averageTicketPrice = 0,
  } = kpis;

  const cards = [
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: formatIndianCurrency(totalRevenue),
      rawSubValue: `ATP: ₹${averageTicketPrice}`,
      icon: IndianRupee,
      glowColor: 'from-emerald-500/20 to-transparent',
      borderColor: 'border-emerald-500/30 hover:border-emerald-500/60',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      badge: revenueGrowthPercent !== 0 ? {
        text: `${revenueGrowthPercent > 0 ? '+' : ''}${revenueGrowthPercent}%`,
        isPositive: revenueGrowthPercent >= 0,
      } : { text: 'Stable', isPositive: true },
      metricLabel: 'vs prior period',
    },
    {
      id: 'tickets-sold',
      title: 'Tickets Sold',
      value: totalTicketsSold.toLocaleString('en-IN'),
      rawSubValue: `${totalBookedSeats} seats booked`,
      icon: Ticket,
      glowColor: 'from-cyan-500/20 to-transparent',
      borderColor: 'border-cyan-500/30 hover:border-cyan-500/60',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      badge: { text: 'Active Run', isPositive: true },
      metricLabel: 'box office volume',
    },
    {
      id: 'average-occupancy',
      title: 'Occupancy Rate',
      value: `${occupancy}%`,
      rawSubValue: `${totalBookedSeats} / ${totalCapacity} capacity`,
      icon: Users,
      glowColor: 'from-purple-500/20 to-transparent',
      borderColor: 'border-purple-500/30 hover:border-purple-500/60',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      badge: {
        text: occupancy >= 75 ? 'Optimal' : occupancy >= 40 ? 'Moderate' : 'Underutilized',
        isPositive: occupancy >= 50,
      },
      metricLabel: 'screen utilization',
    },
    {
      id: 'today-revenue',
      title: "Today's Revenue",
      value: formatIndianCurrency(todayRevenue),
      rawSubValue: 'Live daily stream',
      icon: Clock,
      glowColor: 'from-amber-500/20 to-transparent',
      borderColor: 'border-amber-500/30 hover:border-amber-500/60',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      badge: { text: 'Real-time', isPositive: true },
      metricLabel: '00:00 to 23:59 IST',
    },
    {
      id: 'refund-rate',
      title: 'Refund Rate',
      value: `${refundRate}%`,
      rawSubValue: `${refundCount} cancellations`,
      icon: RotateCcw,
      glowColor: 'from-rose-500/20 to-transparent',
      borderColor: 'border-rose-500/30 hover:border-rose-500/60',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      badge: {
        text: refundRate <= 3 ? 'Low Risk' : refundRate <= 7 ? 'Monitor' : 'Elevated',
        isPositive: refundRate <= 5,
      },
      metricLabel: 'industry avg: 3.5%',
    },
    {
      id: 'checkin-rate',
      title: 'Check-in Rate',
      value: `${checkInRate}%`,
      rawSubValue: `${gateCheckedIn} admissions verified`,
      icon: CheckCircle2,
      glowColor: 'from-blue-500/20 to-transparent',
      borderColor: 'border-blue-500/30 hover:border-blue-500/60',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      badge: {
        text: checkInRate >= 90 ? 'Excellent' : checkInRate >= 70 ? 'Normal' : 'Pending',
        isPositive: checkInRate >= 75,
      },
      metricLabel: 'confirmed → admitted',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-gray-900/60 border border-gray-800 animate-pulse p-4 flex flex-col justify-between"
          >
            <div className="h-4 w-20 bg-gray-800 rounded" />
            <div className="h-7 w-28 bg-gray-700 rounded" />
            <div className="h-3 w-32 bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className={`relative overflow-hidden rounded-xl bg-[#0d1527]/90 backdrop-blur-md p-4 border ${card.borderColor} shadow-lg shadow-black/40 hover:-translate-y-1 transition-all duration-300 group`}
          >
            {/* Top gradient glow overlay */}
            <div
              className={`absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br ${card.glowColor} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
            />

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={`p-2 rounded-lg border ${card.iconBg} transition-transform duration-300 group-hover:scale-110`}
              >
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            <div className="my-1">
              <div className="text-2xl font-bold tracking-tight text-white font-mono">
                {card.value}
              </div>
              <div className="text-[11px] text-gray-400 truncate mt-0.5">
                {card.rawSubValue}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-gray-800/80 flex items-center justify-between text-[11px]">
              <span className="text-gray-400 font-mono">{card.metricLabel}</span>
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-mono font-medium text-[10px] ${
                  card.badge.isPositive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {card.badge.isPositive ? (
                  <TrendingUp className="w-2.5 h-2.5" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5" />
                )}
                {card.badge.text}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

KPIGrid.propTypes = {
  kpis: PropTypes.shape({
    totalRevenue: PropTypes.number,
    todayRevenue: PropTypes.number,
    totalTicketsSold: PropTypes.number,
    occupancy: PropTypes.number,
    totalBookedSeats: PropTypes.number,
    totalCapacity: PropTypes.number,
    refundRate: PropTypes.number,
    refundCount: PropTypes.number,
    checkInRate: PropTypes.number,
    gateCheckedIn: PropTypes.number,
    revenueGrowthPercent: PropTypes.number,
    averageTicketPrice: PropTypes.number,
  }),
  loading: PropTypes.bool,
};

export default KPIGrid;
