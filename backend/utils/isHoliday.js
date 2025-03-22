import Holiday from '../routes/holidays/model.js';

const isHoliday = async (date) => {
  // Format the date to match only year-month-day
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  const nextDay = new Date(checkDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const holiday = await Holiday.findOne({
    date: {
      $gte: checkDate,
      $lt: nextDay
    }
  });

  return !!holiday;
};

export default isHoliday;