#!/usr/bin/env node

const yargs = require('yargs');
const chalk = require('chalk');
const { getCompleteTable } = require('../lib/corona');
const { getCountryTable } = require('../lib/byCountry');
const { lookupCountry } = require('../lib/helpers');

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
    }
  })
  .strict()
  .help('help');

const { emojis, country, minimal, top } = argv;
(
  country === 'ALL'
    ? getCompleteTable({ emojis, minimal, top })
    : getCountryTable({ countryCode: country, emojis, minimal })
)
  .then(console.log)
  .catch(console.error);
