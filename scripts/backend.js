#!/usr/bin/env node
// Cross-platform backend runner — used by npm run backend / app / admin
// Picks the correct .venv path for Mac/Linux vs Windows automatically.

const { spawn } = require('child_process');
const path = require('path');

const BACKEND = path.resolve(__dirname, '..', 'backend');
const IS_WIN  = process.platform === 'win32';

const PYTHON = path.join(
  BACKEND,
  '.venv',
  IS_WIN ? 'Scripts' : 'bin',
  IS_WIN ? 'python.exe' : 'python'
);

const proc = spawn(
  PYTHON,
  ['-m', 'uvicorn', 'app.main:app', '--reload', '--port', '8000'],
  { cwd: BACKEND, stdio: 'inherit', shell: false }
);

proc.on('error', (err) => {
  if (err.code === 'ENOENT') {
    console.error('\x1b[31m[api]\x1b[0m Python venv not found. Run: npm run setup');
  } else {
    console.error('\x1b[31m[api]\x1b[0m', err.message);
  }
  process.exit(1);
});

proc.on('exit', (code) => process.exit(code ?? 0));

// Forward Ctrl+C so both processes shut down cleanly
process.on('SIGINT', () => proc.kill('SIGINT'));
process.on('SIGTERM', () => proc.kill('SIGTERM'));
