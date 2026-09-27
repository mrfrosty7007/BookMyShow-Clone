import { calculateRevenueMetrics, calculateRevenueTimeSeries } from '../utils/revenueEngine.js';
import {
  calculateOverallOccupancy,
  calculateOccupancyHeatmap,
} from '../utils/occupancyCalculator.js';
import {
  getMoviePerformance,
  getTheaterUtilization,
  getTimeSlotDemand,
  getEntryConversion,
  getRefundIntelligence,
  generateExecutiveInsights,
} from '../utils/performanceAggregator.js';
import { generateCSVReport, getReportFilename } from '../utils/reportGenerator.js';

/**
 * Extract clean query filters from request
 */
const extractFilters = (query) => {
  return {
    startDate: query.startDate,
    endDate: query.endDate,
    movieId: query.movieId,
    theaterId: query.theaterId,
    screenType: query.screenType,
    screen: query.screen,
    city: query.city,
  };
};

/**
 * Executive Overview Analytics
 * @route   GET /api/admin/analytics/overview
 * @access  Private (Admin)
 */
export const getOverviewAnalytics = async (req, res, next) => {
  try {
    const filters = extractFilters(req.query);

    const [revenue, occupancy, conversion, refunds, movies, theaters, timeslots] =
      await Promise.all([
        calculateRevenueMetrics(filters),
        calculateOverallOccupancy(filters),
        getEntryConversion(filters),
        getRefundIntelligence(filters),
        getMoviePerformance(filters, 5),
        getTheaterUtilization(filters),
        getTimeSlotDemand(filters),
      ]);

    // Synthesize automated actionable executive insights
    const insights = generateExecutiveInsights({
      revenue,
      occupancy,
      movies,
      theaters,
      timeslots,
      conversion,
      refunds,
    });

    res.status(200).json({
      success: true,
      kpis: {
        totalRevenue: revenue.grossRevenue,
        netRevenue: revenue.netRevenue,
        todayRevenue: revenue.todayRevenue,
        totalTicketsSold: revenue.totalTicketsSold,
        totalBookings: revenue.totalBookings,
        confirmedBookings: revenue.confirmedBookings,
        occupancy: occupancy.overallOccupancy,
        totalCapacity: occupancy.totalCapacity,
        totalBookedSeats: occupancy.totalBookedSeats,
        refundRate: refunds.refundRatePercent,
        refundCount: refunds.refundCount,
        refundedRevenue: revenue.refundedRevenue,
        checkInRate: conversion.admissionConversionRate,
        gateCheckedIn: conversion.checkedIn,
        revenueGrowthPercent: revenue.revenueGrowthPercent,
        averageOrderValue: revenue.averageOrderValue,
        averageTicketPrice: revenue.averageTicketPrice,
      },
      insights,
      topMovies: movies,
      screenFormats: theaters.screenFormats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revenue Intelligence Time Series
 * @route   GET /api/admin/analytics/revenue
 * @access  Private (Admin)
 */
export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const filters = extractFilters(req.query);
    const { timeframe = 'daily' } = req.query;

    const [metrics, series] = await Promise.all([
      calculateRevenueMetrics(filters),
      calculateRevenueTimeSeries(filters, timeframe),
    ]);

    res.status(200).json({
      success: true,
      timeframe,
      metrics,
      series,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Occupancy Intelligence & Heatmap
 * @route   GET /api/admin/analytics/occupancy
 * @access  Private (Admin)
 */
export const getOccupancyAnalytics = async (req, res, next) => {
  try {
    const filters = extractFilters(req.query);

    const [overall, heatmapData] = await Promise.all([
      calculateOverallOccupancy(filters),
      calculateOccupancyHeatmap(filters),
    ]);

    res.status(200).json({
      success: true,
      overall,
      heatmap: heatmapData.matrix,
      orderedDays: heatmapData.orderedDays,
      timeSlots: heatmapData.timeSlots,
      peakSlot: heatmapData.peakSlot,
      quietestSlot: heatmapData.quietestSlot,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Movie Performance Intelligence
 * @route   GET /api/admin/analytics/movies
 * @access  Private (Admin)
 */
export const getMovieAnalytics = async (req, res, next) => {
  try {
    const filters = extractFilters(req.query);
    const { limit = 10 } = req.query;

    const movies = await getMoviePerformance(filters, Number(limit));

    res.status(200).json({
      success: true,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Theater & Screen Utilization
 * @route   GET /api/admin/analytics/theaters
 * @access  Private (Admin)
 */
export const getTheaterAnalytics = async (req, res, next) => {
  try {
    const filters = extractFilters(req.query);

    const utilization = await getTheaterUtilization(filters);

    res.status(200).json({
      success: true,
      screenFormats: utilization.screenFormats,
      theaters: utilization.theaters,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Time Slot Demand Breakdown
 * @route   GET /api/admin/analytics/timeslots
 * @access  Private (Admin)
 */
export const getTimeSlotAnalytics = async (req, res, next) => {
  try {
    const filters = extractFilters(req.query);

    const timeslots = await getTimeSlotDemand(filters);

    res.status(200).json({
      success: true,
      timeslots,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refund Intelligence & Trend
 * @route   GET /api/admin/analytics/refunds
 * @access  Private (Admin)
 */
export const getRefundAnalytics = async (req, res, next) => {
  try {
    const filters = extractFilters(req.query);

    const refunds = await getRefundIntelligence(filters);

    res.status(200).json({
      success: true,
      refunds,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export Business Intelligence Report (CSV or JSON Data)
 * @route   GET /api/admin/analytics/export
 * @access  Private (Admin)
 */
export const exportReport = async (req, res, next) => {
  try {
    const filters = extractFilters(req.query);
    const { format = 'csv' } = req.query;

    // Gather comprehensive report datasets
    const [
      revenueMetrics,
      revenueSeries,
      occupancy,
      heatmapData,
      movies,
      theaters,
      refunds,
      conversion,
    ] = await Promise.all([
      calculateRevenueMetrics(filters),
      calculateRevenueTimeSeries(filters, 'daily'),
      calculateOverallOccupancy(filters),
      calculateOccupancyHeatmap(filters),
      getMoviePerformance(filters, 20),
      getTheaterUtilization(filters),
      getRefundIntelligence(filters),
      getEntryConversion(filters),
    ]);

    const reportData = {
      kpis: {
        ...revenueMetrics,
        overallOccupancy: occupancy.overallOccupancy,
        totalCapacity: occupancy.totalCapacity,
        totalBookedSeats: occupancy.totalBookedSeats,
        refundRatePercent: refunds.refundRatePercent,
        admissionConversionRate: conversion.admissionConversionRate,
      },
      revenueSeries,
      movies,
      theaters,
      heatmap: heatmapData.matrix,
      refunds,
      conversion,
    };

    if (format === 'csv') {
      const csvContent = generateCSVReport(reportData);
      const filename = getReportFilename('csv');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csvContent);
    }

    // Return structured report JSON for client-side PDF generation
    const filename = getReportFilename('pdf');
    return res.status(200).json({
      success: true,
      filename,
      reportData,
    });
  } catch (error) {
    next(error);
  }
};
