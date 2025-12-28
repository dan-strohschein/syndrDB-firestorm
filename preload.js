// Preload script for Electron security
// This file runs in a sandboxed context with limited access to Node.js APIs

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  readManifest: () => ipcRenderer.invoke('read-manifest'),
  runTestGen: (agentCount) => ipcRenderer.invoke('run-test-gen', agentCount),
  onPythonOutput: (callback) => {
    ipcRenderer.on('python-output', (event, data) => callback(data));
  },
  watchMmapFile: (callback) => {
    ipcRenderer.on('mmap-update', (event, data) => callback(data));
  },
  startWatching: () => ipcRenderer.invoke('start-watching'),
  stopWatching: () => ipcRenderer.invoke('stop-watching')
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('Electron preload script loaded');
});
