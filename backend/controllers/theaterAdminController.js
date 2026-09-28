import mongoose from 'mongoose';
import Theater from '../models/Theater.js';
import { generateDefaultRows, generateSeatsFromRows } from '../utils/seatLayoutGenerator.js';

const escapeRegex = (text) => {
  if (typeof text !== 'string') return '';
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * @desc    Create a new Multiplex / Theater
 * @route   POST /api/admin/theaters
 * @access  Private (Admin)
 */
export const createTheater = async (req, res, next) => {
  try {
    const { name, city, address, amenities, screens } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Theater name is required.' });
    }
    if (!city?.trim()) {
      return res.status(400).json({ success: false, message: 'City is required.' });
    }
    if (!address?.trim()) {
      return res.status(400).json({ success: false, message: 'Theater address is required.' });
    }

    // Process screens or default to 1 standard screen
    let initialScreens = [];
    if (Array.isArray(screens) && screens.length > 0) {
      initialScreens = screens.map((s, idx) => {
        const rows = s.seatLayout?.rows?.length ? s.seatLayout.rows : generateDefaultRows(10, 10);
        const layoutData = generateSeatsFromRows(rows);

        return {
          _id: new mongoose.Types.ObjectId(),
          name: s.name?.trim() || `Screen ${idx + 1}`,
          type: s.type || 'Standard',
          capacity: layoutData.capacity,
          seatLayout: {
            rows: layoutData.rows,
            seats: layoutData.seats,
          },
        };
      });
    } else {
      // Default 1 standard screen
      const layoutData = generateSeatsFromRows(generateDefaultRows(10, 10));
      initialScreens = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Screen 1',
          type: 'Standard',
          capacity: layoutData.capacity,
          seatLayout: {
            rows: layoutData.rows,
            seats: layoutData.seats,
          },
        },
      ];
    }

    // Process amenities
    const parsedAmenities = Array.isArray(amenities)
      ? amenities
      : typeof amenities === 'string'
        ? amenities
            .split(',')
            .map((a) => a.trim())
            .filter(Boolean)
        : ['Dolby Atmos', 'Parking', 'Food Court'];

    const theater = await Theater.create({
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
      amenities: parsedAmenities,
      facilities: parsedAmenities,
      screens: initialScreens,
      isActive: true,
      deletedAt: null,
    });

    return res.status(201).json({
      success: true,
      message: `Multiplex "${theater.name}" created successfully.`,
      theater,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all theaters for Admin Console (with pagination, search, status, city filters)
 * @route   GET /api/admin/theaters
 * @access  Private (Admin)
 */
export const getAdminTheaters = async (req, res, next) => {
  try {
    const {
      search,
      city,
      status = 'all',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = {};

    // Status Filter (all, active, inactive)
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    // City Filter
    if (city && city.trim() && city !== 'All Cities') {
      filter.city = { $regex: new RegExp(`^${escapeRegex(city.trim())}$`, 'i') };
    }

    // Search Query (name, city, address)
    if (search && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ name: searchRegex }, { city: searchRegex }, { address: searchRegex }];
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNumber - 1) * pageSize;

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortDirection };

    const [theaters, total, distinctCities] = await Promise.all([
      Theater.find(filter).sort(sortOptions).skip(skip).limit(pageSize),
      Theater.countDocuments(filter),
      Theater.distinct('city'),
    ]);

    const totalPages = Math.ceil(total / pageSize) || 1;

    return res.status(200).json({
      success: true,
      theaters,
      cities: distinctCities.filter(Boolean).sort(),
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a theater's metadata
 * @route   PUT /api/admin/theaters/:id
 * @access  Private (Admin)
 */
export const updateTheater = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid theater ID.' });
    }

    const theater = await Theater.findById(id);
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found.' });
    }

    const { name, city, address, amenities, isActive } = req.body;

    if (name !== undefined) theater.name = name.trim();
    if (city !== undefined) theater.city = city.trim();
    if (address !== undefined) theater.address = address.trim();
    if (isActive !== undefined) theater.isActive = Boolean(isActive);

    if (amenities !== undefined) {
      const parsed = Array.isArray(amenities)
        ? amenities
        : typeof amenities === 'string'
          ? amenities
              .split(',')
              .map((a) => a.trim())
              .filter(Boolean)
          : [];
      theater.amenities = parsed;
      theater.facilities = parsed;
    }

    await theater.save();

    return res.status(200).json({
      success: true,
      message: `Theater "${theater.name}" updated successfully.`,
      theater,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft Delete a theater (preserves bookings and show history)
 * @route   DELETE /api/admin/theaters/:id
 * @access  Private (Admin)
 */
export const deleteTheater = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid theater ID.' });
    }

    const theater = await Theater.findById(id);
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found.' });
    }

    theater.isActive = false;
    theater.deletedAt = new Date();
    await theater.save();

    return res.status(200).json({
      success: true,
      message: `Theater "${theater.name}" has been hidden. Historical bookings are safely preserved.`,
      theater,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Restore a soft-deleted theater
 * @route   PATCH /api/admin/theaters/:id/restore
 * @access  Private (Admin)
 */
export const restoreTheater = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid theater ID.' });
    }

    const theater = await Theater.findById(id);
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found.' });
    }

    theater.isActive = true;
    theater.deletedAt = null;
    await theater.save();

    return res.status(200).json({
      success: true,
      message: `Theater "${theater.name}" restored to active status.`,
      theater,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new Screen to a theater with visual seat layout
 * @route   POST /api/admin/theaters/:id/screens
 * @access  Private (Admin)
 */
export const addScreen = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid theater ID.' });
    }

    const theater = await Theater.findById(id);
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found.' });
    }

    const { name, type = 'Standard', seatLayout } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Screen name is required.' });
    }

    // Process visual rows into concrete seats
    const rows = seatLayout?.rows?.length ? seatLayout.rows : generateDefaultRows(10, 10);
    const layoutData = generateSeatsFromRows(rows);

    const newScreen = {
      _id: new mongoose.Types.ObjectId(),
      name: name.trim(),
      type: type || 'Standard',
      capacity: layoutData.capacity,
      seatLayout: {
        rows: layoutData.rows,
        seats: layoutData.seats,
      },
    };

    theater.screens.push(newScreen);
    await theater.save();

    return res.status(201).json({
      success: true,
      message: `Screen "${newScreen.name}" (${newScreen.type}, ${newScreen.capacity} seats) added to ${theater.name}.`,
      screen: newScreen,
      theater,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing Screen's metadata and seat layout
 * @route   PUT /api/admin/theaters/:id/screens/:screenId
 * @access  Private (Admin)
 */
export const updateScreen = async (req, res, next) => {
  try {
    const { id, screenId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(screenId)) {
      return res.status(400).json({ success: false, message: 'Invalid theater or screen ID.' });
    }

    const theater = await Theater.findById(id);
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found.' });
    }

    const screen = theater.screens.id(screenId);
    if (!screen) {
      return res.status(404).json({ success: false, message: 'Screen not found.' });
    }

    const { name, type, seatLayout } = req.body;

    if (name !== undefined) screen.name = name.trim();
    if (type !== undefined) screen.type = type;

    // If rows provided, regenerate dynamic seats and calculate capacity
    if (seatLayout?.rows?.length) {
      const layoutData = generateSeatsFromRows(seatLayout.rows);
      screen.seatLayout = {
        rows: layoutData.rows,
        seats: layoutData.seats,
      };
      screen.capacity = layoutData.capacity;
    }

    await theater.save();

    return res.status(200).json({
      success: true,
      message: `Screen "${screen.name}" updated successfully (${screen.capacity} seats).`,
      screen,
      theater,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a Screen from a theater
 * @route   DELETE /api/admin/theaters/:id/screens/:screenId
 * @access  Private (Admin)
 */
export const deleteScreen = async (req, res, next) => {
  try {
    const { id, screenId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(screenId)) {
      return res.status(400).json({ success: false, message: 'Invalid theater or screen ID.' });
    }

    const theater = await Theater.findById(id);
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found.' });
    }

    const screen = theater.screens.id(screenId);
    if (!screen) {
      return res.status(404).json({ success: false, message: 'Screen not found.' });
    }

    const screenName = screen.name;
    theater.screens.pull(screenId);
    await theater.save();

    return res.status(200).json({
      success: true,
      message: `Screen "${screenName}" removed from "${theater.name}".`,
      theater,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Duplicate an existing screen layout with 1-click
 * @route   POST /api/admin/theaters/:id/screens/:screenId/duplicate
 * @access  Private (Admin)
 */
export const duplicateScreenLayout = async (req, res, next) => {
  try {
    const { id, screenId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(screenId)) {
      return res.status(400).json({ success: false, message: 'Invalid theater or screen ID.' });
    }

    const theater = await Theater.findById(id);
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found.' });
    }

    const sourceScreen = theater.screens.id(screenId);
    if (!sourceScreen) {
      return res.status(404).json({ success: false, message: 'Source screen not found.' });
    }

    // Generate duplicate screen with cloned layout & new ID
    const duplicateName = `${sourceScreen.name} (Copy)`;
    const newScreen = {
      _id: new mongoose.Types.ObjectId(),
      name: duplicateName,
      type: sourceScreen.type,
      capacity: sourceScreen.capacity,
      seatLayout: {
        rows: JSON.parse(JSON.stringify(sourceScreen.seatLayout.rows || [])),
        seats: JSON.parse(JSON.stringify(sourceScreen.seatLayout.seats || [])),
      },
    };

    theater.screens.push(newScreen);
    await theater.save();

    return res.status(201).json({
      success: true,
      message: `Screen "${sourceScreen.name}" duplicated as "${duplicateName}" with identical layout.`,
      screen: newScreen,
      theater,
    });
  } catch (error) {
    next(error);
  }
};
