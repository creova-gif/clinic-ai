/**
 * Startup checks for backend/ussd-server.js.
 * Uses a local, credential-free URI. Never prints a connection string.
 */
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');

const serverPath = path.join(__dirname, 'ussd-server.js');
const LOCAL_URI = 'mongodb://127.0.0.1:27017/afyaai';

function missingServerDeps() {
  return ['express', 'body-parser', 'axios'].filter((name) => {
    try {
      require.resolve(name);
      return false;
    } catch {
      return true;
    }
  });
}

function spawnServer(env) {
  const child = spawn(process.execPath, [serverPath], {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });
  return {
    child,
    getOutput: () => output,
  };
}

function envWithoutMongo(extra = {}) {
  const env = { ...process.env };
  delete env.MONGODB_URI;
  return { ...env, ...extra };
}

test('refuses to start when MONGODB_URI is missing', async () => {
  const { child, getOutput } = spawnServer(envWithoutMongo());
  const code = await new Promise((resolve) => child.on('exit', resolve));
  const output = getOutput();
  assert.equal(code, 1);
  assert.match(output, /MONGODB_URI is not set/);
  assert.doesNotMatch(output, /mongodb(\+srv)?:\/\//);
});

test('refuses to start when MONGODB_URI is blank', async () => {
  const { child, getOutput } = spawnServer(envWithoutMongo({ MONGODB_URI: '   ' }));
  const code = await new Promise((resolve) => child.on('exit', resolve));
  assert.equal(code, 1);
  assert.match(getOutput(), /MONGODB_URI is not set/);
});

test('starts when MONGODB_URI is set and does not print it', { skip: missingServerDeps().length ? `missing ${missingServerDeps().join(', ')}` : false }, async () => {
  const { child, getOutput } = spawnServer(
    envWithoutMongo({ MONGODB_URI: LOCAL_URI, PORT: '0' })
  );
  const output = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('server did not report startup'));
    }, 5000);
    child.stdout.on('data', () => {
      const text = getOutput();
      if (text.includes('Running on port') && text.includes('MONGODB_URI')) {
        clearTimeout(timer);
        child.kill();
        resolve(text);
      }
    });
    child.on('exit', (code) => {
      clearTimeout(timer);
      if (code !== 0 && code !== null) {
        reject(new Error(`server exited early with code ${code}: ${getOutput()}`));
      }
    });
  });
  assert.match(output, /Connection string loaded from MONGODB_URI/);
  assert.equal(output.includes(LOCAL_URI), false);
  assert.doesNotMatch(output, /mongodb(\+srv)?:\/\//);
});
