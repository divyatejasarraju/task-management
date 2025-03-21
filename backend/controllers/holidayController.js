import Holiday from '../models/holidayModel.js';

// @desc    Add a holiday
// @route   POST /api/holidays
// @access  Private/Admin
const addHoliday = async (req, res) => {
  const { name, date } = req.body;

  try {
    const holiday = await Holiday.create({
      name,
      date
    });

    res.status(201).json(holiday);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all holidays
// @route   GET /api/holidays
// @access  Public
const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find({}).sort({ date: 1 });
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a holiday
// @route   DELETE /api/holidays/:id
// @access  Private/Admin
const deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    
    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }
    
    await holiday.deleteOne();
    
    res.json({ message: 'Holiday removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { addHoliday, getHolidays, deleteHoliday };