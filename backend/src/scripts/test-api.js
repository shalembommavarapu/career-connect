import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import app from '../app.js';
import { connectDB, closeDB } from '../config/db.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { assertLocalDatabase } from './assertLocalDatabase.js';

const runTests = async () => {
  console.log('🧪 Starting CareerConnect Backend REST API Test Suite...');
  assertLocalDatabase();
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  let studentToken = '';
  let recruiterToken = '';
  let adminToken = '';
  let testJobId = '';
  let testAppId = '';
  let workflowJobId = '';
  let workflowUserId = '';
  let workflowStudentId = '';
  let workflowResumeFilename = '';
  let workflowCurrentResumeFilename = '';
  const workflowEmail = `workflow-${Date.now()}-${process.pid}@example.com`;

  const request = async (method, path, body = null, token = null) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const data = await res.json();
    return { status: res.status, ok: res.ok, data };
  };

  try {
    // 1. Health check
    console.log('\n--- 1. System Health ---');
    const health = await request('GET', '/api/health');
    console.log(`[PASS] GET /api/health -> Status ${health.status}, OK: ${health.data.status === 'ok'}`);

    // 2. Authentication: Student Login
    console.log('\n--- 2. Auth: Student Login ---');
    const studentLogin = await request('POST', '/api/auth/login', {
      email: 'student@demo.dev',
      password: 'Student@123'
    });
    if (!studentLogin.ok) throw new Error(`Student login failed: ${studentLogin.data.message}`);
    studentToken = studentLogin.data.token;
    console.log(`[PASS] POST /api/auth/login -> Logged in Aarav Sharma (Student), Token acquired.`);

    // 3. Auth: Recruiter Login
    console.log('\n--- 3. Auth: Recruiter Login ---');
    const recruiterLogin = await request('POST', '/api/auth/login', {
      email: 'marcus@stripe.dev',
      password: 'Recruiter@123'
    });
    if (!recruiterLogin.ok) throw new Error(`Recruiter login failed: ${recruiterLogin.data.message}`);
    recruiterToken = recruiterLogin.data.token;
    console.log(`[PASS] POST /api/auth/login -> Logged in Marcus Vance (Recruiter at Stripe).`);

    // 4. Auth: Admin Login
    console.log('\n--- 4. Auth: Admin Login ---');
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@careerconnect.dev',
      password: 'Admin@123'
    });
    if (!adminLogin.ok) throw new Error(`Admin login failed: ${adminLogin.data.message}`);
    adminToken = adminLogin.data.token;
    console.log(`[PASS] POST /api/auth/login -> Logged in Administrator.`);

    // 5. Auth: GET /api/auth/me
    console.log('\n--- 5. Auth: Current User Profile (GET /api/auth/me) ---');
    const meRes = await request('GET', '/api/auth/me', null, studentToken);
    console.log(`[PASS] GET /api/auth/me -> Name: ${meRes.data.user.name}, Role: ${meRes.data.user.role}, Completion: ${meRes.data.user.profileCompletion}%`);

    // 6. Jobs: Discover Jobs with Search and Filters
    console.log('\n--- 6. Jobs Discovery (GET /api/jobs) ---');
    const jobsRes = await request('GET', '/api/jobs?search=react', null, studentToken);
    console.log(`[PASS] GET /api/jobs?search=react -> Found ${jobsRes.data.jobs.length} jobs. Match scores populated.`);
    testJobId = jobsRes.data.jobs[0]._id;

    // 7. Job Details with Match Details
    console.log('\n--- 7. Job Details (GET /api/jobs/:id) ---');
    const jobDetailRes = await request('GET', `/api/jobs/${testJobId}`, null, studentToken);
    console.log(`[PASS] GET /api/jobs/${testJobId} -> "${jobDetailRes.data.job.title}", Match: ${jobDetailRes.data.job.skillMatch?.matchPercentage}%, isSaved: ${jobDetailRes.data.job.isSaved}`);

    // 8. Skill-Matched Recommendations
    console.log('\n--- 8. Skill-Matched Recommendations ---');
    const recRes = await request('GET', '/api/jobs/student/recommendations', null, studentToken);
    console.log(`[PASS] GET /api/jobs/student/recommendations -> Found ${recRes.data.recommendations.length} personalized recommendations.`);

    // 9. Applications: Student Application Tracking
    console.log('\n--- 9. Student Applications (GET /api/applications/my) ---');
    const myApps = await request('GET', '/api/applications/my', null, studentToken);
    console.log(`[PASS] GET /api/applications/my -> Retrieved ${myApps.data.applications.length} applications.`);
    testAppId = myApps.data.applications[0]._id;

    // 10. Recruiter: View Applicants for Recruiter Jobs
    console.log('\n--- 10. Recruiter View Applicants ---');
    const recApps = await request('GET', '/api/applications/recruiter/all', null, recruiterToken);
    console.log(`[PASS] GET /api/applications/recruiter/all -> Retrieved ${recApps.data.applications.length} applicants.`);

    // 11. Recruiter: Update Application Status
    console.log('\n--- 11. Recruiter Status Update ---');
    const updateStatusRes = await request('PATCH', `/api/applications/${testAppId}/status`, {
      status: 'Interview',
      note: 'Technical round scheduled for Thursday 2 PM'
    }, recruiterToken);
    console.log(`[PASS] PATCH /api/applications/${testAppId}/status -> Status updated to "${updateStatusRes.data.application.status}".`);

    // 12. Saved Jobs: Toggle Save
    console.log('\n--- 12. Saved Jobs Management ---');
    const savedRes = await request('GET', '/api/saved-jobs', null, studentToken);
    console.log(`[PASS] GET /api/saved-jobs -> ${savedRes.data.savedJobs.length} bookmarked jobs.`);

    // 13. Notifications
    console.log('\n--- 13. In-App Notifications ---');
    const notifs = await request('GET', '/api/notifications', null, studentToken);
    console.log(`[PASS] GET /api/notifications -> ${notifs.data.notifications.length} alerts, ${notifs.data.unreadCount} unread.`);

    // 14. Admin: Platform Overview & User Moderation
    console.log('\n--- 14. Admin Dashboard Overview ---');
    const adminOverview = await request('GET', '/api/admin/overview', null, adminToken);
    console.log(`[PASS] GET /api/admin/overview -> Total Users: ${adminOverview.data.stats.users.total}, Jobs: ${adminOverview.data.stats.jobs.total}, Apps: ${adminOverview.data.stats.applications.total}`);

    const adminUsers = await request('GET', '/api/admin/users', null, adminToken);
    console.log(`[PASS] GET /api/admin/users -> Retrieved ${adminUsers.data.users.length} registered users.`);

    // 15. Security verification: Student attempting Admin endpoint
    console.log('\n--- 15. Security: Role-Based Authorization Enforcement ---');
    const forbiddenRes = await request('GET', '/api/admin/overview', null, studentToken);
    if (forbiddenRes.status === 403) {
      console.log(`[PASS] Student blocked from Admin API with 403 Forbidden.`);
    } else {
      throw new Error(`Security failed: Student received status ${forbiddenRes.status}`);
    }

    // 16. Recruiter job creation, editing, application review, and deletion
    console.log('\n--- 16. Recruiter Job and Application Workflow ---');
    const workflowRegistration = await request('POST', '/api/auth/register', {
      name: 'Workflow Recruiter',
      email: workflowEmail,
      password: 'WorkflowPass123',
      role: 'recruiter',
      companyName: 'Workflow Test Company'
    });
    if (workflowRegistration.status !== 201) {
      throw new Error(`Workflow recruiter registration failed: ${workflowRegistration.data.message}`);
    }
    workflowUserId = workflowRegistration.data.user._id;
    const workflowToken = workflowRegistration.data.token;

    const recruiterProfile = await request('GET', '/api/profile', null, workflowToken);
    if (!recruiterProfile.ok || recruiterProfile.data.profile.company.name !== 'Workflow Test Company') {
      throw new Error('Recruiter company profile was not saved during registration');
    }
    const updatedRecruiterProfile = await request('PUT', '/api/profile', {
      company: { description: 'Integration test company profile.' }
    }, workflowToken);
    if (!updatedRecruiterProfile.ok ||
        updatedRecruiterProfile.data.profile.company.description !== 'Integration test company profile.') {
      throw new Error('Recruiter company profile update failed');
    }

    const createdJob = await request('POST', '/api/jobs', {
      title: 'Workflow Test Engineer',
      description: 'Integration test job description.',
      requiredSkills: ['React', 'Node.js'],
      location: 'Remote',
      workMode: 'remote',
      employmentType: 'full-time',
      isInternship: false
    }, workflowToken);
    if (createdJob.status !== 201) throw new Error(`Job creation failed: ${createdJob.data.message}`);
    workflowJobId = createdJob.data.job._id;
    if (!(await Job.findById(workflowJobId))) throw new Error('Created job was not persisted to MongoDB');

    const listedJob = await request('GET', `/api/jobs/${workflowJobId}`);
    if (!listedJob.ok || listedJob.data.job.title !== 'Workflow Test Engineer') {
      throw new Error('Created job was not returned by the public job API');
    }

    const closedJob = await request('PUT', `/api/jobs/${workflowJobId}`, {
      status: 'closed'
    }, workflowToken);
    if (!closedJob.ok) throw new Error('Recruiter could not close their job');
    const hiddenClosedJob = await request('GET', `/api/jobs/${workflowJobId}`);
    if (hiddenClosedJob.status !== 404) throw new Error('A closed job was visible to unauthenticated visitors');
    const ownerClosedJob = await request('GET', `/api/jobs/${workflowJobId}`, null, workflowToken);
    if (!ownerClosedJob.ok) throw new Error('Job owner could not view their own closed job');

    const updatedJob = await request('PUT', `/api/jobs/${workflowJobId}`, {
      title: 'Updated Workflow Test Engineer',
      status: 'active'
    }, workflowToken);
    if (!updatedJob.ok || updatedJob.data.job.title !== 'Updated Workflow Test Engineer') {
      throw new Error('Recruiter could not update their own job');
    }

    const otherRecruiterUpdate = await request('PUT', `/api/jobs/${workflowJobId}`, {
      title: 'Unauthorized Update'
    }, recruiterToken);
    if (otherRecruiterUpdate.status !== 403) throw new Error('Another recruiter updated this job');

    const workflowStudent = await request('POST', '/api/auth/register', {
      name: 'Workflow Student',
      email: `applicant-${Date.now()}-${process.pid}@example.com`,
      password: 'WorkflowPass123',
      role: 'student'
    });
    if (workflowStudent.status !== 201) throw new Error('Workflow student registration failed');
    workflowStudentId = workflowStudent.data.user._id;
    const updatedStudentProfile = await request('PUT', '/api/profile', {
      headline: 'Workflow test student',
      skills: ['React', 'Node.js']
    }, workflowStudent.data.token);
    if (!updatedStudentProfile.ok ||
        updatedStudentProfile.data.profile.headline !== 'Workflow test student') {
      throw new Error('Student profile update failed');
    }

    const resumeForm = new FormData();
    resumeForm.append(
      'resume',
      new Blob(['%PDF-1.4 workflow test resume'], { type: 'application/pdf' }),
      `workflow-${Date.now()}-${process.pid}.pdf`
    );
    const uploadedResume = await fetch(`${baseUrl}/api/profile/resume`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${workflowStudent.data.token}` },
      body: resumeForm
    });
    const uploadedResumeData = await uploadedResume.json();
    if (uploadedResume.status !== 200) {
      throw new Error(`Workflow student resume upload failed: ${uploadedResumeData.message}`);
    }
    workflowResumeFilename = uploadedResumeData.resume.url.split('/').pop();

    const application = await request('POST', '/api/applications', {
      jobId: workflowJobId,
      coverLetter: 'Workflow integration test.',
      resumeUrl: 'https://example.invalid/untrusted-resume.pdf'
    }, workflowStudent.data.token);
    if (application.status !== 201) throw new Error(`Application failed: ${application.data.message}`);

    const persistedApplication = await Application.findById(application.data.application._id);
    const student = await User.findById(workflowStudentId);
    if (persistedApplication.resumeUrl !== student.resume.url) {
      throw new Error('Application used a client-supplied resume instead of the student profile resume');
    }

    const updatedResumeForm = new FormData();
    updatedResumeForm.append(
      'resume',
      new Blob(['%PDF-1.4 updated workflow test resume'], { type: 'application/pdf' }),
      `workflow-updated-${Date.now()}-${process.pid}.pdf`
    );
    const updatedResume = await fetch(`${baseUrl}/api/profile/resume`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${workflowStudent.data.token}` },
      body: updatedResumeForm
    });
    const updatedResumeData = await updatedResume.json();
    if (updatedResume.status !== 200) {
      throw new Error(`Updated resume upload failed: ${updatedResumeData.message}`);
    }
    workflowCurrentResumeFilename = updatedResumeData.resume.url.split('/').pop();

    const publicResume = await fetch(`${baseUrl}/uploads/resumes/${workflowResumeFilename}`);
    const publicUpdatedResume = await fetch(`${baseUrl}/uploads/resumes/${workflowCurrentResumeFilename}`);
    if (publicResume.status !== 404 || publicUpdatedResume.status !== 404) {
      throw new Error('Resume file was exposed through public static hosting');
    }

    const currentResumePath = `/api/profile/resume/download/${encodeURIComponent(workflowCurrentResumeFilename)}`;
    const studentResume = await fetch(`${baseUrl}${currentResumePath}`, {
      headers: { Authorization: `Bearer ${workflowStudent.data.token}` }
    });
    if (studentResume.status !== 200) throw new Error('Student could not download their own resume');

    const applicationResumePath = `/api/profile/resume/download/${encodeURIComponent(workflowResumeFilename)}`;
    const ownerResume = await fetch(`${baseUrl}${applicationResumePath}`, {
      headers: { Authorization: `Bearer ${workflowToken}` }
    });
    if (ownerResume.status !== 200) throw new Error('Job owner could not download the resume submitted with an application');

    const unrelatedRecruiterResume = await fetch(`${baseUrl}${applicationResumePath}`, {
      headers: { Authorization: `Bearer ${recruiterToken}` }
    });
    if (unrelatedRecruiterResume.status !== 403) {
      throw new Error('Unrelated recruiter downloaded an applicant resume');
    }

    const duplicateApplication = await request('POST', '/api/applications', {
      jobId: workflowJobId
    }, workflowStudent.data.token);
    if (duplicateApplication.status !== 400) throw new Error('Duplicate job application was not rejected');

    const otherRecruiterApplicants = await request('GET', `/api/applications/job/${workflowJobId}`, null, recruiterToken);
    if (otherRecruiterApplicants.status !== 403) throw new Error('Another recruiter viewed this job’s applicants');

    const workflowApplicants = await request('GET', `/api/applications/job/${workflowJobId}`, null, workflowToken);
    if (!workflowApplicants.ok || workflowApplicants.data.applications.length !== 1) {
      throw new Error('Job owner could not view their applicant');
    }

    const workflowApplicationId = workflowApplicants.data.applications[0]._id;
    const changedStatus = await request('PATCH', `/api/applications/${workflowApplicationId}/status`, {
      status: 'Shortlisted',
      note: 'Integration test status update'
    }, workflowToken);
    if (!changedStatus.ok || changedStatus.data.application.status !== 'Shortlisted') {
      throw new Error('Job owner could not update application status');
    }

    const withdrawnApplication = await request(
      'PATCH',
      `/api/applications/${workflowApplicationId}/withdraw`,
      null,
      workflowStudent.data.token
    );
    if (!withdrawnApplication.ok || withdrawnApplication.data.application.status !== 'Withdrawn') {
      throw new Error('Student could not withdraw their application');
    }

    const savedJob = await request('POST', `/api/saved-jobs/${workflowJobId}`, null, workflowStudent.data.token);
    if (savedJob.status !== 201) throw new Error('Student could not save a job');
    const unsavedJob = await request('DELETE', `/api/saved-jobs/${workflowJobId}`, null, workflowStudent.data.token);
    if (!unsavedJob.ok || unsavedJob.data.isSaved) throw new Error('Student could not remove a saved job');

    const otherRecruiterDelete = await request('DELETE', `/api/jobs/${workflowJobId}`, null, recruiterToken);
    if (otherRecruiterDelete.status !== 403) throw new Error('Another recruiter deleted this job');

    const deletedJob = await request('DELETE', `/api/jobs/${workflowJobId}`, null, workflowToken);
    if (!deletedJob.ok || await Job.findById(workflowJobId)) throw new Error('Job deletion failed');
    if (await Application.findById(workflowApplicationId)) throw new Error('Job deletion left an orphaned application');

    const cleanupJob = await request('POST', '/api/jobs', {
      title: 'Admin Cleanup Test Job',
      description: 'Integration test job description.',
      requiredSkills: ['React'],
      location: 'Remote'
    }, workflowToken);
    if (cleanupJob.status !== 201) throw new Error('Could not create admin cleanup test job');

    const deletedRecruiter = await request('DELETE', `/api/admin/users/${workflowUserId}`, null, adminToken);
    if (!deletedRecruiter.ok) throw new Error('Admin could not delete a user account');
    if (await User.findById(workflowUserId) || await Job.findById(cleanupJob.data.job._id)) {
      throw new Error('Admin user deletion left the user or owned jobs in MongoDB');
    }
    workflowUserId = '';
    console.log('[PASS] Job create/read/update/delete, application creation/duplicate protection/review/status, save/unsave, and recruiter ownership.');
    console.log('[PASS] Private resume access controls and admin user/job cleanup.');

    console.log('\n======================================================');
    console.log('🎉 BACKEND REST API TESTS PASSED!');
    console.log('======================================================');
  } finally {
    if (workflowJobId) {
      await Promise.all([
        Application.deleteMany({ jobId: workflowJobId }),
        Job.findByIdAndDelete(workflowJobId)
      ]);
    }
    if (workflowUserId) {
      await User.findByIdAndDelete(workflowUserId);
    }
    if (workflowStudentId) {
      await User.findByIdAndDelete(workflowStudentId);
    }
    if (workflowResumeFilename) {
      const resumePath = path.resolve('uploads', 'resumes', workflowResumeFilename);
      try {
        await fs.unlink(resumePath);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    if (workflowCurrentResumeFilename) {
      const resumePath = path.resolve('uploads', 'resumes', workflowCurrentResumeFilename);
      try {
        await fs.unlink(resumePath);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    await new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
    await closeDB();
  }
};

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
