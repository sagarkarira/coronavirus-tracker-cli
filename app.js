const express = require('express');
const app = express();
const lookup = require('country-code-lookup');
const morgan = require('morgan');
const stripAnsi = require('strip-ansi');

const port = process.env.PORT || 3001;

const { getCountryTable, getJSONData, getJSONDataForCountry } = require('./lib/byCountry');
const { getCompleteTable } = require('./lib/corona');
const { lookupCountry } = require('./lib/helpers');


function errorHandler(error, res) {
  console.error(error);
  return res.send(`
    I am sorry. Something went wrong. Please report it \n
    ${error.message}
  `);
}

app.use(morgan(':remote-addr :remote-user :method :url :status :res[content-length] - :response-time ms'));
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});


+app.get('/updates', (req, res) => {
  const format = req.query.format ? req.query.format : '';
  if (format.toLowerCase() === 'json') {
    return getLiveUpdates(true).then(result => {
      return res.json(result);
    }).catch(error => errorHandler(error, res));
  }
  return getLiveUpdates(false).then(result => {
    return res.send(result);
  }).catch(error => errorHandler(error, res));
});

app.get('/', (req, res) => {
  const isCurl = req.headers['user-agent'].match(/\bcurl\b/gmi) !== null;
  const format = req.query.format ? req.query.format : '';
  const minimal = req.query.minimal === 'true' ? true : false;
  const emojis = req.query.emojis === 'true' ? true : false;

  if (format.toLowerCase() === 'json') {
    return getJSONData().then(result => {
      return res.json(result);
    }).catch(error => errorHandler(error, res));
  }

  return getCompleteTable({ isCurl, emojis, minimal })
    .then(result => {
      return res.send(result);
    }).catch(error => errorHandler(error, res));
});

app.get('/:country', (req, res) => {
  const { country } = req.params;
  const isCurl = req.headers['user-agent'].match(/\bcurl\b/gmi) !== null;
  const format = req.query.format ? req.query.format : '';
  const minimal = req.query.minimal === 'true' ? true : false;
  const emojis = req.query.emojis === 'true' ? true : false;
  if (!country || 'ALL' === country.toUpperCase()) {
    if (format.toLowerCase() === 'json') {
      return getJSONData().then(result => {
        return res.json(result);
      }).catch(error => errorHandler(error, res));
    }

    return getCompleteTable({ isCurl, emojis, minimal })
      .then(result => {
        return res.send(result);
      }).catch(error => errorHandler(error, res));
  }

  let lookupObj = lookupCountry(country);

  if (!lookupObj) {
    return res.send(`
    Country not found.
    Try full country name or country code.
    Ex:
      - /UK: for United Kingdom
      - /US: for United States of America.
      - /Italy: for Italy.
    `);
  }

  const { iso2 } = lookupObj;

  if (format.toLowerCase() === 'json') {
    return getJSONDataForCountry(iso2).then(result => {
      return res.json(result);
    }).catch(error => errorHandler(error, res));
  }

  return getCountryTable({ countryCode: iso2, isCurl, emojis, minimal })
    .then(result => {
      return res.send(result);
    }).catch(error => errorHandler(error, res));
});


app.listen(port, () => console.log(`Running on ${port}`));