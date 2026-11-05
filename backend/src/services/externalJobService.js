import { LISTING_SOURCES } from '../config/constants.js';

/**
 * CareerConnect External Job Provider Adapter Architecture
 * Allows connecting authorized external feeds or normalized external sources.
 */

// Adapter interface definition
class JobProviderAdapter {
  constructor(name) {
    this.name = name;
  }

  async fetchListings() {
    throw new Error('fetchListings method must be implemented by adapter');
  }

  normalize(rawItem) {
    throw new Error('normalize method must be implemented by adapter');
  }
}

/**
 * Adapter for Unstop Freshers & College Internships / Competitions
 */
export class UnstopProviderAdapter extends JobProviderAdapter {
  constructor() {
    super(LISTING_SOURCES.UNSTOP);
  }

  normalize(item) {
    return {
      title: item.title,
      companyName: item.organisation || item.companyName,
      companyLogo: item.logoUrl || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop',
      description: item.description || `Exciting fresher opportunity published via Unstop platform.`,
      responsibilities: item.responsibilities || [
        'Collaborate with product and engineering teams.',
        'Participate in development sprints and code reviews.',
        'Design test cases and implement verified solutions.'
      ],
      requiredSkills: item.skills || ['JavaScript', 'Problem Solving', 'Data Structures'],
      qualifications: item.qualifications || ['B.Tech / B.E / BCA / MCA or equivalent degrees'],
      location: item.location || 'Pan India / Hybrid',
      workMode: item.workMode || 'hybrid',
      employmentType: item.isInternship ? 'internship' : 'full-time',
      isInternship: Boolean(item.isInternship),
      internshipDetails: item.isInternship ? {
        duration: item.duration || '3-6 Months',
        stipend: item.stipend || '₹20,000 - ₹35,000 / month',
        isPaid: true,
        perks: ['Certificate', 'Pre-Placement Offer (PPO) Eligibility', 'Flexible Work']
      } : { perks: [] },
      experienceLevel: 'fresher',
      salary: {
        min: item.salaryMin || 600000,
        max: item.salaryMax || 1200000,
        currency: 'INR',
        display: item.salaryDisplay || '₹6.0 - ₹12.0 LPA'
      },
      deadline: item.deadline ? new Date(item.deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      source: LISTING_SOURCES.UNSTOP,
      externalId: item.id || `unstop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      originalUrl: item.url || 'https://unstop.com/jobs',
      listingType: 'external',
      status: 'active'
    };
  }

  async fetchCuratedFeed() {
    // Official feed / curated adapter data for college freshers
    const curatedFeed = [
      {
        id: 'unstop-fresh-01',
        title: 'Junior Software Engineer (Campus 2026)',
        organisation: 'Cisco Systems (via Unstop)',
        logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
        description: 'Cisco is hiring dynamic fresh graduates for Software Engineer roles across networking, cloud, and security verticals. Open to 2025/2026 batches.',
        skills: ['Python', 'C++', 'Computer Networks', 'Operating Systems', 'Git'],
        location: 'Bengaluru, Karnataka',
        workMode: 'hybrid',
        isInternship: false,
        salaryDisplay: '₹14.0 - ₹18.0 LPA',
        salaryMin: 1400000,
        salaryMax: 1800000,
        url: 'https://unstop.com/jobs/cisco-software-engineer-2026',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'unstop-intern-02',
        title: 'Full Stack Development Intern (Summer 2026)',
        organisation: 'Zomato (via Unstop)',
        logoUrl: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=100&h=100&fit=crop',
        description: 'Work directly on high-scale customer-facing consumer apps. Learn production Node.js, React, and MongoDB deployment workflows.',
        skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Tailwind CSS'],
        location: 'Gurugram, Haryana / Remote',
        workMode: 'hybrid',
        isInternship: true,
        duration: '6 Months',
        stipend: '₹40,000 / month',
        url: 'https://unstop.com/internships/zomato-full-stack-intern-2026',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'unstop-intern-03',
        title: 'AI & Data Science Research Intern',
        organisation: 'Samsung R&D Institute (via Unstop)',
        logoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&h=100&fit=crop',
        description: 'Explore state-of-the-art deep learning, NLP, and computer vision models for next-generation consumer intelligence.',
        skills: ['Python', 'PyTorch', 'Machine Learning', 'Data Analysis', 'SQL'],
        location: 'Noida, Uttar Pradesh',
        workMode: 'on-site',
        isInternship: true,
        duration: '3 Months',
        stipend: '₹50,000 / month',
        url: 'https://unstop.com/internships/samsung-ai-research-intern-2026',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      }
    ];

    return curatedFeed.map(item => this.normalize(item));
  }
}

export const unstopAdapter = new UnstopProviderAdapter();
