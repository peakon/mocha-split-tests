"use strict";

const fs = require("fs");
const glob = require("glob");

function attachRuntimesToFiles(testFiles, runtimeStats) {
  for (const info of testFiles) {
    info.runtime = runtimeStats.get(info.path) || 0;
  }

  return testFiles;
}

function getFileRuntimeStats(runtimeLogFileMask) {
  let runtimes = new Map();

  const runtimeLogFiles = glob.sync(runtimeLogFileMask);
  if (runtimeLogFiles.length === 0) {
    return runtimes;
  }

  for (let i = 0; i < runtimeLogFiles.length; i++) {
    const runtimeLog = runtimeLogFiles[i];
    const lines = fs.readFileSync(runtimeLog, "utf8").split("\n");
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      const [file, timeStr] = line.split(":");
      const time = parseInt(timeStr);
      if (Number.isInteger(time) && time >= 0) {
        const existingTime = runtimes.has(file) ? runtimes.get(file) : 0;
        runtimes.set(file, existingTime + time);
      }
    }
  }

  return runtimes;
}

function getTestFilesInfo(pattern) {
  const files = glob.sync(pattern);
  if (files.length === 0) {
    throw `No files matching a pattern: ${pattern}`;
  }
  return files.map(f => {
    return { path: f, size: fs.statSync(f).size };
  });
}

function getTestFilesWithRuntimes(testPattern, runtimeLogFileMask) {
  return attachRuntimesToFiles(
    getTestFilesInfo(testPattern),
    getFileRuntimeStats(runtimeLogFileMask)
  );
}

module.exports = {
  getTestFilesInfo,
  getFileRuntimeStats,
  attachRuntimesToFiles,
  getTestFilesWithRuntimes
};
