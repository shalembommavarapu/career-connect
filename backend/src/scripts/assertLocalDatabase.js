export const assertLocalDatabase = () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Database seed and integration scripts cannot run in production.');
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerconnect';
  let hostname;

  try {
    hostname = new URL(uri).hostname;
  } catch {
    throw new Error('Database seed and integration scripts require a valid local MongoDB URI.');
  }

  if (!['localhost', '127.0.0.1', '[::1]', '::1'].includes(hostname)) {
    throw new Error('Database seed and integration scripts are restricted to local MongoDB instances.');
  }
};
