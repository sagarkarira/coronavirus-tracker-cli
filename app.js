const express = require('express');
const app = express();

const port = process.env.PORT || 3001;

const { getCountryTable } = require('./lib/byCountry');
const { getCompleteTable } = require('./lib/corona');

const countryUpperCase = (countryParams) => {
    if(countryParams.country.length > 2 ){
      const country =  countryParams.country.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      return { country };
    }
  return countryParams;
};

app.get('/', (req, res) => {
  return getCompleteTable().then(result => {
    return res.send(result);
  }).catch(error => res.send(error));
});

app.get('/:country', (req, res) => {

  let { country } = countryUpperCase(req.params);
  if (!country || country === 'All') {
    return getCompleteTable().then(result => {
      return res.send(result);
    }).catch(error => res.send(error));
  }
  return getCountryTable(country).then(result => {
    return res.send(result);
  }).catch(error => res.send(error));
});

app.listen(port, () => console.log(`Running on ${port}`));