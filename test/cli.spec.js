"use strict";

const cli = require("../lib/cli");

describe("cli", function() {
  it("parses command line args and distributes tests into groups", function() {
    const argv = [
      "-t",
      "3",
      "-g",
      "2",
      "-r",
      "test/data/fakeSpecs/runtime.log",
      "-f",
      "test/data/fakeSpecs/**/*.spec"
    ];
    expect(cli.run(argv)).toMatchSnapshot();
  });

  it("parses multiple globs", function() {
    const argv = [
      "-t",
      "3",
      "-g",
      "2",
      "-r",
      "test/data/fakeSpecs/runtime.log",
      "-f",
      "test/data/fakeSpecs/*.spec",
      "test/data/fakeSpecs/specs/*.spec"
    ];
    expect(cli.run(argv)).toMatchSnapshot();
  });
});
