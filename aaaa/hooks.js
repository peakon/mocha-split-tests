'use strict';

async function sleep(ms) {
  await new Promise(resolve => setTimeout(() => resolve(), ms));
}

module.exports = function() {
  beforeEach(async function() {
    await sleep(600);
  });
  afterEach(async function() {
    await sleep(500);
  });
};
