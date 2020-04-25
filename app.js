const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const chalk = require('chalk');

const {
  getCountryTable,
  getJSONData,
  getJSONDataForCountry,
} = require('./lib/byCountry');
const { getCompleteTable, getGraph } = require('./lib/corona');
const { lookupCountry, htmlTemplate, footer } = require('./lib/helpers');
const { getLiveUpdates } = require('./lib/reddit.js');
const { getWorldoMetersTable } = require('./lib/worldoMeters.js');
const { getUsaStats } = require('./lib/country/us.js');
const { helpContent, countryNotFound, stateCountryNotFound } = require('./lib/constants');

const app = express();
const port = process.env.PORT || 3001;
const IS_CURL_RE = /\bcurl\b/im;

function errorHandler(error, req, res) {
  console.error(error);
  const body = `
    I am sorry. Something went wrong. Please report it\n
    ${error.message}
    ${footer(new Date)}
  `;
  if (req.isCurl) {
    return body;
  }
  return res.status(500).send(htmlTemplate(body));
}

app.set('json escape', true);

app.use(helmet({
  dnsPrefetchControl: false,
  frameguard: {
    action: 'deny'
  }
}));

app.use(helmet.hsts({
  force: true,
  includeSubDomains: true,
  maxAge: 63072000, // 2 years
  preload: true
}));

app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));

app.use(morgan(':remote-addr :remote-user :method :url :status :res[content-length] - :response-time ms'));
app.use('/favicon.ico', express.static('./favicon.ico'));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  req.isCurl = IS_CURL_RE.test(req.headers['user-agent']);
  next();
});

app.get('/', (req, res) => {
  const isCurl = req.isCurl;
  const format = req.query.format ? req.query.format : '';
  const minimal = req.query.minimal === 'true';
  const emojis = req.query.emojis === 'true';
  const top = req.query.top ? Number(req.query.top) : 1000;
  const source = req.query.source ? Number(req.query.source) : 2;

  if (source === 1) {
    if (format.toLowerCase() === 'json') {
      return getJSONData().then(result => {
        return res.json(result);
      }).catch(error => errorHandler(error, req, res));
    }

    return getCompleteTable({ isCurl, emojis, minimal, top })
      .then(result => {
        return res.send(result);
      }).catch(error => errorHandler(error, req, res));
  }

  return getWorldoMetersTable({ isCurl, emojis, minimal, top, format})
    .then(result => {
      return res.send(result);
    }).catch(error => errorHandler(error, req, res));

});

app.get('/updates', (req, res) => {
  const isCurl = req.isCurl;
  const format = req.query.format ? req.query.format : '';

  if (format.toLowerCase() === 'json') {
    return getLiveUpdates({ json: true, isCurl }).then(result => {
      return res.json(result);
    }).catch(error => errorHandler(error, req, res));
  }

  return getLiveUpdates({ json: false, isCurl }).then(result => {
    return res.send(result);
  }).catch(error => errorHandler(error, req, res));
});

app.get(['/:country/graph', '/graph'], (req, res) => {
  const { country } = req.params;
  const isCurl = req.isCurl;
  if (!country) {
    return getGraph({ isCurl })
      .then(result => res.send(result))
      .catch(error => errorHandler(error, req, res));
  }
  const lookupObj = lookupCountry(country);

  if (!lookupObj) {
    return res.status(404).send(countryNotFound(isCurl));
  }
  return getGraph({countryCode: lookupObj.iso2, isCurl })
    .then(result => res.send(result))
    .catch(error => errorHandler(error, req, res));
});

app.get('/help', (req, res) => {
  const isCurl = req.isCurl;
  if (!isCurl) {
    return res.send(htmlTemplate(helpContent));
  }
  return res.send(chalk.green(helpContent));
});

app.get('/states/:country', (req, res) => {
  const { country } = req.params;
  const isCurl = req.isCurl;
  const format = req.query.format ? req.query.format : '';
  const minimal = req.query.minimal === 'true';
  const top = req.query.top ? Number(req.query.top) : 1000;

  const lookupObj = lookupCountry(country);

  if (!lookupObj) {
    return res.status(404).send(stateCountryNotFound(isCurl));
  }
  if (lookupObj.iso2 === 'US') {
    return getUsaStats({ isCurl, minimal, top, format})
      .then(result => {
        return res.send(result);
      }).catch(error => errorHandler(error, req, res));
  }
});


app.get('/:country', (req, res) => {
  const { country } = req.params;
  const isCurl = req.isCurl;
  const format = req.query.format ? req.query.format : '';
  const minimal = req.query.minimal === 'true';
  const emojis = req.query.emojis === 'true';
  const source = req.query.source ? Number(req.query.source) : 2;

  if (!country || country.toUpperCase() === 'ALL' || country.includes(',')) {
    if (format.toLowerCase() === 'json') {
      return getWorldoMetersTable({ countryCode: country, isCurl, emojis, minimal, format }).then(result => {
        return res.json(result);
      }).catch(error => errorHandler(error, req, res));
    }

    return getWorldoMetersTable({ countryCode: country, isCurl, emojis, minimal })
      .then(result => {
        return res.send(result);
      }).catch(error => errorHandler(error, req, res));
  }
  if (source === 1) {
    const lookupObj = lookupCountry(country);

    if (!lookupObj) {
      return res.status(404).send(countryNotFound(isCurl));
    }
    const { iso2 } = lookupObj;

    if (format.toLowerCase() === 'json') {
      return getJSONDataForCountry(iso2).then(result => {
        return res.json(result);
      }).catch(error => errorHandler(error, req, res));
    }
    return getCountryTable({ countryCode: iso2, isCurl, emojis, minimal })
      .then(result => {
        return res.send(result);
      }).catch(error => errorHandler(error, req, res));
  }

  const lookupObj = lookupCountry(country);

  if (!lookupObj) {
    return res.status(404).send(countryNotFound(isCurl));
  }

  const { iso2 } = lookupObj;

  return getWorldoMetersTable({ countryCode: iso2, isCurl, emojis, minimal, format })
    .then(result => {
      return res.send(result);
    }).catch(error => errorHandler(error, req, res));
});

app.listen(port, () => console.log(`Running on ${port}`));
