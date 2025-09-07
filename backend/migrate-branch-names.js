/**
 * Migration script to convert "Mechatronics" to "MAE" in existing database records
 * Run this script once to clean up any existing data
 */

import mongoose from 'mongoose';
import Student from './models/Student.js';
import Subject from './models/Subject.js';
import dotenv from 'dotenv'
dotenv.config();
const MONGODB_URL = process.env.MONGODB_URL;

async function migrateBranchNames() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URL);
    // console.log('Connected to MongoDB');

    // Update Student records
    const studentResult = await Student.updateMany(
      { branch: "Mechatronics" },
      { $set: { branch: "MAE" } }
    );
    // console.log(`Updated ${studentResult.modifiedCount} student records`);

    // Update Subject records - branches array
    const subjectResult = await Subject.updateMany(
      { branches: "Mechatronics" },
      { $set: { "branches.$": "MAE" } }
    );
    // console.log(`Updated ${subjectResult.modifiedCount} subject records`);

    // Additional update for subjects with multiple occurrences
    const subjects = await Subject.find({ branches: "Mechatronics" });
    for (const subject of subjects) {
      subject.branches = subject.branches.map(branch => 
        branch === "Mechatronics" ? "MAE" : branch
      );
      await subject.save();
    }

    // console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    // console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateBranchNames();
