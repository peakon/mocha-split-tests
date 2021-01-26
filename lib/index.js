"use strict";

const { getTestFilesWithRuntimes } = require("./loader");

module.exports = {
  distributeByRuntime({ testStatsWithRuntimes, totalGroups }) {
    const filesWithMissingRuntimes = testStatsWithRuntimes.filter(
      file => file.runtime === 0
    );

    let propertyToCompare;
    if (filesWithMissingRuntimes.length / testStatsWithRuntimes.length > 0.1) {
      propertyToCompare = "size";
    } else {
      propertyToCompare = "runtime";
    }

    const sortedFilesWithStats = testStatsWithRuntimes.sort((a, b) => {
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
  },

  distribute({ testPatterns, runtimeLogsPattern, totalGroups }) {
    const testStatsWithRuntimes = getTestFilesWithRuntimes(
      testPatterns,
      runtimeLogsPattern
    );
    const buckets = module.exports.distributeByRuntime({
      testStatsWithRuntimes,
      totalGroups
    });
    return buckets;
  },

  getTestGroup({ testPatterns, runtimeLogsPattern, totalGroups, groupNumber }) {
    return module.exports.distribute({
      testPatterns,
      runtimeLogsPattern,
      totalGroups
    })[groupNumber];
  }
};
