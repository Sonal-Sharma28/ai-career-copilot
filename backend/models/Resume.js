import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  skills: {
    type: [String],
    default: [],
  },
  education: {
    type: [String],
    default: [],
  },
  experience: {
    type: [String],
    default: [],
  },
  rawText: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;
