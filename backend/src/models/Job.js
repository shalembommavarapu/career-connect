import mongoose from 'mongoose';
import { EMPLOYMENT_TYPES, WORK_MODES, EXPERIENCE_LEVELS, JOB_STATUS, LISTING_SOURCES } from '../config/constants.js';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  companyLogo: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true
  },
  responsibilities: [{
    type: String,
    trim: true
  }],
  requiredSkills: [{
    type: String,
    required: true,
    trim: true
  }],
  qualifications: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  workMode: {
    type: String,
    enum: WORK_MODES,
    default: 'remote'
  },
  employmentType: {
    type: String,
    enum: EMPLOYMENT_TYPES,
    default: 'full-time'
  },
  isInternship: {
    type: Boolean,
    default: false
  },
  internshipDetails: {
    duration: { type: String, default: '' }, // e.g. "3 Months", "6 Months"
    stipend: { type: String, default: '' }, // e.g. "₹25,000 / month" or "$1,200 / month"
    isPaid: { type: Boolean, default: true },
    perks: [{ type: String, trim: true }] // e.g. "Certificate", "Letter of Recommendation", "Flexible Hours"
  },
  experienceLevel: {
    type: String,
    enum: EXPERIENCE_LEVELS,
    default: 'fresher'
  },
  salary: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    period: { type: String, default: 'yearly' }, // 'yearly' | 'monthly' | 'lpa'
    display: { type: String, default: '' } // e.g. "₹6 - ₹10 LPA"
  },
  deadline: {
    type: Date
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  source: {
    type: String,
    default: LISTING_SOURCES.INTERNAL
  },
  externalId: {
    type: String,
    default: null
  },
  originalUrl: {
    type: String,
    default: null
  },
  listingType: {
    type: String,
    enum: ['internal', 'external'],
    default: 'internal'
  },
  status: {
    type: String,
    enum: Object.values(JOB_STATUS),
    default: JOB_STATUS.ACTIVE
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  applicationsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for high performance searching and filtering
jobSchema.index({ title: 'text', companyName: 'text', description: 'text', requiredSkills: 'text' });
jobSchema.index({ status: 1, isInternship: 1, createdAt: -1 });
jobSchema.index({ recruiterId: 1, createdAt: -1 });
jobSchema.index({ workMode: 1, employmentType: 1, experienceLevel: 1 });

const Job = mongoose.model('Job', jobSchema);
export default Job;
