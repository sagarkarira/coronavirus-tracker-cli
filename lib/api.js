/**
 * Data Source File
 * 1. Fetch data from source.
 * 2. Process data.
 * 3. Add to cache and return
 */

const NodeCache = require('node-cache');
const axios = require('axios');

const myCache = new NodeCache({ stdTTL: 100, checkperiod: 600 });

/**
 * John Hopkins Univ. data source API.
 * The data needs to be flattened.
 * @todo Move the data processing from `view` files to this `data` file.
 * @returns {Object} JHUDataObject
 */
exports.getCoronaData = async () => {
  const CORONA_ALL_KEY = 'coronaAll';
  const cache = myCache.get(CORONA_ALL_KEY);

  if (cache) {
    console.log('cache', CORONA_ALL_KEY);
    return cache;
  }
  const result = await axios(
    'https://coronavirus-tracker-api.herokuapp.com/all',
  );

  if (!result || !result.data) {
    throw new Error('Source API failure.');
  }
  myCache.set(CORONA_ALL_KEY, result.data, 60 * 15);
  return result.data;
};

/**
 * Fetch Worldometers Data.
 * As JHU data updates once a day, this was added.
 * This API scrapes data from `https://www.worldometers.info/coronavirus/`
 * and updates very frequenly.
 * */
exports.getWorldoMetersData = async (countryCode = 'ALL') => {
  const key = `worldMetersData_${countryCode}`;
  const cache = myCache.get(key);

  if (cache) {
    console.log('cache', key);
    return cache;
  }
  const result = await axios(
    'https://corona.lmao.ninja/v2/countries?sort=cases',
  );
  if (!result || !result.data) {
    throw new Error('WorldoMeters Source API failure');
  }

  const worldStats = result.data.reduce(
    (acc, countryObj) => {
      acc.cases += countryObj.cases;
      acc.todayCases += countryObj.todayCases;
      acc.deaths += countryObj.deaths;
      acc.todayDeaths += countryObj.todayDeaths;
      acc.recovered += countryObj.recovered;
      acc.active += countryObj.active;
      acc.critical += countryObj.critical;
      return acc;
    },
    {
      country: 'World',
      countryCode: 'World',
      cases: 0,
      todayCases: 0,
      deaths: 0,
      todayDeaths: 0,
      recovered: 0,
      active: 0,
      critical: 0,
    },
  );

  result.data.forEach((obj) => {
    obj.confirmed = obj.cases;
    obj.countryCode = obj.countryInfo.iso2 || '';
  });
  worldStats.casesPerOneMillion = (worldStats.cases / 7794).toFixed(2);
  worldStats.confirmed = worldStats.cases;
  let finalData = result.data;
  if (countryCode && countryCode !== 'ALL') {
    // extra filter to cater for trailing comma, ie /gb,
    finalData = finalData.filter((obj) => countryCode.toLowerCase().split(',').filter((obj) => obj.length > 1).includes(obj.countryCode.toLowerCase()));
  }
  const returnObj = { data: finalData, worldStats };

  myCache.set(key, returnObj, 60 * 15);
  return returnObj;
};

exports.usaStats = async () => {
  const key = 'usaStats';
  const cache = myCache.get(key);

  if (cache) {
    console.log('cache', key);
    return cache;
  }
  const result = await axios('https://corona.lmao.ninja/v2/states');
  if (!result || !result.data) {
    throw new Error('usa stats API failure');
  }
  return result;
};

// exports.bingApi = async (countryCode = 'ALL') => {
//   const key = 'bingData';
//   const cache = myCache.get(key);

//   if (cache) {
//     console.log('cache', key);
//     return cache;
//   }
//   const result = await axios('https://bing.com/covid/data');
//   if (!result || !result.data) {
//     throw new Error('bing api faliure');
//   }
//   return result;
// };
