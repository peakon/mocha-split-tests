"use strict";

const { getTestGroup } = require("./index");

module.exports = {
  run(argv = process.argv.slice(2)) {
    function parseIntValue(value, _) {
      // parseInt takes a string and an optional radix
      return parseInt(value);
    }

    const program = require("commander");
    const version = require("../package.json").version;
    program
      .version(version)
      .requiredOption(
        "-t, --total-groups <int>",
        "Total number of test runner machines / containers",
        parseIntValue
      )
      .requiredOption(
        "-g, --group-number <int>",
        "Number of group to get tests for (starts from 0)",
        parseIntValue
      )
      .requiredOption(
        "-r, --runtime-log <pattern>",
        "Location of previously recorded test runtimes (file or pattern for multiple log files)"
      )
      .requiredOption(
        "-f, --file-pattern <patterns...>",
        'e.g. "test/**/*.spec.js"'
      )
      .option(
        "-s, --result-separator <symbol>",
        "Separator for resulting output",
        " "
      );

    const {
      filePattern,
      runtimeLog,
      totalGroups,
      groupNumber,
      resultSeparator
    } = program.parse(argv, { from: "user" }).opts();

    const testGroup = getTestGroup({
      testPatterns: filePattern,
      runtimeLogsPattern: runtimeLog,
      totalGroups,
      groupNumber
    });
    return testGroup.files.join(resultSeparator);
  }
};
