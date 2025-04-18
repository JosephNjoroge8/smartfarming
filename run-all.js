import { spawn } from 'child_process';
import readline from 'readline';

console.log('\x1b[36m%s\x1b[0m', '🌱 Starting SmaFarm Development Environment...');

// Function to create a formatted timestamp
const timestamp = () => {
    const now = new Date();
    return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
};

// Start Laravel server
console.log('\x1b[32m%s\x1b[0m', `${timestamp()} Laravel server starting...`);
const laravelServer = spawn('php', ['artisan', 'serve'], { shell: true });

laravelServer.stdout.on('data', (data) => {
    console.log('\x1b[32m%s\x1b[0m', `${timestamp()} [Laravel] ${data.toString().trim()}`);
});

laravelServer.stderr.on('data', (data) => {
    console.error('\x1b[31m%s\x1b[0m', `${timestamp()} [Laravel ERROR] ${data.toString().trim()}`);
});

// Start Vite development server
console.log('\x1b[36m%s\x1b[0m', `${timestamp()} Vite server starting...`);

// Use the appropriate npm command based on OS
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const viteServer = spawn(npmCmd, ['run', 'dev'], { shell: true });

viteServer.stdout.on('data', (data) => {
    console.log('\x1b[36m%s\x1b[0m', `${timestamp()} [Vite] ${data.toString().trim()}`);
});

viteServer.stderr.on('data', (data) => {
    console.error('\x1b[35m%s\x1b[0m', `${timestamp()} [Vite ERROR] ${data.toString().trim()}`);
});

// Handle process exit
process.on('SIGINT', () => {
    console.log('\n\x1b[33m%s\x1b[0m', `${timestamp()} Shutting down development servers...`);
    laravelServer.kill('SIGINT');
    viteServer.kill('SIGINT');
    process.exit(0);
});

console.log('\x1b[33m%s\x1b[0m', `${timestamp()} Press Ctrl+C to stop all servers`);

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    if (input.toLowerCase() === 'clear') {
        console.clear();
        console.log('\x1b[36m%s\x1b[0m', '🌱 SmaFarm Development Environment Running');
        console.log('\x1b[33m%s\x1b[0m', `${timestamp()} Press Ctrl+C to stop all servers`);
    }
});