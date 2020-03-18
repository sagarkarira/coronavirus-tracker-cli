#!/usr/bin/env node

const { getCompleteTable } = require('../lib/corona');
const { getCountryTable } = require('../lib/byCountry');
const { lookupCountry } = require('../lib/helpers');

const {argv} = require('yargs')
  .command('$0 [country]', 'show COVID-19 statistics for the world or the given country', yargs =>
    yargs.positional('country', {
      coerce(arg) {
      console.log(arg);
        if('ALL' === arg.toUpperCase()) {
          return 'ALL';
        }

        const country = lookupCountry(arg);

        if(!country) {
          throw new Error(`Country '${arg}' not found.
            Try full country name or country code.
            Ex:
            - UK: for United Kingdom
            - US: for United States of America.
          - India: for India.`);
        }

        return country.iso2;
      },
      describe: 'which country to show statistics for',
      default: 'all',
      type: 'string'
    })
  )
  .options({
    e: {
      alias: 'emojis',
      describe: 'enable the use of emojis in the table (may break alignment in some terminals)',
      default: false,
      type: 'boolean'
    },
    c: {
      alias: 'color',
      describe: 'enable the use of color in the table.',
      type: 'boolean'
    }
  })
  .strict()
  .help('help');

(country === 'all' ? getCompleteTable(argv) : getCountryTable(country, argv))
  .then(console.log)
  .catch(console.error);