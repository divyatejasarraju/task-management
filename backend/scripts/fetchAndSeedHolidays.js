import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import Holiday from '../routes/holidays/model';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Fetch holidays from Nager.Date API
const fetchHolidays = async (year, countryCode = 'SG') => {
  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform data to match our schema
    return data.map(holiday => ({
      name: holiday.name,
      date: new Date(holiday.date)
    }));
  } catch (error) {
    console.error(`Error fetching holidays: ${error.message}`);
    return [];
  }
};

// Seed the database with holidays for multiple years
const seedDB = async () => {
  try {
    // First, delete all existing holidays
    await Holiday.deleteMany({});
    console.log('Deleted existing holidays');

    // Define years and countries to fetch
    const years = [2023, 2024, 2025];
    const countryCodes = ['US']; // Add more country codes as needed: 'CA', 'GB', etc.
    
    let totalHolidays = 0;
    
    // Fetch and insert holidays for each year and country
    for (const year of years) {
      for (const countryCode of countryCodes) {
        console.log(`Fetching holidays for ${countryCode} in ${year}...`);
        const holidays = await fetchHolidays(year, countryCode);
        
        if (holidays.length > 0) {
          await Holiday.insertMany(holidays);
          console.log(`Inserted ${holidays.length} holidays for ${countryCode} in ${year}`);
          totalHolidays += holidays.length;
        } else {
          console.log(`No holidays found for ${countryCode} in ${year}`);
        }
      }
    }

    console.log(`Total of ${totalHolidays} holidays inserted`);
    console.log('Data seeding completed!');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

// Execute the seeding process
connectDB().then(() => {
  seedDB().then(() => {
    console.log('Seeding completed successfully');
    process.exit();
  });
});