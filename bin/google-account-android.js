'use strict';

const { GoogleAccountAndroid } = require('../lib/google-account');
const yargs = require('yargs');

(async () => {
  await GoogleAccountAndroid.createAccount(yargs.argv);
})().catch((err) => console.error(err));
