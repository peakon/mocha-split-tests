"use strict";

const path = require("path");
const Mocha = require("mocha");
const {
  EVENT_RUN_END,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END
} = Mocha.Runner.constants;

class RuntimeReporter {
  constructor(runner) {
    this._runner = runner;
    this.runtimeStats = {};
    this.suiteStartedAt = undefined;

    runner
      .on(EVENT_SUITE_BEGIN, () => {
        if (this.currentSuite.parent && this.currentSuite.parent.root) {
          this.suiteStartedAt = Date.now();
        }
      })
      .on(EVENT_SUITE_END, () => {
        if (this.currentSuite.parent && this.currentSuite.parent.root) {
          const relativePath = path.relative(
            process.cwd(),
            this.currentSuite.file
          );
          const durationMs = Date.now() - this.suiteStartedAt;
          this.runtimeStats[relativePath] =
            (this.runtimeStats[relativePath] || 0) + durationMs;
        }
      })
      .once(EVENT_RUN_END, () => {
        const reportData = Object.keys(this.runtimeStats)
          .map(k => `${k}:${this.runtimeStats[k]}\n`)
          .join("");
        console.log(reportData); // eslint-disable-line no-console
      });
  }

  get currentSuite() {
    return this._runner.suite;
  }
}

module.exports = RuntimeReporter;
