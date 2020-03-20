const Table = require('cli-table3');
const axios = require('axios');
const _ = require('lodash');
const chalk = require('chalk');
const helpers = require('./helpers');
const api = require('./api');
const stripAnsi = require('strip-ansi');
const {
  getCountry,
  getConfirmed,
  getActive,
  getDeaths,
  getRecovered,
  getMortalityPer,
  getRecoveredPer,
  getEmoji,
  calActive,
  calMortalityPer,
  calRecoveredPer,
  getOneDayChange,
  getOneWeekChange,
  getRateOfGrowth,
  getTotalStats,
  footer,
} = require('./helpers');

function getDataByState(confirmed, deaths, recovered) {
  const countryMap = {};
  const lastUpdated = confirmed.last_updated;
  const confirmedMap = _.keyBy(confirmed.locations, (i) => i.country + i.province);
  const recoveredMap = _.keyBy(recovered.locations, (i) => i.country + i.province);
  const deathsMap = _.keyBy(deaths.locations, (i) => i.country + i.province);
  confirmed.locations.forEach(obj => {
    const countryName = obj.country;
    const provinceName = obj.province;
    const mapKey = countryName + provinceName;
    if (!countryMap[mapKey] && confirmedMap[mapKey].latest > 0) {
      countryMap[mapKey] = {
        country: countryName,
        province: provinceName,
        countryCode: obj.country_code,
        confirmed: confirmedMap[mapKey].latest,
        recovered: recoveredMap[mapKey].latest,
        deaths: deathsMap[mapKey].latest,
        confirmedByDay: helpers.historyObjToArr(confirmedMap[mapKey].history),
        recoveredByDay: helpers.historyObjToArr(recoveredMap[mapKey].history),
        deathsByDay: helpers.historyObjToArr(deathsMap[mapKey].history),
        lastUpdated,
      };
    }
  });
  const countryArr = extraStats(
    Object.keys(countryMap).map(key => countryMap[key])
  );
  return _.sortBy(countryArr, (o) => -o.confirmed)
}

function extraStats(dataArr) {
  return dataArr.map(obj => Object.assign({}, obj,
    {
      active: calActive(obj),
      mortalityPer: calMortalityPer(obj),
      recoveredPer: calRecoveredPer(obj),
    })
  );
}

exports.getJSONData = async () => {
  const data = await api.getCoronaData();
  const { latest, confirmed, deaths, recovered } = data;
  const countryData = getDataByState(confirmed, deaths, recovered);
  const totalStats = getTotalStats(countryData);
  totalStats.country = 'World';
  return countryData.concat(totalStats);
}

exports.getJSONDataForCountry = async (countryCode) => {
  const data = await api.getCoronaData();
  const { latest, confirmed, deaths, recovered } = data;
  const countryData = getDataByState(confirmed, deaths, recovered, countryCode)
    .filter(obj => obj.countryCode === countryCode);
  return countryData;
}

exports.getCountryTable = async ({
  countryCode,
  emojis = false,
  isCurl = true,
  minimal = false,
}) => {
  const table = new Table({
    head: helpers.getTableHeaders(emojis, 'State'),
    chars: helpers.getTableBorders(minimal),
    style: helpers.getTableStyles(minimal),
  });
  const data = await api.getCoronaData();
  const { latest, confirmed, deaths, recovered } = data;
  const countryData = getDataByState(confirmed, deaths, recovered)
    .filter(obj => obj.countryCode === countryCode);

  if(countryData.length === 0) {
    throw new Error(`Country code ${countryCode} does not match anything in the database.`);
  }

  const totalStats = getTotalStats(countryData);
  table.push({
    [countryData[0].country]: [
      'Total',
      getConfirmed(totalStats.confirmed),
      getRecovered(totalStats.recovered),
      getDeaths(totalStats.deaths),
      getActive(totalStats.active),
      getMortalityPer(totalStats.mortalityPer),
      getRecoveredPer(totalStats.recoveredPer),
      getOneDayChange(totalStats),
      getOneWeekChange(totalStats),
      // '',
      // getEmoji(countryData[0].countryCode),
    ]
  })
  if (countryData.length > 1) {
    let rank = 1;
    countryData.forEach(cd => {
      const countryEmoji = getEmoji(cd.countryCode);
      const values = [
        cd.province,
        getConfirmed(cd.confirmed),
        getRecovered(cd.recovered),
        getDeaths(cd.deaths),
        getActive(cd.active),
        getMortalityPer(cd.mortalityPer),
        getRecoveredPer(cd.recoveredPer),
        getOneDayChange(cd),
        getOneWeekChange(cd),
        // getRateOfGrowth(cd),
        ... (emojis ? [countryEmoji] : [])
      ]
      table.push({ [rank++]: values })
    });
  }
  const lastUpdated = countryData[0].lastUpdated;
  if (!isCurl) {
    const template = `<!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Coronavirus Tracker</title>
      <style>
        body {
          background-color: #0d0208;
          color: #00ff41;
        }
        pre {
          font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          white-space: pre;
        }
      </style>
    </head>
    <body>
      <pre>${table.toString() + footer(lastUpdated)}</pre>
    </body>
    </html>`;
    return stripAnsi(template);
  }
  return table.toString() + footer(lastUpdated);
}