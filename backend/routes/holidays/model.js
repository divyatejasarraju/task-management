import mongoose from 'mongoose';

const holidaySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Holiday = mongoose.model('Holiday', holidaySchema);

export default Holiday;