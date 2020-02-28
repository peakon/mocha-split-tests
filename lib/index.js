"use strict";

const fs = require("fs");
const glob = require("glob");
const readline = require("readline");

module.exports = {
  loadRuntimeStats(runtimeLogFileMask) {
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
  },

  listFiles(pattern) {
    const files = glob.sync(pattern);
    if (files.length === 0) {
      throw `No files matching a pattern: ${pattern}`;
    }
    return files.map(f => {
      return { path: f, size: fs.statSync(f).size };
    });
  },

  attachRuntimesToFiles(testFiles, runtimeStats) {
    for (const info of testFiles) {
      info.runtime = runtimeStats.get(info.path) || 0;
    }

    return testFiles;
  },

  distributeByRuntime({ testFiles, runtimeStats, totalGroups }) {
    const filesWithStats = module.exports.attachRuntimesToFiles(
      testFiles,
      runtimeStats
    );

    const filesWithMissingRuntimes = filesWithStats.filter(
      file => file.runtime === 0
    );

    let propertyToCompare;
    if (filesWithMissingRuntimes.length / filesWithStats.length > 0.1) {
      propertyToCompare = "size";
    } else {
      propertyToCompare = "runtime";
    }

    const sortedFilesWithStats = filesWithStats.sort((a, b) => {
      return b[propertyToCompare] - a[propertyToCompare];
    });

    function createBuckets(totalGroups) {
      const buckets = [];
      for (let i = 0; i < totalGroups; i++) {
        buckets.push({ size: 0, runtime: 0, files: [] });
      }
      return buckets;
    }

    function nextBucketBy(property, buckets) {
      const mininumPropertyValue = Math.min(...buckets.map(b => b[property]));
      return buckets.find(bucket => bucket[property] === mininumPropertyValue);
    }

    const buckets = createBuckets(totalGroups);
    for (let i = 0; i < sortedFilesWithStats.length; i++) {
      const bucket = nextBucketBy(propertyToCompare, buckets);
      const { path, size, runtime } = sortedFilesWithStats[i];
      bucket.size += size;
      bucket.runtime += runtime;
      bucket.files.push(path);
    }
    return buckets;
  }
};
