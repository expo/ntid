#!/usr/bin/env node

import optimist from 'optimist';
import process from 'process';

import { makeId } from './ntid';

const parser = optimist.usage('Usage: $0 <type>');
const { argv } = parser;

if (argv._.length === 0) {
  parser.showHelp();
  process.exit(1);
}
if (argv._.length > 1) {
  console.error('You must specify only one type for an NTID');
  process.exit(1);
}

const type = argv._[0];
if (!/^[a-z\d]+$/i.test(type)) {
  console.error('The NTID type can contain only letters and numbers');
  process.exit(1);
}

console.log(makeId(type));
