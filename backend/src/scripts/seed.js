import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import { unstopAdapter } from '../services/externalJobService.js';
import { connectDB, closeDB } from '../config/db.js';
import { USER_ROLES, APPLICATION_STATUS, JOB_STATUS, LISTING_SOURCES } from '../config/constants.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting CareerConnect database seeding...');
    await connectDB();

    // Clear existing collections
    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      SavedJob.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    // Ensure dummy resume file exists in uploads/resumes
    const uploadsDir = path.resolve('uploads', 'resumes');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const sampleResumePath = path.join(uploadsDir, 'resume-sample-student.pdf');
    if (!fs.existsSync(sampleResumePath)) {
      fs.writeFileSync(sampleResumePath, '%PDF-1.4\n1 0 obj\n<< /Title (Student Verified Resume) /Author (CareerConnect) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
    }

    // 1. Create Users
    console.log('👤 Creating default users (Admin, Recruiters, Students)...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
    const recruiterPasswordHash = await bcrypt.hash('Recruiter@123', salt);
    const studentPasswordHash = await bcrypt.hash('Student@123', salt);

    // Admin
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@careerconnect.dev',
      passwordHash: adminPasswordHash,
      role: USER_ROLES.ADMIN,
      headline: 'Platform Administrator & Trust Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
      status: 'active'
    });

    // Recruiter 1: Google Cloud
    const recruiterGoogle = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@google.dev',
      passwordHash: recruiterPasswordHash,
      role: USER_ROLES.RECRUITER,
      headline: 'University Talent Acquisition Lead at Google Cloud',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop',
      phone: '+91 98765 43210',
      company: {
        name: 'Google Cloud',
        logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&h=120&fit=crop',
        website: 'https://cloud.google.com',
        description: 'Google Cloud accelerates every organization’s ability to digitally transform its business with leading cloud services and infrastructure.',
        location: 'Bengaluru / Hyderabad',
        industry: 'Cloud Computing & AI',
        size: '10,000+ employees'
      },
      status: 'active'
    });

    // Recruiter 2: Stripe
    const recruiterStripe = await User.create({
      name: 'Marcus Vance',
      email: 'marcus@stripe.dev',
      passwordHash: recruiterPasswordHash,
      role: USER_ROLES.RECRUITER,
      headline: 'Senior Technical Recruiter at Stripe',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
      phone: '+91 91234 56789',
      company: {
        name: 'Stripe',
        logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&h=120&fit=crop',
        website: 'https://stripe.com',
        description: 'Stripe is a financial infrastructure platform for businesses, powering billions of online transactions.',
        location: 'Remote / Global',
        industry: 'FinTech',
        size: '5,000+ employees'
      },
      status: 'active'
    });

    // Student 1 (Main Demo Student)
    const studentDemo = await User.create({
      name: 'Aarav Sharma',
      email: 'student@demo.dev',
      passwordHash: studentPasswordHash,
      role: USER_ROLES.STUDENT,
      headline: 'Final Year B.Tech CSE Student | Aspiring Full-Stack & Cloud Engineer',
      bio: 'Enthusiastic computer science undergrad eager to craft high-impact web and cloud architectures. Passionate about React, Node.js, and distributed systems.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop',
      phone: '+91 98111 22334',
      location: 'Bengaluru, India',
      education: [
        {
          degree: 'Bachelor of Technology (B.Tech)',
          college: 'National Institute of Technology (NIT)',
          fieldOfStudy: 'Computer Science and Engineering',
          graduationYear: 2026,
          cgpa: '8.8 / 10',
          isCurrent: true
        }
      ],
      skills: ['React', 'Node.js', 'JavaScript', 'Tailwind CSS', 'MongoDB', 'Express', 'Git', 'Docker'],
      projects: [
        {
          title: 'CareerConnect Portal',
          description: 'Full-stack MERN job and internship discovery platform for college students.',
          technologies: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
          githubUrl: 'https://github.com/demo/careerconnect',
          liveUrl: 'https://careerconnect.demo'
        },
        {
          title: 'Cloud Storage Microservice',
          description: 'High-concurrency file caching service with auto-scaling support.',
          technologies: ['Node.js', 'Docker', 'AWS S3'],
          githubUrl: 'https://github.com/demo/cloud-cache'
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          issueDate: '2025',
          credentialUrl: 'https://aws.amazon.com/certification'
        }
      ],
      socialLinks: {
        github: 'https://github.com/aaravsharma',
        linkedin: 'https://linkedin.com/in/aaravsharma',
        portfolio: 'https://aaravsharma.dev'
      },
      resume: {
        url: '/uploads/resumes/resume-sample-student.pdf',
        originalName: 'Aarav_Sharma_Resume_2026.pdf',
        mimeType: 'application/pdf',
        size: 142850,
        uploadedAt: new Date()
      },
      preferences: {
        roles: ['Frontend Developer', 'Full Stack Developer', 'Cloud Engineer'],
        locations: ['Bengaluru', 'Remote', 'Hyderabad'],
        workModes: ['remote', 'hybrid'],
        minSalary: 800000
      },
      status: 'active'
    });

    // Student 2 (AI/Data Science)
    const studentPriya = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@campus.edu',
      passwordHash: studentPasswordHash,
      role: USER_ROLES.STUDENT,
      headline: 'Pre-final Year CSE Student | Machine Learning & Python Enthusiast',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
      phone: '+91 97777 88899',
      location: 'Pune, India',
      education: [
        {
          degree: 'B.Tech in Artificial Intelligence',
          college: 'Pune Institute of Computer Technology',
          fieldOfStudy: 'Data Science',
          graduationYear: 2026,
          cgpa: '9.2 / 10',
          isCurrent: true
        }
      ],
      skills: ['Python', 'PyTorch', 'Machine Learning', 'Data Analysis', 'SQL', 'FastAPI'],
      status: 'active'
    });

    // 2. Create Internal Job Opportunities
    console.log('💼 Seeding internal job & internship listings...');
    const internalJobsData = [
      {
        title: 'Associate Cloud Engineer (Fresher 2026)',
        companyName: 'Google Cloud',
        companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&h=120&fit=crop',
        description: 'Join the Google Cloud infrastructure engineering squad. Work on distributed deployment systems, containerization, and enterprise cloud tooling.',
        responsibilities: [
          'Deploy, monitor, and optimize cloud services and Kubernetes clusters.',
          'Build automated infrastructure validation pipelines with Terraform and Python.',
          'Collaborate across global engineering hubs to support zero-downtime releases.'
        ],
        requiredSkills: ['Docker', 'Kubernetes', 'Python', 'Linux', 'Computer Networks'],
        qualifications: [
          'Graduating in 2025 or 2026 with a degree in Computer Science, IT, or related fields.',
          'Strong grounding in OS concepts, networks, and basic scripting.'
        ],
        location: 'Bengaluru, Karnataka',
        workMode: 'hybrid',
        employmentType: 'full-time',
        isInternship: false,
        experienceLevel: 'fresher',
        salary: { min: 1400000, max: 2000000, currency: 'INR', display: '₹14 - ₹20 LPA' },
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        recruiterId: recruiterGoogle._id,
        listingType: 'internal',
        source: LISTING_SOURCES.INTERNAL,
        status: JOB_STATUS.ACTIVE
      },
      {
        title: 'Frontend Software Engineer - React / Tailwind',
        companyName: 'Stripe',
        companyLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&h=120&fit=crop',
        description: 'Stripe is looking for a frontend-focused developer to help build world-class merchant checkout experiences and developer dashboards.',
        responsibilities: [
          'Design pixel-perfect responsive web components in React and modern CSS.',
          'Optimize web performance, client caching, and accessibility standards.',
          'Integrate RESTful and GraphQL backend endpoints seamlessly.'
        ],
        requiredSkills: ['React', 'JavaScript', 'Tailwind CSS', 'TypeScript', 'Git'],
        qualifications: [
          'Proficiency with React hooks, state management, and modern ES6+ syntax.',
          'Eye for delightful UI interactions and web performance optimization.'
        ],
        location: 'Remote (Pan India)',
        workMode: 'remote',
        employmentType: 'full-time',
        isInternship: false,
        experienceLevel: 'fresher',
        salary: { min: 1200000, max: 1800000, currency: 'INR', display: '₹12 - ₹18 LPA' },
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        recruiterId: recruiterStripe._id,
        listingType: 'internal',
        source: LISTING_SOURCES.INTERNAL,
        status: JOB_STATUS.ACTIVE
      },
      {
        title: 'Full Stack Web Development Intern (Summer 2026)',
        companyName: 'Stripe',
        companyLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&h=120&fit=crop',
        description: 'Gain hands-on industry experience building scalable internal developer tools and customer onboarding workflows alongside senior engineers.',
        responsibilities: [
          'Develop web features using React and Node.js microservices.',
          'Write end-to-end unit and integration test suites.',
          'Participate in bi-weekly sprint planning and code design reviews.'
        ],
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Express'],
        qualifications: [
          'Currently enrolled in 3rd or 4th year undergraduate program.',
          'Demonstrated projects in modern web frameworks (MERN stack or similar).'
        ],
        location: 'Remote',
        workMode: 'remote',
        employmentType: 'internship',
        isInternship: true,
        internshipDetails: {
          duration: '6 Months',
          stipend: '₹45,000 / month',
          isPaid: true,
          perks: ['Certificate of Internship', 'Pre-Placement Offer (PPO) potential', 'Laptop provided', 'Flexible hours']
        },
        experienceLevel: 'fresher',
        salary: { min: 45000, max: 45000, currency: 'INR', display: '₹45,000 / month' },
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        recruiterId: recruiterStripe._id,
        listingType: 'internal',
        source: LISTING_SOURCES.INTERNAL,
        status: JOB_STATUS.ACTIVE
      },
      {
        title: 'Cloud Infrastructure & SRE Intern',
        companyName: 'Google Cloud',
        companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&h=120&fit=crop',
        description: 'Work with Google Cloud SRE teams to analyze metrics, build observability dashboards, and automate reliability testing.',
        responsibilities: [
          'Build Prometheus and Grafana dashboards for cluster observability.',
          'Automate health checks and incident runbooks using Python and Bash.',
          'Assist in chaos engineering exercises and load testing.'
        ],
        requiredSkills: ['Linux', 'Python', 'Docker', 'Computer Networks'],
        qualifications: [
          'Strong passion for systems engineering, networking, and cloud services.'
        ],
        location: 'Hyderabad, Telangana',
        workMode: 'on-site',
        employmentType: 'internship',
        isInternship: true,
        internshipDetails: {
          duration: '3 Months',
          stipend: '₹55,000 / month',
          isPaid: true,
          perks: ['Meals on campus', 'Certificate of Completion', 'Full mentorship']
        },
        experienceLevel: 'fresher',
        salary: { min: 55000, max: 55000, currency: 'INR', display: '₹55,000 / month' },
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        recruiterId: recruiterGoogle._id,
        listingType: 'internal',
        source: LISTING_SOURCES.INTERNAL,
        status: JOB_STATUS.ACTIVE
      }
    ];

    const internalJobs = await Job.insertMany(internalJobsData);

    // 3. Create External Job Listings (Unstop Provider Feed)
    console.log('🌐 Integrating external Unstop curated opportunities...');
    const externalUnstopJobs = await unstopAdapter.fetchCuratedFeed();
    const createdExternalJobs = await Job.insertMany(externalUnstopJobs);

    // 4. Create Sample Applications for studentDemo
    console.log('📝 Creating sample applications and history...');
    const appliedJob1 = internalJobs[1]; // Frontend Engineer at Stripe
    const appliedJob2 = internalJobs[2]; // Full Stack Intern at Stripe

    const app1 = await Application.create({
      studentId: studentDemo._id,
      jobId: appliedJob1._id,
      recruiterId: recruiterStripe._id,
      resumeUrl: studentDemo.resume.url,
      resumeOriginalName: studentDemo.resume.originalName,
      coverLetter: 'I am highly passionate about user experience engineering and have built multiple responsive React applications with Tailwind CSS. I would love the chance to contribute to Stripe.',
      status: APPLICATION_STATUS.SHORTLISTED,
      statusHistory: [
        {
          status: APPLICATION_STATUS.APPLIED,
          note: 'Application submitted online',
          changedBy: studentDemo._id,
          changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          status: APPLICATION_STATUS.UNDER_REVIEW,
          note: 'Resume passed initial screening by recruitment squad',
          changedBy: recruiterStripe._id,
          changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          status: APPLICATION_STATUS.SHORTLISTED,
          note: 'Selected for Technical Discussion Round 1',
          changedBy: recruiterStripe._id,
          changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ]
    });

    const app2 = await Application.create({
      studentId: studentDemo._id,
      jobId: appliedJob2._id,
      recruiterId: recruiterStripe._id,
      resumeUrl: studentDemo.resume.url,
      resumeOriginalName: studentDemo.resume.originalName,
      coverLetter: 'Excited about the summer 2026 internship at Stripe. I have hands-on experience developing REST APIs in Express and designing React component systems.',
      status: APPLICATION_STATUS.APPLIED,
      statusHistory: [
        {
          status: APPLICATION_STATUS.APPLIED,
          note: 'Application received and queued for review',
          changedBy: studentDemo._id,
          changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      ]
    });

    // Update applicant counts on jobs
    await Job.findByIdAndUpdate(appliedJob1._id, { $inc: { applicationsCount: 1 } });
    await Job.findByIdAndUpdate(appliedJob2._id, { $inc: { applicationsCount: 1 } });

    // 5. Create Saved Jobs
    console.log('⭐ Creating saved jobs for demo student...');
    await SavedJob.create({
      userId: studentDemo._id,
      jobId: internalJobs[0]._id // Google Cloud Associate Cloud Engineer
    });
    await SavedJob.create({
      userId: studentDemo._id,
      jobId: createdExternalJobs[0]._id // Cisco Campus via Unstop
    });

    // 6. Create Notifications
    console.log('🔔 Creating in-app notification alerts...');
    await Notification.create({
      recipientId: studentDemo._id,
      senderId: recruiterStripe._id,
      type: 'application_status',
      title: 'Congratulations! Application Shortlisted',
      message: 'Your application for "Frontend Software Engineer - React / Tailwind" has been shortlisted for technical rounds.',
      link: '/student/applications',
      read: false
    });

    await Notification.create({
      recipientId: studentDemo._id,
      senderId: null,
      type: 'system',
      title: 'Welcome to CareerConnect!',
      message: 'Complete your profile to unlock personalized skill-matched job recommendations.',
      link: '/student/profile',
      read: true
    });

    // 7. Audit Log
    await AuditLog.create({
      actorId: admin._id,
      action: 'PLATFORM_INITIALIZATION',
      targetType: 'System',
      details: {
        message: 'CareerConnect platform seeded with demo data',
        jobsCount: internalJobs.length + createdExternalJobs.length,
        usersCount: 4
      }
    });

    console.log('✅ CareerConnect database seeded successfully!');
    console.log('--------------------------------------------------');
    console.log('🔑 TEST CREDENTIALS:');
    console.log('👨‍🎓 Student:   student@demo.dev         / Student@123');
    console.log('💼 Recruiter: sarah.jenkins@google.dev / Recruiter@123');
    console.log('💼 Recruiter: marcus@stripe.dev        / Recruiter@123');
    console.log('🛡️ Admin:     admin@careerconnect.dev  / Admin@123');
    console.log('--------------------------------------------------');

    await closeDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();
