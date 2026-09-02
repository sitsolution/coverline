#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Coverline — cross-platform setup script (Mac · Windows · Linux)
//
// Uses `uv` to manage Python versions automatically — no need to have any
// specific Python version installed manually.
//
// Run from repo root:  npm run setup
// ─────────────────────────────────────────────────────────────────────────────

const { spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

// ── Paths ─────────────────────────────────────────────────────────────────────
const ROOT    = path.resolve(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const IS_WIN  = process.platform === 'win32';

// Python version uv will download/use for the backend venv
const PYTHON_VERSION = '3.12';

const VENV_DIR    = path.join(BACKEND, '.venv');
const VENV_PYTHON = path.join(VENV_DIR, IS_WIN ? 'Scripts\\python.exe' : 'bin/python');
const VENV_ALEMBIC= path.join(VENV_DIR, IS_WIN ? 'Scripts\\alembic.exe': 'bin/alembic');

// ── Helpers ───────────────────────────────────────────────────────────────────
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const RESET  = '\x1b[0m';

const info  = (msg) => console.log(`${GREEN}[setup]${RESET} ${msg}`);
const warn  = (msg) => console.log(`${YELLOW}[setup]${RESET} ${msg}`);
const error = (msg) => { console.error(`${RED}[setup]${RESET} ${msg}`); process.exit(1); };

function run(cmd, opts = {}) {
  const result = spawnSync(cmd, { shell: true, stdio: 'inherit', cwd: ROOT, ...opts });
  if (result.status !== 0) error(`Command failed: ${cmd}`);
}

function runQuiet(cmd, opts = {}) {
  return spawnSync(cmd, { shell: true, stdio: 'pipe', cwd: ROOT, ...opts });
}

// ── 0. Check Node ─────────────────────────────────────────────────────────────
info('Checking required tools...');

const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
if (nodeMajor < 18) error(`Node.js 18+ required. Found: v${process.versions.node}`);
info(`  Node v${process.versions.node}  ✓`);

const npmCheck = runQuiet('npm -v');
if (npmCheck.status !== 0) error('npm not found.');
info(`  npm ${npmCheck.stdout.toString().trim()}  ✓`);

// ── 1. Install / locate uv ────────────────────────────────────────────────────
// uv is a fast Python package + version manager. It downloads Python
// automatically so the user doesn't need the right version installed.
// https://docs.astral.sh/uv/

function findUvBinary() {
  // Common locations uv installs itself to
  const home = os.homedir();
  const candidates = IS_WIN
    ? [
        path.join(home, '.local', 'bin', 'uv.exe'),
        path.join(home, '.cargo', 'bin', 'uv.exe'),
        path.join(process.env.USERPROFILE || home, '.local', 'bin', 'uv.exe'),
      ]
    : [
        path.join(home, '.local', 'bin', 'uv'),
        path.join(home, '.cargo', 'bin', 'uv'),
        '/usr/local/bin/uv',
      ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return `"${p}"`;
  }
  return null;
}

function getUv() {
  // Already in PATH?
  const inPath = runQuiet('uv --version');
  if (inPath.status === 0) {
    info(`  uv ${inPath.stdout.toString().trim()}  ✓`);
    return 'uv';
  }

  // Already installed but not in PATH?
  const found = findUvBinary();
  if (found) {
    const ver = runQuiet(`${found} --version`);
    info(`  uv ${ver.stdout.toString().trim()}  ✓`);
    return found;
  }

  // Install uv
  info('  Installing uv (Python version manager)...');
  if (IS_WIN) {
    // Use PowerShell to install on Windows
    run('powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"');
  } else {
    run('curl -LsSf https://astral.sh/uv/install.sh | sh');
  }

  // Find it after install
  const afterInstall = findUvBinary();
  if (afterInstall) {
    info('  uv installed  ✓');
    return afterInstall;
  }

  // Last resort: try PATH again (some systems update PATH immediately)
  const retry = runQuiet('uv --version');
  if (retry.status === 0) return 'uv';

  error(
    'uv was installed but could not be found.\n' +
    '  Please close this terminal, open a new one, and run: npm run setup'
  );
}

const UV = getUv();

// ── 2. Node dependencies (mobile + admin via npm workspaces) ──────────────────
info('');
info('Installing Node dependencies (mobile + admin)...');
run('npm install');
info('Node dependencies installed  ✓');

// ── 3. Python venv via uv ─────────────────────────────────────────────────────
// uv automatically downloads Python 3.12 if it is not installed on the system.
info('');
info(`Setting up Python ${PYTHON_VERSION} virtual environment via uv...`);

const venvBroken = fs.existsSync(VENV_DIR) && !fs.existsSync(VENV_PYTHON);
if (venvBroken) {
  warn('Existing .venv is incomplete — recreating...');
  fs.rmSync(VENV_DIR, { recursive: true, force: true });
}

if (!fs.existsSync(VENV_DIR)) {
  // --python tells uv which version to use; uv downloads it automatically
  run(`${UV} venv .venv --python ${PYTHON_VERSION}`, { cwd: BACKEND });
  info(`Python ${PYTHON_VERSION} environment created  ✓`);
} else {
  info('Virtual environment already exists  ✓');
}

info('Installing Python dependencies...');
// uv pip is dramatically faster than plain pip and resolves compatible wheels
run(`${UV} pip install -r requirements.txt --python "${VENV_PYTHON}"`, { cwd: BACKEND });
info('Python dependencies installed  ✓');

// ── 4. Backend .env ───────────────────────────────────────────────────────────
info('');
const envFile    = path.join(BACKEND, '.env');
const envExample = path.join(BACKEND, '.env.example');

if (!fs.existsSync(envFile)) {
  if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envFile);
    warn('Created backend/.env from .env.example');
    warn('⚠  Open backend/.env and update DATABASE_URL and SECRET_KEY before running!');
  }
} else {
  info('backend/.env already exists, skipping.');
}

// ── 5. DB migrations ──────────────────────────────────────────────────────────
info('');
const envContent = fs.existsSync(envFile) ? fs.readFileSync(envFile, 'utf8') : '';

if (envContent.includes('your-secret-key-here') || envContent.includes('password@localhost')) {
  warn('Skipping DB migrations — backend/.env still has placeholder values.');
  warn('Run this after configuring .env:');
  warn(`  cd backend && ${IS_WIN ? '.venv\\Scripts\\alembic' : '.venv/bin/alembic'} upgrade head`);
} else {
  info('Running database migrations...');
  run(`"${VENV_ALEMBIC}" upgrade head`, { cwd: BACKEND });
  info('Database migrations applied  ✓');
}

// ── Done ──────────────────────────────────────────────────────────────────────
console.log('');
console.log(`${GREEN}────────────────────────────────────────────${RESET}`);
console.log(`${GREEN}  Setup complete!${RESET}`);
console.log(`${GREEN}────────────────────────────────────────────${RESET}`);
console.log('');
console.log('  Run mobile app + backend:   npm run app');
console.log('  Run admin panel + backend:  npm run admin');
console.log('  Run backend only:           npm run backend');
console.log('');
console.log('  API docs:     http://localhost:8000/docs');
console.log('  Admin panel:  http://localhost:5173');
console.log('');
