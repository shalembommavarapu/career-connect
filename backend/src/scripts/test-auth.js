import dotenv from 'dotenv';
import http from 'http';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { connectDB, closeDB } from '../config/db.js';
import { getJwtSecret } from '../config/jwt.js';
import { assertLocalDatabase } from './assertLocalDatabase.js';

dotenv.config();

const app = (await import('../app.js')).default;
const testId = `${Date.now()}-${process.pid}`;
const studentEmail = `student-${testId}@example.com`;
const recruiterEmail = `recruiter-${testId}@example.com`;
const testEmails = [studentEmail, recruiterEmail];

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const runAuthTests = async () => {
  let server;
  let dbConnected = false;

  try {
    assertLocalDatabase();
    await connectDB();
    dbConnected = true;
    server = http.createServer(app);
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });

    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const request = async (method, path, body, token) => {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Origin: process.env.CLIENT_URL || 'http://localhost:5173'
        },
        ...(body ? { body: JSON.stringify(body) } : {})
      });
      return { status: response.status, data: await response.json(), headers: response.headers };
    };

    const health = await request('GET', '/api/health');
    assert(health.status === 200, 'API health endpoint did not return 200');
    const unauthenticatedProfile = await request('GET', '/api/auth/me');
    assert(unauthenticatedProfile.status === 401, 'Protected profile endpoint accepted an unauthenticated request');

    const registrations = [
      {
        email: studentEmail,
        name: 'Auth Test Student',
        password: 'StudentPass123',
        role: 'student'
      },
      {
        email: recruiterEmail,
        name: 'Auth Test Recruiter',
        password: 'RecruiterPass123',
        role: 'recruiter',
        companyName: 'Auth Test Company'
      }
    ];

    const tokens = {};
    for (const registration of registrations) {
      const created = await request('POST', '/api/auth/register', registration);
      assert(created.status === 201, `${registration.role} registration failed: ${created.data.message}`);
      assert(created.data.user.role === registration.role, `${registration.role} role was not preserved`);
      assert(!created.data.user.passwordHash, 'Registration response exposed a password hash');
      tokens[registration.role] = created.data.token;

      const savedUser = await User.findOne({ email: registration.email }).select('+passwordHash');
      assert(savedUser, `${registration.role} was not saved to MongoDB`);
      assert(savedUser.passwordHash !== registration.password, 'Password was stored in plain text');
      assert(await savedUser.matchPassword(registration.password), 'Stored password hash did not verify');

      const duplicate = await request('POST', '/api/auth/register', registration);
      assert(duplicate.status === 400, `${registration.role} duplicate email was not rejected`);

      const login = await request('POST', '/api/auth/login', {
        email: registration.email,
        password: registration.password
      });
      assert(login.status === 200, `${registration.role} login failed: ${login.data.message}`);
      assert(login.data.user.role === registration.role, `${registration.role} login returned the wrong role`);

      const me = await request('GET', '/api/auth/me', null, login.data.token);
      assert(me.status === 200, `${registration.role} JWT authentication failed`);
      assert(!me.data.user.passwordHash, 'Authenticated profile exposed a password hash');

      const badPassword = await request('POST', '/api/auth/login', {
        email: registration.email,
        password: 'incorrect-password'
      });
      assert(badPassword.status === 401, `${registration.role} incorrect password was not rejected`);
    }

    const invalid = await request('POST', '/api/auth/register', {
      name: '',
      email: 'not-an-email',
      password: 'short',
      role: 'student'
    });
    assert(invalid.status === 400, 'Invalid registration input was not rejected');

    const adminEscalation = await request('POST', '/api/auth/register', {
      name: 'Unauthorized Admin',
      email: `admin-${testId}@example.com`,
      password: 'AdminPass123',
      role: 'admin'
    });
    assert(adminEscalation.status === 403, 'Public registration allowed admin role escalation');

    const expiredToken = jwt.sign(
      { id: (await User.findOne({ email: studentEmail }))._id.toString() },
      getJwtSecret(),
      { expiresIn: -1 }
    );
    const expiredSession = await request('GET', '/api/auth/me', null, expiredToken);
    assert(expiredSession.status === 401, 'Expired JWT was not rejected');

    const forbiddenAdminAccess = await request('GET', '/api/admin/overview', null, tokens.student);
    assert(forbiddenAdminAccess.status === 403, 'Student accessed an admin-only endpoint');

    const corsOrigin = health.headers.get('access-control-allow-origin');
    assert(
      corsOrigin === (process.env.CLIENT_URL || 'http://localhost:5173'),
      'Configured frontend origin was not allowed by CORS'
    );

    const preflight = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'OPTIONS',
      headers: {
        Origin: process.env.CLIENT_URL || 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,authorization'
      }
    });
    assert(preflight.status === 204, 'CORS preflight did not return 204');
    assert(
      preflight.headers.get('access-control-allow-headers')?.toLowerCase().includes('authorization'),
      'CORS preflight did not allow the Authorization header'
    );

    console.log('Auth integration tests passed: registration, password hashing, duplicate rejection, login, JWT expiry, role checks, invalid input, and CORS.');
  } finally {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
      });
    }
    if (dbConnected) {
      await User.deleteMany({ email: { $in: testEmails } });
    }
    await closeDB();
  }
};

runAuthTests().catch((error) => {
  console.error('Auth integration tests failed:', error);
  process.exitCode = 1;
});
