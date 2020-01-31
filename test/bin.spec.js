"use strict";

const util = require("util");
const exec = util.promisify(require("child_process").exec);

describe("bin/mocha-split-tests script", function() {
  it("can accepts path to runtime.log file", async function() {
    const { stdout, stderr } = await exec(
      `./bin/mocha-split-tests -t 3 -g 2 -r test/data/fakeSpecs/runtime.log -f 'test/data/fakeSpecs/**/*.spec' -s ';'`
    );
    expect(stdout).toMatchSnapshot();
  });

  it("can accepts glob pattern for multiple runtime logs", async function() {
    const { stdout, stderr } = await exec(
      `./bin/mocha-split-tests -t 3 -g 0 -r 'test/data/fakeSpecs/*.log' -f 'test/data/fakeSpecs/**/*.spec' -s ';'`
    );
    expect(stdout).toMatchSnapshot();
  });
});
