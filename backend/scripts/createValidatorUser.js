import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Main function to create validator user
const createDirectValidator = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');

    // Dynamically import the User model
    const { default: User } = await import('../routes/users/model.js');
    
    // Check if validator already exists
    const existingValidator = await User.findOne({ email: 'validatoruser@example.com' });
    if (existingValidator) {
      console.log('Validator with this email already exists');
      await mongoose.connection.close();
      return;
    }

    // Create validator credentials
    const validatorData = {
      name: 'Validator User',
      email: 'xxxxxxx', // Customize this email
      password: 'xxxxxx', // Change this to a strong password
      role: 'validator'
    };

    console.log('Creating validator user with these credentials:');
    console.log(`- Name: ${validatorData.name}`);
    console.log(`- Email: ${validatorData.email}`);
    console.log(`- Password: ${validatorData.password}`);
    console.log(`- Role: ${validatorData.role}`);

    // Create the user - this will trigger any pre-save hooks in your model
    const newValidator = new User(validatorData);
    await newValidator.save();
    
    console.log('\nValidator user created successfully!');
    
    // Test password matching to confirm it works
    console.log('\nTesting password matching function...');
    const testPasswordA = await newValidator.matchPassword(validatorData.password);
    const testPasswordB = await newValidator.matchPassword('wrong-password');
    
    console.log(`Correct password match result: ${testPasswordA}`);
    console.log(`Incorrect password match result: ${testPasswordB}`);
    
    if (testPasswordA && !testPasswordB) {
      console.log('Password matching function is working correctly');
    } else {
      console.log('WARNING: Password matching function is not working as expected!');
    }
    
    // Retrieve and display the stored validator user
    const storedValidator = await User.findOne({ email: validatorData.email });
    console.log('\nStored validator user:');
    console.log(`- ID: ${storedValidator._id}`);
    console.log(`- Name: ${storedValidator.name}`);
    console.log(`- Email: ${storedValidator.email}`);
    console.log(`- Role: ${storedValidator.role}`);
    console.log(`- Password hash: ${storedValidator.password.substring(0, 20)}...`);
    
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
    console.log('\n-------------------------------------');
    console.log('LOGIN CREDENTIALS:');
    console.log(`Email: ${validatorData.email}`);
    console.log(`Password: ${validatorData.password}`);
    console.log('-------------------------------------');
    
  } catch (error) {
    console.error('Error creating validator user:');
    console.error(error);
    
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

// Run the function
createDirectValidator();