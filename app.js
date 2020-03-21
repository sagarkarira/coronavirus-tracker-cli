const express = require('express');
const morgan = require('morgan');

const { getCountryTable, getJSONData, getJSONDataForCountry } = require('./lib/byCountry');
const { getCompleteTable } = require('./lib/corona');
const { lookupCountry } = require('./lib/helpers');
const { getLiveUpdates } = require('./lib/reddit.js');
const { getWorldoMetersTable } = require('./lib/worldoMeters.js');

const app = express();
const port = process.env.PORT || 3001;
const IS_CURL_RE = /\bcurl\b/im;

function errorHandler(error, res) {
  console.error(error);
  return res.send(`
    I am sorry. Something went wrong. Please report it\n
    ${error.message}
  `);
}

app.set('json escape', true);

app.use(morgan(':remote-addr :remote-user :method :url :status :res[content-length] - :response-time ms'));
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

app.get('/', (req, res) => {
  const isCurl = IS_CURL_RE.test(req.headers['user-agent']);
  const format = req.query.format ? req.query.format : '';
  const minimal = req.query.minimal === 'true';
  const emojis = req.query.emojis === 'true';
  const top = req.query.top ? Number(req.query.top) : 1000;
  const source = req.query.source ? Number(req.query.source) : 1;

  if (source === 2) {
    return getWorldoMetersTable({ isCurl, emojis, minimal, top })
      .then(result => {
        return res.send(result);
      }).catch(error => errorHandler(error, res));
  }

  if (format.toLowerCase() === 'json') {
    return getJSONData().then(result => {
      return res.json(result);
    }).catch(error => errorHandler(error, res));
  }

  return getCompleteTable({ isCurl, emojis, minimal, top })
    .then(result => {
      return res.send(result);
    }).catch(error => errorHandler(error, res));
});

app.get('/updates', (req, res) => {
  const isCurl = IS_CURL_RE.test(req.headers['user-agent']);
  const format = req.query.format ? req.query.format : '';

  if (format.toLowerCase() === 'json') {
    return getLiveUpdates({ json: true, isCurl }).then(result => {
      return res.json(result);
    }).catch(error => errorHandler(error, res));
  }

  return getLiveUpdates({ json: false, isCurl }).then(result => {
    return res.send(result);
  }).catch(error => errorHandler(error, res));
});

app.get('/:country', (req, res) => {
  const { country } = req.params;
  const isCurl = IS_CURL_RE.test(req.headers['user-agent']);
  const format = req.query.format ? req.query.format : '';
  const minimal = req.query.minimal === 'true';
  const emojis = req.query.emojis === 'true';
  const source = req.query.source ? Number(req.query.source) : 1;

  if (!country || country.toUpperCase() === 'ALL') {
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

  const lookupObj = lookupCountry(country);

  if (!lookupObj) {
    return res.send(`
    Country not found.
    Try the full country name or country code.
    Example:
      - /UK: for United Kingdom
      - /US: for United States of America.
      - /Italy: for Italy.
    `);
  }


  const { iso2 } = lookupObj;

  if (source === 2) {
    return getWorldoMetersTable({ countryCode: iso2, isCurl, emojis, minimal })
      .then(result => {
        return res.send(result);
      }).catch(error => errorHandler(error, res));
  }

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
