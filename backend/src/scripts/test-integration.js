import { spawn } from 'child_process';
import path from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';

const runScript = (script, env) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [path.join('src', 'scripts', script)], {
    cwd: process.cwd(),
    env,
    stdio: 'inherit'
  });

  child.once('error', reject);
  child.once('exit', (code, signal) => {
    if (code === 0) {
      resolve();
    } else {
      reject(new Error(`${script} exited with ${signal || `code ${code}`}`));
    }
  });
});

const runIntegrationSuite = async () => {
  const mongoServer = await MongoMemoryServer.create({
    instance: { dbName: 'careerconnect-integration-test' }
  });

  try {
    const env = {
      ...process.env,
      NODE_ENV: 'test',
      MONGODB_URI: mongoServer.getUri()
    };

    await runScript('seed.js', env);
    await runScript('test-auth.js', env);
    await runScript('test-api.js', env);
  } finally {
    await mongoServer.stop();
  }
};

runIntegrationSuite().catch((error) => {
  console.error('Isolated integration suite failed:', error.message);
  process.exitCode = 1;
});
