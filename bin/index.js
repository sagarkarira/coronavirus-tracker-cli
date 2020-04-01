#!/usr/bin/env node

require('yargonaut').style('green');
const yargs = require('yargs');
const chalk = require('chalk');
const { getCompleteTable, getGraph } = require('../lib/corona');
const { getCountryTable } = require('../lib/byCountry');
const { getWorldoMetersTable } = require('../lib/worldoMeters');
const { lookupCountry } = require('../lib/helpers');
const { getUsaStats } = require('../lib/country/us');

const { argv } = yargs
  .command('$0 [country]', 'Tool to track COVID-19 statistics from terminal', yargs =>
    yargs.positional('country', {
      coerce(arg) {
        if (arg.toUpperCase() === 'ALL') {
          return 'ALL';
        }

        const country = lookupCountry(arg);
        if (!country) {
          let error = `Country '${arg}' not found.\n`;
          error += 'Try full country name or country code.\n';
          error += 'Ex:\n';
          error += '- UK: for United Kingdom \n';
          error += '- US: for United States of America.\n';
          error += '- Italy: for Italy.\n';
          throw new Error(chalk.red.bold(error));
        }

        return country.iso2;
      },
      describe: 'Filter table by country',
      default: 'all',
      type: 'string'
    })
  )
  .options({
    s: {
      alias: 'source',
      describe: 'fetch data from other source',
      default: 2,
      type: 'int'
    },
    e: {
      alias: 'emojis',
      describe: 'Show emojis in table',
      default: false,
      type: 'boolean'
    },
    c: {
      alias: 'color',
      describe: 'Show colors formatted output',
      type: 'boolean'
    },
    m: {
      alias: 'minimal',
      describe: 'Remove borders & padding from table',
      type: 'boolean',
      default: false,
    },
    t: {
      alias: 'top',
      describe: 'Filter table by rank',
      type: 'int'
    },
    g: {
      alias: 'graph',
      describe: 'Get graph',
      type: 'boolean',
      default: false,
    },
    st: {
      alias: 'states',
      describe: 'Get state level data of country ',
      type: 'string',
    }
  })
  .strict()
  .help('help');

argv.countryCode = argv.country;
if (argv.states) {
  const country = lookupCountry(argv.states);
  if (!country) {
    let error = `Country '${argv.states}' not found.\n`;
    error += 'Try full country name or country code.\n';
    error += 'Ex:\n';
    error += '- UK: for United Kingdom \n';
    error += '- US: for United States of America.\n';
    error += '- Italy: for Italy.\n';
    throw new Error(chalk.red.bold(error));
  }
  argv.countryCode = country.iso2;
  if (argv.countryCode === 'US') {
    getUsaStats(argv).then(result => {
      console.log(result);
      process.exit(1);
    }).catch(error => {
      console.error(error);
      process.exit(0);
    });
  }
}

if (argv.source === 1) {
  (
    argv.country === 'ALL'
      ? getCompleteTable(argv)
      : getCountryTable(argv)
  ).then(console.log).catch(console.error);
}
else if (argv.graph === true) {
  getGraph(argv).then(console.log).catch(console.error);
} else {
  getWorldoMetersTable(argv).then(console.log).catch(console.error);
}
