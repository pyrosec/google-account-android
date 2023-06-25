#!/usr/bin/env node
'use strict';

const { GoogleAccountAndroid } = require('../lib/google-account');
const yargs = require('yargs');
yargs.parserConfiguration({ 'parse-numbers': false });
const path = require('path');

process.chdir(path.join(__dirname, '..'));

(async () => {
  await GoogleAccountAndroid.createAccount(yargs.argv);
})().catch((err) => console.error(err));
