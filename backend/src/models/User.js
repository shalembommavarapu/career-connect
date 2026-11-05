import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES } from '../config/constants.js';

const educationSchema = new mongoose.Schema({
  degree: { type: String, trim: true },
  college: { type: String, trim: true },
  fieldOfStudy: { type: String, trim: true },
  graduationYear: { type: Number },
  cgpa: { type: String, trim: true },
  isCurrent: { type: Boolean, default: false }
}, { _id: true });

const projectSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  description: { type: String, trim: true },
  technologies: [{ type: String, trim: true }],
  githubUrl: { type: String, trim: true },
  liveUrl: { type: String, trim: true }
}, { _id: true });

const certificationSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  issuer: { type: String, trim: true },
  issueDate: { type: String, trim: true },
  credentialUrl: { type: String, trim: true }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  passwordHash: {
    type: String,
    required: [true, 'Please provide a password hash'],
    select: false
  },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.STUDENT
  },
  headline: {
    type: String,
    trim: true,
    maxlength: [140, 'Headline cannot exceed 140 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  // Student Profile Fields
  education: [educationSchema],
  skills: [{
    type: String,
    trim: true
  }],
  projects: [projectSchema],
  certifications: [certificationSchema],
  socialLinks: {
    github: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    portfolio: { type: String, trim: true },
    twitter: { type: String, trim: true }
  },
  resume: {
    url: { type: String },
    originalName: { type: String },
    mimeType: { type: String },
    size: { type: Number },
    uploadedAt: { type: Date }
  },
  preferences: {
    roles: [{ type: String, trim: true }],
    locations: [{ type: String, trim: true }],
    workModes: [{ type: String, trim: true }],
    minSalary: { type: Number, default: 0 }
  },
  // Recruiter Profile Fields
  company: {
    name: { type: String, trim: true },
    logo: { type: String, trim: true },
    website: { type: String, trim: true },
    description: { type: String, trim: true },
    location: { type: String, trim: true },
    industry: { type: String, trim: true },
    size: { type: String, trim: true }
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate Profile Completion Percentage
userSchema.methods.calculateProfileCompletion = function() {
  if (this.role === USER_ROLES.RECRUITER) {
    let score = 20; // base for registration
    if (this.company?.name) score += 25;
    if (this.company?.description) score += 20;
    if (this.company?.website) score += 15;
    if (this.company?.logo) score += 10;
    if (this.phone) score += 10;
    return Math.min(score, 100);
  }

  // Student completion metric
  let score = 15; // base registered
  if (this.headline) score += 10;
  if (this.bio) score += 10;
  if (this.skills && this.skills.length > 0) score += 15;
  if (this.education && this.education.length > 0) score += 15;
  if (this.projects && this.projects.length > 0) score += 15;
  if (this.resume && this.resume.url) score += 20;
  if (this.socialLinks?.github || this.socialLinks?.linkedin) score += 5;
  return Math.min(score, 100);
};

// Compare candidate password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
export default User;
