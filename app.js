const express = require('express');
const app = express();

const port = process.env.PORT || 3001;

const { getCountryTable, getJSONData, getJSONDataForCountry } = require('./lib/byCountry');
const { getCompleteTable } = require('./lib/corona');

app.get('/', (req, res) => {
  const format = req.query.format ? req.query.format : '';

  if (format.toLowerCase() === 'json') {
    return getJSONData().then(result => {
      return res.json(result);
    }).catch(error => res.send(error));
  }

  return getCompleteTable().then(result => {
    return res.send(result);
  }).catch(error => res.send(error));
});

app.get('/:country', (req, res) => {
  const { country } = req.params;
  const format = req.query.format ? req.query.format : '';

  if (!country || country === 'all') {
    if (format.toLowerCase() === 'json') {
      return getJSONData().then(result => {
        return res.json(result);
      }).catch(error => res.send(error));
    }

    return getCompleteTable().then(result => {
      return res.send(result);
    }).catch(error => res.send(error));
  }

  if (format.toLowerCase() === 'json') {
    return getJSONDataForCountry(country).then(result => {
      return res.json(result);
    }).catch(error => res.send(error));
  }
  
  return getCountryTable(country).then(result => {
    return res.send(result);
  }).catch(error => res.send(error));
});


app.listen(port, () => console.log(`Running on ${port}`));