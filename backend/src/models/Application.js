import mongoose from 'mongoose';
import { APPLICATION_STATUS } from '../config/constants.js';

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: Object.values(APPLICATION_STATUS),
    required: true
  },
  note: {
    type: String,
    trim: true,
    default: ''
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  changedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required']
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resumeUrl: {
    type: String,
    required: [true, 'Resume is required for application']
  },
  resumeOriginalName: {
    type: String,
    default: 'resume.pdf'
  },
  coverLetter: {
    type: String,
    trim: true,
    maxlength: [3000, 'Cover letter cannot exceed 3000 characters']
  },
  status: {
    type: String,
    enum: Object.values(APPLICATION_STATUS),
    default: APPLICATION_STATUS.APPLIED
  },
  statusHistory: [statusHistorySchema],
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Enforce unique application per student and job
applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ studentId: 1, createdAt: -1 });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
