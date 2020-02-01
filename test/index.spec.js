"use strict";

const {
  listFiles,
  loadRuntimeStats,
  addKnownRuntimes,
  distributeByRuntime
} = require("../lib/index");

describe("index", function() {
  describe("listFiles", function() {
    it("should fail when no files are found", function() {
      const pattern = "**/doesnotexist/*.js";
      expect(() => listFiles(pattern)).toThrow(
        `No files matching a pattern: ${pattern}`
      );
    });

    it("should return files when pattern is correct", function() {
      expect(listFiles("test/data/**/*.spec")).toMatchSnapshot();
    });
  });

  describe("loadRuntimeStats", function() {
    describe("when runtime.log contains malformed rows", function() {
      it("loads only well-formed rows from file", function() {
        const stats = loadRuntimeStats("./test/data/runtimes2.log");
        expect(stats.size).toEqual(3);
        expect(stats).toMatchSnapshot();
      });
    });

    describe("when runtime.log has no malformed rows", function() {
      it("loads all stats from a well-formed file", function() {
        const stats = loadRuntimeStats("./test/data/runtimes1.log");
        expect(stats.size).toEqual(11);
        expect(stats).toMatchSnapshot();
      });
    });

    describe("when runtime.log does not exist", function() {
      it("should not fail with error", function() {
        const stats = loadRuntimeStats("/invalid/path/to/runtime.log");
        expect(stats.size).toEqual(0);
      });
    });
  });

  describe("addKnownRuntimes", function() {
    it("adds runtime stats to test backlog", function() {
      const testFiles = [
        { path: "test/1.spec.js", size: 1 },
        { path: "test/2.spec.js", size: 2 },
        { path: "test/3.spec.js", size: 3 }
      ];
      const runtimeStats = new Map()
        .set("test/1.spec.js", 100)
        .set("test/2.spec.js", 200)
        .set("test/4.spec.js", 400);
      expect(addKnownRuntimes(testFiles, runtimeStats)).toEqual([
        { path: "test/1.spec.js", size: 1, runtime: 100 },
        { path: "test/2.spec.js", size: 2, runtime: 200 },
        { path: "test/3.spec.js", size: 3, runtime: undefined }
      ]);
    });
  });

  describe("distributeByRuntime", function() {
    describe("when more than 90% of runtime stats are available", function() {
      it("distributes test based on runtime", function() {
        const runtimeStats = new Map()
          .set("1", 100)
          .set("2", 200)
          .set("3", 300)
          .set("4", 400)
          .set("5", 500)
          .set("6", 600)
          .set("7", 700)
          .set("8", 800)
          .set("9", 900)
          .set("10", 1000);
        const testFiles = [
          { path: "1", size: 1 },
          { path: "2", size: 2 },
          { path: "3", size: 3 },
          { path: "4", size: 4 },
          { path: "5", size: 5 },
          { path: "6", size: 6 },
          { path: "7", size: 7 },
          { path: "8", size: 8 },
          { path: "9", size: 9 },
          { path: "10", size: 10 },
          { path: "11", size: 11 }
        ];
        const result = distributeByRuntime({
          testFiles,
          runtimeStats,
          totalGroups: 4
        });
        expect(result).toMatchSnapshot();
      });
    });

    describe("when less than 90% of runtime stats are available", function() {
      it("distributes test files between buckets based on file size", function() {
        const runtimeStats = new Map()
          .set("1", 100)
          .set("2", 200)
          .set("3", 300)
          .set("4", 400)
          .set("5", 500)
          .set("6", 600)
          .set("7", 700)
          .set("8", 800);
        const testFiles = [
          { path: "1", size: 1 },
          { path: "2", size: 2 },
          { path: "3", size: 3 },
          { path: "4", size: 4 },
          { path: "5", size: 5 },
          { path: "6", size: 6 },
          { path: "7", size: 7 },
          { path: "8", size: 8 },
          { path: "9", size: 9 }
        ];
        const result = distributeByRuntime({
          testFiles,
          runtimeStats,
          totalGroups: 4
        });
        expect(result).toMatchSnapshot();
      });
    });
  });
});
