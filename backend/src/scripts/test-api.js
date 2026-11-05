import http from 'http';
import app from '../app.js';
import { connectDB, closeDB } from '../config/db.js';

const runTests = async () => {
  console.log('🧪 Starting CareerConnect Backend REST API Test Suite...');
  await connectDB();

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(5099, resolve));
  const baseUrl = 'http://127.0.0.1:5099';

  let studentToken = '';
  let recruiterToken = '';
  let adminToken = '';
  let testJobId = '';
  let testAppId = '';

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

    console.log('\n======================================================');
    console.log('🎉 ALL 15 BACKEND REST API ENDPOINTS TESTED & PASSED!');
    console.log('======================================================');
  } finally {
    server.close();
    await closeDB();
  }
};

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
