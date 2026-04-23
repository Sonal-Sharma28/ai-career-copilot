import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
    unique: true,
  },
  source: {
    type: String,
    default: 'Hacker News Jobs',
  }
}, {
  timestamps: true,
});

const Job = mongoose.model('Job', jobSchema);

export default Job;
