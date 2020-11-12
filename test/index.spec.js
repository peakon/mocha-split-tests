"use strict";

const { attachRuntimesToFiles, distributeByRuntime } = require("../lib/index");

describe("index", function() {
  describe("distributeByRuntime", function() {
    describe("when more than 90% of runtime stats are available", function() {
      it("distributes test based on runtime", function() {
        const testStatsWithRuntimes = [
          { path: "1", size: 1, runtime: 100 },
          { path: "2", size: 2, runtime: 200 },
          { path: "3", size: 3, runtime: 300 },
          { path: "4", size: 4, runtime: 400 },
          { path: "5", size: 5, runtime: 500 },
          { path: "6", size: 6, runtime: 600 },
          { path: "7", size: 7, runtime: 700 },
          { path: "8", size: 8, runtime: 800 },
          { path: "9", size: 9, runtime: 900 },
          { path: "10", size: 10, runtime: 0 }
        ];
        const result = distributeByRuntime({
          testStatsWithRuntimes,
          totalGroups: 4
        });
        expect(result).toMatchSnapshot();
      });
    });

    describe("when less than 90% of runtime stats are available", function() {
      it("distributes test files between buckets based on file size", function() {
        const testStatsWithRuntimes = [
          { path: "1", size: 1, runtime: 100 },
          { path: "2", size: 2, runtime: 200 },
          { path: "3", size: 3, runtime: 300 },
          { path: "4", size: 4, runtime: 400 },
          { path: "5", size: 5, runtime: 500 },
          { path: "6", size: 6, runtime: 600 },
          { path: "7", size: 7, runtime: 700 },
          { path: "8", size: 8, runtime: 800 },
          { path: "9", size: 9, runtime: 0 }
        ];
        const result = distributeByRuntime({
          testStatsWithRuntimes,
          totalGroups: 4
        });
        expect(result).toMatchSnapshot();
      });
    });
  });
});
