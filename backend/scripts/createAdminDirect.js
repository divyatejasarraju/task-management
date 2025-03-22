import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Main function
const createDirectAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');

    // Dynamically import the User model
    // This avoids potential issues with how models are exported
    const { default: User } = await import('../models/userModel.js');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'adminuser@gmail.com' });
    if (existingAdmin) {
      console.log('Admin with this email already exists');
      await mongoose.connection.close();
      return;
    }

    // Create admin credentials
    const adminData = {
      name: 'abcd',
      email: 'abcd',
      password: 'abcd', // Will be hashed by the User model's pre-save hook
      role: 'admin'
    };

    console.log('Creating admin user with these credentials:');
    console.log(`- Name: ${adminData.name}`);
    console.log(`- Email: ${adminData.email}`);
    console.log(`- Password: ${adminData.password}`);
    console.log(`- Role: ${adminData.role}`);

    // Create the user - this will trigger any pre-save hooks in your model
    const newAdmin = new User(adminData);
    await newAdmin.save();
    
    console.log('\nAdmin user created successfully!');
    
    // Test password matching to confirm it works
    console.log('\nTesting password matching function...');
    const testPasswordA = await newAdmin.matchPassword(adminData.password);
    const testPasswordB = await newAdmin.matchPassword('wrong-password');
    
    console.log(`Correct password match result: ${testPasswordA}`);
    console.log(`Incorrect password match result: ${testPasswordB}`);
    
    if (testPasswordA && !testPasswordB) {
      console.log('Password matching function is working correctly');
    } else {
      console.log('WARNING: Password matching function is not working as expected!');
    }
    
    // Retrieve and display the stored admin user
    const storedAdmin = await User.findOne({ email: adminData.email });
    console.log('\nStored admin user:');
    console.log(`- ID: ${storedAdmin._id}`);
    console.log(`- Name: ${storedAdmin.name}`);
    console.log(`- Email: ${storedAdmin.email}`);
    console.log(`- Role: ${storedAdmin.role}`);
    console.log(`- Password hash: ${storedAdmin.password.substring(0, 20)}...`);
    
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
    console.log('\n-------------------------------------');
    console.log('LOGIN CREDENTIALS:');
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    console.log('-------------------------------------');
    
  } catch (error) {
    console.error('Error creating admin user:');
    console.error(error);
    
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

// Run the function
createDirectAdmin();