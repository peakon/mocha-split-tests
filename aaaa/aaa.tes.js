'use strict';

async function sleep(ms) {
  await new Promise(resolve => setTimeout(() => resolve(), ms));
}

const hooks = require('./hooks');
hooks();

describe('mocha reporter', function() {
  hooks();
  it('runs for 100ms', async function() {
    await sleep(100);
  });
});

describe('mocha reporter2', function() {
  hooks();
  it('runs for 100ms', async function() {
    await sleep(100);
  });
});

describe('mocha reporter3', function() {
  hooks();
  it('runs for 100ms', async function() {
    await sleep(100);
  });
});
