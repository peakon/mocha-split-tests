"use strict";

const cli = require("../lib/cli");

describe("cli", function() {
  it("parses command line args and distributes tests into groups", async function() {
    process.argv.push(
      "-t",
      "3",
      "-g",
      "2",
      "-r",
      "test/data/fakeSpecs/runtime.log",
      "-f",
      "test/data/fakeSpecs/**/*.spec"
    );
    expect(await cli.run()).toMatchSnapshot();
  });
});
