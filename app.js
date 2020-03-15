const express = require('express');
const app = express();

const port = process.env.PORT || 3001;

const { getCountryTable } = require('./lib/byCountry');
const { getCompleteTable } = require('./lib/corona');

app.get('/', (req, res) => {
  return getCompleteTable().then(result => {
    return res.send(result);
  }).catch(error => res.send(error));
});

app.get('/:country', (req, res) => {
  let { country } = req.params;
  if (!country || country === 'all') {
    return getCompleteTable().then(result => {
      return res.send(result);
    }).catch(error => res.send(error));
  }
  return getCountryTable(country).then(result => {
    return res.send(result);
  }).catch(error => res.send(error));
});

app.listen(port, () => console.log(`Running on ${port}`));