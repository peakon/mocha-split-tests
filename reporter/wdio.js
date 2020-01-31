"use strict";

const WDIOReporter = require("@wdio/reporter").default;
const path = require("path");

class RuntimeReporter extends WDIOReporter {
  onRunnerEnd(runnerStat) {
    const specFile = path.relative(process.cwd(), runnerStat.specs[0]);
    this.write(`${specFile}:${runnerStat.duration}\n`);
  }
}

module.exports = RuntimeReporter;
