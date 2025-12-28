const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  readManifest: () => ipcRenderer.invoke("read-manifest"),
  runTestGen: (agentCount) => ipcRenderer.invoke("run-test-gen", agentCount),
  onPythonOutput: (callback) => {
    ipcRenderer.on("python-output", (event, data) => callback(data));
  },
  watchMmapFile: (callback) => {
    ipcRenderer.on("mmap-update", (event, data) => callback(data));
  },
  startWatching: () => ipcRenderer.invoke("start-watching"),
  stopWatching: () => ipcRenderer.invoke("stop-watching")
});
window.addEventListener("DOMContentLoaded", () => {
  console.log("Electron preload script loaded");
});
