import { spawnSync } from 'child_process';
import os from 'os';

const args = process.argv.slice(2);

switch (os.platform()) {
case 'win32':
  spawnSync('python', ['-m', 'venv', 'venv'], { stdio: 'inherit' });
  spawnSync('venv\\Scripts\\python', ['-m', 'pip', 'install', '-r', ...args], { stdio: 'inherit' });
  break;
case 'linux':
  spawnSync('sudo', ['apt', 'install', '-y', 'python3.9-venv'], { stdio: 'inherit' });
  spawnSync('python3.9', ['-m', 'venv', 'venv'], { stdio: 'inherit' });
  spawnSync('venv/bin/python', ['-m', 'pip', 'install', '-r', ...args], { stdio: 'inherit' });
  break;
}