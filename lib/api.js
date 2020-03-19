const NodeCache = require('node-cache');
const axios = require('axios');

const myCache = new NodeCache({ stdTTL: 100, checkperiod: 600 });
const CORONA_ALL_KEY = 'coronaAll';

exports.getCoronaData = async () => {
  const coronaCache = myCache.get(CORONA_ALL_KEY);

  if (coronaCache) {
    return coronaCache;
  }

  const result = await axios('https://coronavirus-tracker-api.herokuapp.com/all');

  if (!result || !result.data) {
    throw new Error('Source API failure.');
  }

  myCache.set(CORONA_ALL_KEY, result.data, 60 * 15);

  return result.data;
};
