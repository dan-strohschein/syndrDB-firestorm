import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MANIFEST_PATH = '/Users/danstrohschein/Documents/CodeProjects/AI/syndr-firestorm/results/firestorm_manifest.json';
const MMAP_PATH = '/Users/danstrohschein/Documents/CodeProjects/AI/syndr-firestorm/results/firestorm_mmap.log';
const PYTHON_SCRIPT = '/Users/danstrohschein/Documents/CodeProjects/AI/syndr-firestorm/run-firestorm.py';
const PYTHON_WORKING_DIR = '/Users/danstrohschein/Documents/CodeProjects/AI/syndr-firestorm';

let mainWindow = null;
let mmapWatcher = null;
let lastPosition = 0;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // In development, load from Vite dev server
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile('index.html');
  }

  // Open DevTools in development
  mainWindow.webContents.openDevTools();
}

// IPC Handler to read manifest
ipcMain.handle('read-manifest', async () => {
  try {
    if (fs.existsSync(MANIFEST_PATH)) {
      const data = fs.readFileSync(MANIFEST_PATH, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error reading manifest:', error);
    return null;
  }
});

// IPC Handler to run Python test generation
ipcMain.handle('run-test-gen', async (event, agentCount) => {
  return new Promise((resolve, reject) => {
    console.log(`Running Python test generation with ${agentCount} agents...`);
    
    const pythonProcess = spawn('python', [
      'run-firestorm.py',
      '--test-gen',
      `--agents=${agentCount}`
    ], {
      cwd: PYTHON_WORKING_DIR
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log('Python stdout:', output);
      
      // Send real-time output to renderer
      if (mainWindow) {
        mainWindow.webContents.send('python-output', output);
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      console.error('Python stderr:', output);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      console.log('Full stdout:', stdout);
      console.log('Full stderr:', stderr);
      
      // Check if output contains "SUCCESS"
      const success = stdout.includes('SUCCESS');
      
      if (code === 0 && success) {
        resolve({ success: true, output: stdout });
      } else {
        // Reject with proper error message
        const errorMsg = stderr || `Process failed with exit code ${code}`;
        console.error('Test generation failed:', errorMsg);
        reject(new Error(errorMsg));
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      reject(new Error(`Failed to start Python: ${error.message}`));
    });
  });
});

// IPC Handler to start watching mmap file
ipcMain.handle('start-watching', async () => {
  if (mmapWatcher) {
    return; // Already watching
  }

  // Initialize last position
  if (fs.existsSync(MMAP_PATH)) {
    const stats = fs.statSync(MMAP_PATH);
    lastPosition = stats.size;
  }

  // Watch for changes
  mmapWatcher = fs.watch(MMAP_PATH, (eventType) => {
    if (eventType === 'change') {
      readNewData();
    }
  });

  console.log('Started watching mmap file');
});

// IPC Handler to stop watching
ipcMain.handle('stop-watching', async () => {
  if (mmapWatcher) {
    mmapWatcher.close();
    mmapWatcher = null;
    console.log('Stopped watching mmap file');
  }
});

function readNewData() {
  try {
    if (!fs.existsSync(MMAP_PATH)) return;

    const stats = fs.statSync(MMAP_PATH);
    const currentSize = stats.size;

    if (currentSize > lastPosition) {
      const stream = fs.createReadStream(MMAP_PATH, {
        start: lastPosition,
        end: currentSize
      });

      let buffer = '';
      stream.on('data', (chunk) => {
        buffer += chunk.toString();
      });

      stream.on('end', () => {
        if (buffer.trim()) {
          // Split by newlines and send each line
          const lines = buffer.split('\n').filter(line => line.trim());
          lines.forEach(line => {
            try {
              const data = JSON.parse(line);
              mainWindow?.webContents.send('mmap-update', data);
            } catch (e) {
              // If not JSON, send as text
              mainWindow?.webContents.send('mmap-update', { raw: line });
            }
          });
        }
        lastPosition = currentSize;
      });
    }
  } catch (error) {
    console.error('Error reading mmap file:', error);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
