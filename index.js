#!/usr/bin/env node

var program = require('commander');
var git = require('./lib/git');

program
  .version('1.0.0')

program
    .command('branch')
    .description('branch name & description')
    .option('-a, --all [all]', 'all branch')
    .option('-o, --open [open]', 'open ninja.json')
    .action(function(options) {
      git.branch(options)
    })

program.parse(process.argv)
