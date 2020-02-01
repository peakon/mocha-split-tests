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

  addKnownRuntimes(testFiles, runtimeStats) {
    return testFiles.map(function({ path, size }) {
      return { path, size, runtime: runtimeStats.get(path) };
    });
  },

  distributeByRuntime({ testFiles, runtimeStats, totalGroups }) {
    const filesWithStats = module.exports.addKnownRuntimes(
      testFiles,
      runtimeStats
    );

    const filesWithMissingRuntimes = filesWithStats.filter(function({
      runtime
    }) {
      return typeof runtime === "undefined";
    });

    let backlog;
    if (filesWithMissingRuntimes.length / filesWithStats.length > 0.1) {
      backlog = filesWithStats.map(function(f) {
        return [f.path, f.size];
      });
    } else {
      backlog = filesWithStats.map(function(f) {
        return [f.path, f.runtime || 0];
      });
    }

    const sortedFilesWithStats = backlog.sort((a, b) => b[1] - a[1]);

    function createBuckets(totalGroups) {
      const buckets = [];
      for (let i = 0; i < totalGroups; i++) {
        buckets.push({ size: 0, files: [] });
      }
      return buckets;
    }

    function nextBucket(buckets) {
      const minBucketSize = Math.min(...buckets.map(b => b.size));
      return buckets.find(bucket => bucket.size === minBucketSize);
    }

    const buckets = createBuckets(totalGroups);
    for (let i = 0; i < sortedFilesWithStats.length; i++) {
      const [file, size] = sortedFilesWithStats[i];
      const bucket = nextBucket(buckets);
      bucket.size += size;
      bucket.files.push(file);
    }
    return buckets;
  }
};
