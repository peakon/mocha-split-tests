const {
  getTestFilesInfo,
  getFileRuntimeStats,
  attachRuntimesToFiles
} = require("../lib/loader");

describe("loader", function() {
  describe("getTestFilesInfo", function() {
    it("should throw on missings patterns", function() {
      const patterns = null;
      expect(() => getTestFilesInfo(patterns)).toThrow(
        "Invalid patterns supplied."
      );
    });

    it("should throw on invalid patterns", function() {
      const patterns = [];
      expect(() => getTestFilesInfo(patterns)).toThrow(
        "Invalid patterns supplied."
      );
    });

    it("should throw when no files are found", function() {
      const patterns = ["**/doesnotexist/*.js"];
      expect(() => getTestFilesInfo(patterns)).toThrow(
        `No files matched patterns: ${patterns[0]}`
      );
    });

    it("should return files when pattern is correct", function() {
      expect(getTestFilesInfo(["test/data/**/*.spec"])).toMatchSnapshot();
    });
  });

  describe("getFileRuntimeStats", function() {
    describe("when runtime.log contains malformed rows", function() {
      it("loads only well-formed rows from file", function() {
        const stats = getFileRuntimeStats("./test/data/runtimes2.log");
        expect(stats.size).toEqual(3);
        expect(stats).toMatchSnapshot();
      });
    });

    describe("when runtime.log has no malformed rows", function() {
      it("loads all stats from a well-formed file", function() {
        const stats = getFileRuntimeStats("./test/data/runtimes1.log");
        expect(stats.size).toEqual(11);
        expect(stats).toMatchSnapshot();
      });
    });

    describe("when runtime.log does not exist", function() {
      it("should not fail with error", function() {
        const stats = getFileRuntimeStats("/invalid/path/to/runtime.log");
        expect(stats.size).toEqual(0);
      });
    });
  });

  describe("attachRuntimesToFiles", function() {
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
      expect(attachRuntimesToFiles(testFiles, runtimeStats)).toEqual([
        { path: "test/1.spec.js", size: 1, runtime: 100 },
        { path: "test/2.spec.js", size: 2, runtime: 200 },
        { path: "test/3.spec.js", size: 3, runtime: 0 }
      ]);
    });
  });
});
