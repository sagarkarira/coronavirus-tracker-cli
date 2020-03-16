const express = require('express');
const app = express();
const lookup = require('country-code-lookup');

const port = process.env.PORT || 3001;

const { getCountryTable, getJSONData, getJSONDataForCountry } = require('./lib/byCountry');
const { getCompleteTable } = require('./lib/corona');

function errorHandler(error, res) {
  console.error(error);
  return res.send('I am sorry. Something went wrong. Please report it');
}

app.get('/', (req, res) => {
  const format = req.query.format ? req.query.format : '';

  if (format.toLowerCase() === 'json') {
    return getJSONData().then(result => {
      return res.json(result);
    }).catch(error => errorHandler(error, res));
  }

  return getCompleteTable().then(result => {
    return res.send(result);
  }).catch(error => errorHandler(error, res));
});

app.get('/:country', (req, res) => {
  const { country } = req.params;
  let lookupObj = null;
  const format = req.query.format ? req.query.format : '';

  if (!country || country === 'all') {
    if (format.toLowerCase() === 'json') {
      return getJSONData().then(result => {
        return res.json(result);
      }).catch(error => errorHandler(error, res));
    }

    return getCompleteTable().then(result => {
      return res.send(result);
    }).catch(error => errorHandler(error, res));
  }

  try {
    lookupObj = lookup.byIso(country)
      || lookup.byFips(country)
      || lookup.byCountry(country);
  } catch (error) {
    lookupObj = lookup.byFips(country) || lookup.byCountry(country);
  }
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
      return res.json(result);
    }).catch(error => errorHandler(error, res));
  }

  return getCountryTable(iso2).then(result => {
    return res.send(result);
  }).catch(error => errorHandler(error, res));
});


app.listen(port, () => console.log(`Running on ${port}`));