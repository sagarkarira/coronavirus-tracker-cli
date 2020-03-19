const express = require('express');
const app = express();
const lookup = require('country-code-lookup');
const morgan = require('morgan');

const port = process.env.PORT || 3001;

const { getCountryTable, getJSONData, getJSONDataForCountry } = require('./lib/byCountry');
const { getCompleteTable } = require('./lib/corona');
const { countryUpperCase, lookupCountry } = require('./lib/helpers');


function errorHandler(error, res) {
  console.error(error);
  return res.send('I am sorry. Something went wrong. Please report it');
}

app.use(morgan(':remote-addr :remote-user :method :url :status :res[content-length] - :response-time ms'));

app.get('/', (req, res) => {
  const format = req.query.format ? req.query.format : '';
  const top = req.query.top ? Number(req.query.top) : 300;

  if (format.toLowerCase() === 'json') {
    return getJSONData().then(result => {
      res.setHeader('Cache-Control', 's-maxage=900');
      return res.json(result);
    }).catch(error => errorHandler(error, res));
  }

  return getCompleteTable(max=top).then(result => {
    res.setHeader('Cache-Control', 's-maxage=900');
    return res.send(result);
  }).catch(error => errorHandler(error, res));
});

app.get('/:country', (req, res) => {
  const { country } = req.params;
  const format = req.query.format ? req.query.format : '';

  if (!country || 'ALL' === country.toUpperCase()) {
    if (format.toLowerCase() === 'json') {
      return getJSONData().then(result => {
        res.setHeader('Cache-Control', 's-maxage=900');
        return res.json(result);
      }).catch(error => errorHandler(error, res));
    }


    return getCompleteTable().then(result => {
      res.setHeader('Cache-Control', 's-maxage=900');
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
      - /India: for India.
    `);
  }

  const { iso2 } = lookupObj;

  if (format.toLowerCase() === 'json') {
    return getJSONDataForCountry(iso2).then(result => {
      res.setHeader('Cache-Control', 's-maxage=900');
      return res.json(result);
    }).catch(error => errorHandler(error, res));
  }

  return getCountryTable(iso2).then(result => {
    res.setHeader('Cache-Control', 's-maxage=900');
    return res.send(result);
  }).catch(error => errorHandler(error, res));
});


app.listen(port, () => console.log(`Running on ${port}`));