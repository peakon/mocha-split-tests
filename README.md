# @peakon/mocha-split-tests
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fpeakon%2Fmocha-split-tests.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fpeakon%2Fmocha-split-tests?ref=badge_shield)


A tool that helps optimizing overall test runtime for big test suites that can be distributed across multiple containers / VMs running in parallel.

This project includes:

- a command-line tool and NodeJS API to divide a list of spec files into even groups (files from each group should then be executed in a separate contrainer / VM on CI environment).
- test reporters for `mocha` and `webdriverio` that are used to record spec runtime stats.

# Usage

## Test runtime reporter

### Mocha test runner

As a first step, add `@peakon/mocha-split-tests/reporter/mocha` reporter to your mocha tests setup.

As mocha v7 still doesn't support multiple reporters out of the box. So in order to enable `@peakon/mocha-split-tests/reporter/mocha` reporter, you have to use a 3rd-party package like [mocha-multi](https://github.com/peakon/mocha-multi). Here is an example config:

```js
// mocha-multi-reporters.json
{
  dot: '-',
  xunit: {
    stdout: '/dev/null',
    options: {
      output: 'junit/junit.xml'
    }
  },
  '@peakon/mocha-split-tests/reporter/mocha': 'runtime.log'
}
```

`runtime.log` will be generated in project root directory after your run your tests like this:

```bash
multi=mocha-multi-reporters.json ./node_modules/.bin/mocha`
```

### WebdriverIO test runner

Add a runtime reporter to `wdio.conf.js`:

```js
reporters: [
  "spec",
  [
    require("@peakon/mocha-split-tests/reporter/wdio"),
    {
      outputDir: `${yourLogDir}/runtimes`
    }
  ]
];
```

As WebdriverIO default reporter bahaviour is to generate 1 log file per each capability, spec file pair, you'll end up having a bunch of log files inside `outputDir`. For convenience, you can merge them yourself into 1 file (e.g. `cat $LOG_DIR/*.log > runtime.log`) or keep them as is.

## CLI tool

CLI tool is used on CI environment to generate a list of specs that should be executed by a particular test container / VM.

```
Usage: mocha-split-tests [options]

Options:
  -V, --version                    output the version number
  -t, --total-groups <int>         Total number of test runner machines / containers
  -g, --group-number <int>         Number of group to get tests for (starts from 0)
  -r, --runtime-log <pattern>      Location of previously recorded test runtimes ( file or pattern for multiple log files)
  -f, --file-pattern <pattern>     e.g. "test/**/*.spec.js"
  -s, --result-separator <symbol>  Separator for resulting output (default: " ")
  -h, --help                       output usage information
```

Here is an example how to launch test on CircleCI:

```bash
export SPEC_FILES=$(npx mocha-split-tests -t $CIRCLE_NODE_TOTAL -g $CIRCLE_NODE_INDEX -r ./runtime.log -f 'test/**/*.spec.js')

./node_modules/.bin/mocha $SPEC_FILES
```

## Node API

```js
function getSpecs(totalGroups, groupNumber) {
  const { getTestGroup } = require("@peakon/mocha-split-tests");
  const testGroup = getTestGroup({
    testFilePattern: "./test/**/*.spec.js",
    runtimeLogsPattern: ".tmp/test/runtime*.log",
    totalGroups,
    groupNumber
  });
  return testGroup.files; //returns an Array of specs
}
```

## Releasing new version

```bash
npm version <major | minor | patch>
git push --tags
```

## License

MIT


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fpeakon%2Fmocha-split-tests.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fpeakon%2Fmocha-split-tests?ref=badge_large)