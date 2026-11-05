import Job from '../models/Job.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';
import User from '../models/User.js';
import { calculateSkillMatch, rankJobsForStudent } from '../services/matchingService.js';
import { JOB_STATUS, USER_ROLES } from '../config/constants.js';

/**
 * @route   GET /api/jobs
 * @desc    Get filtered, paginated list of jobs & internships
 * @access  Public (Optional auth for match calculations)
 */
export const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      workMode,
      employmentType,
      isInternship,
      isPaid,
      experienceLevel,
      skills,
      source,
      minSalary,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const query = { status: JOB_STATUS.ACTIVE };

    // Search keyword
    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { companyName: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { requiredSkills: { $elemMatch: { $regex: term, $options: 'i' } } }
      ];
    }

    // Location
    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    // Work Mode
    if (workMode) {
      const modes = workMode.includes(',') ? workMode.split(',') : [workMode];
      query.workMode = { $in: modes };
    }

    // Employment Type
    if (employmentType) {
      const types = employmentType.includes(',') ? employmentType.split(',') : [employmentType];
      query.employmentType = { $in: types };
    }

    // Is Internship filter
    if (isInternship !== undefined) {
      query.isInternship = isInternship === 'true' || isInternship === true;
    }

    // Paid internship filter
    if (isPaid !== undefined && isInternship) {
      query['internshipDetails.isPaid'] = isPaid === 'true' || isPaid === true;
    }

    // Experience Level
    if (experienceLevel) {
      const levels = experienceLevel.includes(',') ? experienceLevel.split(',') : [experienceLevel];
      query.experienceLevel = { $in: levels };
    }

    // Skills filter
    if (skills) {
      const skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillList.length > 0) {
        query.requiredSkills = { $in: skillList.map(s => new RegExp(s, 'i')) };
      }
    }

    // Source filter (Internal vs Unstop / External)
    if (source && source !== 'all') {
      if (source === 'Internal') {
        query.listingType = 'internal';
      } else if (source === 'Unstop') {
        query.source = 'Unstop';
      } else if (source === 'External') {
        query.listingType = 'external';
      }
    }

    // Min Salary
    if (minSalary && Number(minSalary) > 0) {
      query['salary.min'] = { $gte: Number(minSalary) };
    }

    // Sort order
    let sortOptions = { createdAt: -1 };
    if (sort === 'salary') {
      sortOptions = { 'salary.max': -1 };
    } else if (sort === 'deadline') {
      sortOptions = { deadline: 1 };
    } else if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 12, 1), 50);
    const skip = (pageNum - 1) * limitNum;

    const [jobs, totalJobs] = await Promise.all([
      Job.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Job.countDocuments(query)
    ]);

    // Calculate skill match score if student is authenticated
    let studentSkills = [];
    let savedJobIds = new Set();
    let appliedJobIds = new Set();

    if (req.user && req.user.role === USER_ROLES.STUDENT) {
      studentSkills = req.user.skills || [];
      const [saved, applied] = await Promise.all([
        SavedJob.find({ userId: req.user._id }).select('jobId'),
        Application.find({ studentId: req.user._id }).select('jobId')
      ]);
      saved.forEach(s => savedJobIds.add(s.jobId.toString()));
      applied.forEach(a => appliedJobIds.add(a.jobId.toString()));
    }

    const enrichedJobs = jobs.map(job => {
      const skillMatch = studentSkills.length > 0
        ? calculateSkillMatch(studentSkills, job.requiredSkills)
        : null;

      return {
        ...job,
        skillMatch,
        isSaved: savedJobIds.has(job._id.toString()),
        hasApplied: appliedJobIds.has(job._id.toString())
      };
    });

    res.json({
      success: true,
      jobs: enrichedJobs,
      pagination: {
        totalJobs,
        totalPages: Math.ceil(totalJobs / limitNum),
        currentPage: pageNum,
        limit: limitNum,
        hasMore: pageNum * limitNum < totalJobs
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/jobs/:id
 * @desc    Get single job by ID with related jobs & match score
 * @access  Public (Optional auth)
 */
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job opportunity not found' });
    }

    // Increment view count asynchronously
    Job.findByIdAndUpdate(job._id, { $inc: { viewsCount: 1 } }).exec();

    let skillMatch = null;
    let isSaved = false;
    let hasApplied = false;

    if (req.user && req.user.role === USER_ROLES.STUDENT) {
      const studentSkills = req.user.skills || [];
      skillMatch = calculateSkillMatch(studentSkills, job.requiredSkills);

      const [saved, applied] = await Promise.all([
        SavedJob.findOne({ userId: req.user._id, jobId: job._id }),
        Application.findOne({ studentId: req.user._id, jobId: job._id })
      ]);
      isSaved = !!saved;
      hasApplied = !!applied;
    }

    // Fetch related jobs based on skills or employment type
    const relatedJobs = await Job.find({
      _id: { $ne: job._id },
      status: JOB_STATUS.ACTIVE,
      $or: [
        { requiredSkills: { $in: job.requiredSkills } },
        { employmentType: job.employmentType }
      ]
    }).limit(4).lean();

    res.json({
      success: true,
      job: {
        ...job.toObject(),
        skillMatch,
        isSaved,
        hasApplied
      },
      relatedJobs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/jobs
 * @desc    Create a new job listing
 * @access  Private (Recruiter / Admin)
 */
export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      companyName,
      companyLogo,
      description,
      responsibilities,
      requiredSkills,
      qualifications,
      location,
      workMode,
      employmentType,
      isInternship,
      internshipDetails,
      experienceLevel,
      salary,
      deadline
    } = req.body;

    if (!title || !description || !location || !requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, location, and at least one skill.'
      });
    }

    const company = companyName || req.user.company?.name || 'Recruiter Company';
    const logo = companyLogo || req.user.company?.logo || '';

    const newJob = await Job.create({
      title: title.trim(),
      companyName: company.trim(),
      companyLogo: logo,
      description: description.trim(),
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills.map(s => s.trim()).filter(Boolean) : [requiredSkills],
      qualifications: Array.isArray(qualifications) ? qualifications : [],
      location: location.trim(),
      workMode: workMode || 'remote',
      employmentType: employmentType || (isInternship ? 'internship' : 'full-time'),
      isInternship: Boolean(isInternship),
      internshipDetails: internshipDetails || {},
      experienceLevel: experienceLevel || 'fresher',
      salary: salary || {},
      deadline: deadline ? new Date(deadline) : null,
      recruiterId: req.user._id,
      listingType: 'internal',
      status: JOB_STATUS.ACTIVE
    });

    res.status(201).json({
      success: true,
      message: 'Job opportunity created successfully',
      job: newJob
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update a job listing
 * @access  Private (Owner Recruiter / Admin)
 */
export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Role check: recruiter must own the job; admin can update any
    if (req.user.role !== USER_ROLES.ADMIN && job.recruiterId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit jobs created by your account.'
      });
    }

    const updatableFields = [
      'title', 'companyName', 'companyLogo', 'description', 'responsibilities',
      'requiredSkills', 'qualifications', 'location', 'workMode', 'employmentType',
      'isInternship', 'internshipDetails', 'experienceLevel', 'salary', 'deadline', 'status'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    await job.save();

    res.json({
      success: true,
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete a job listing
 * @access  Private (Owner Recruiter / Admin)
 */
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (req.user.role !== USER_ROLES.ADMIN && job.recruiterId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete jobs created by your account.'
      });
    }

    // Delete associated applications and saved entries
    await Promise.all([
      Job.findByIdAndDelete(job._id),
      Application.deleteMany({ jobId: job._id }),
      SavedJob.deleteMany({ jobId: job._id })
    ]);

    res.json({
      success: true,
      message: 'Job and associated applications removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/jobs/recruiter/my-jobs
 * @desc    Get all jobs created by current recruiter with applicant counts
 * @access  Private (Recruiter)
 */
export const getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 }).lean();

    // Attach accurate live applicant count for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async job => {
        const count = await Application.countDocuments({ jobId: job._id });
        return {
          ...job,
          applicantsCount: count
        };
      })
    );

    res.json({
      success: true,
      jobs: jobsWithCounts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/jobs/student/recommendations
 * @desc    Get transparent skill-matched recommended jobs
 * @access  Private (Student)
 */
export const getRecommendations = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id);
    const activeJobs = await Job.find({ status: JOB_STATUS.ACTIVE }).limit(30).lean();

    const ranked = rankJobsForStudent(student, activeJobs);

    res.json({
      success: true,
      recommendations: ranked.slice(0, 10)
    });
  } catch (error) {
    next(error);
  }
};
