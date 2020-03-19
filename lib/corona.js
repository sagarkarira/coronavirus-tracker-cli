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

function getDataByCountry(confirmed, deaths, recovered) {
  const countryMap = {};
  const lastUpdated = confirmed.last_updated;
  const confirmedMap = _.keyBy(confirmed.locations, (i) => i.country + i.province);
  const recoveredMap = _.keyBy(recovered.locations, (i) => i.country + i.province);
  const deathsMap = _.keyBy(deaths.locations, (i) => i.country + i.province);
  confirmed.locations.forEach(obj => {
    const countryName = obj.country;
    const provinceName = obj.province;
    const mapKey = countryName + provinceName;
    if (!countryMap[countryName]) {
      countryMap[countryName] = {
        country: countryName,
        countryCode: obj.country_code,
        confirmed: confirmedMap[mapKey].latest,
        recovered: recoveredMap[mapKey].latest,
        deaths: deathsMap[mapKey].latest,
        confirmedByDay: helpers.historyObjToArr(confirmedMap[mapKey].history),
        recoveredByDay: helpers.historyObjToArr(recoveredMap[mapKey].history),
        deathsByDay: helpers.historyObjToArr(deathsMap[mapKey].history),
        lastUpdated,
      };
    } else {
      countryMap[countryName].confirmed += confirmedMap[mapKey].latest;
      countryMap[countryName].recovered += recoveredMap[mapKey].latest;
      countryMap[countryName].deaths += deathsMap[mapKey].latest;
      countryMap[countryName].confirmedByDay = helpers.addArr(
        countryMap[countryName].confirmedByDay,
        helpers.historyObjToArr(confirmedMap[mapKey].history)
      );
      countryMap[countryName].recoveredByDay = helpers.addArr(
        countryMap[countryName].recoveredByDay,
        helpers.historyObjToArr(recoveredMap[mapKey].history)
      );
      countryMap[countryName].deathsByDay = helpers.addArr(
        countryMap[countryName].deathsByDay,
        helpers.historyObjToArr(deathsMap[mapKey].history)
      );
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

exports.getCompleteTable = async ({
  isCurl = true,
  emojis = false,
  minimal = false,
  top = 1000
  }) => {
  const head = [
    '',
    'Country',
    `Confirmed ${emojis ? ' ✅': ''}`,
    `Recovered${emojis ? ' 😀' : ''}`,
    `Deaths${emojis ? ' 😞' : ''}`,
    `Active${emojis ? ' 😷' : ''}`,
    'Mortality %',
    'Recovered %',
    '1 Day ▲',
    '1 Week ▲',
    // 'RoG',
    ...( emojis ?  ['🏳'] : [] ),
  ];

  const table = new Table({
    head: helpers.getTableHeaders(emojis, 'Country'),
    chars: helpers.getTableBorders(minimal),
    style: helpers.getTableStyles(minimal),
  });
  const data = await api.getCoronaData();
  const { latest, confirmed, deaths, recovered } = data;
  const countryData = getDataByCountry(confirmed, deaths, recovered)
  const worldStats = getTotalStats(countryData);
  table.push({
    '': [
      'World',
      getConfirmed(worldStats.confirmed),
      getRecovered(worldStats.recovered),
      getDeaths(worldStats.deaths),
      getActive(worldStats.active),
      getMortalityPer(worldStats.mortalityPer),
      getRecoveredPer(worldStats.recoveredPer),
      getOneDayChange(worldStats),
      getOneWeekChange(worldStats),
      // '',
      ...( emojis ? ['🌎'] : [] )
    ]
  })
  let rank = 1;
  countryData.some(cd => {
    const countryEmoji = getEmoji(cd.countryCode);
    const values = [
      getCountry(`${cd.country} (${cd.countryCode})`),
      getConfirmed(cd.confirmed),
      getRecovered(cd.recovered),
      getDeaths(cd.deaths),
      getActive(cd.active),
      getMortalityPer(cd.mortalityPer),
      getRecoveredPer(cd.recoveredPer),
      getOneDayChange(cd),
      getOneWeekChange(cd),
      // getRateOfGrowth(cd),
      ...(emojis ? [countryEmoji] : [])
    ]
    table.push({ [rank++]: values })
    return rank == top + 1;
  });
  table.push({
    '': [
      'World',
      getConfirmed(worldStats.confirmed),
      getRecovered(worldStats.recovered),
      getDeaths(worldStats.deaths),
      getActive(worldStats.active),
      getMortalityPer(worldStats.mortalityPer),
      getRecoveredPer(worldStats.recoveredPer),
      getOneDayChange(worldStats),
      getOneWeekChange(worldStats),
      // '',
      ...( emojis ? ['🌎'] : [] )
    ]
  })
  const lastUpdated = countryData[0].lastUpdated;
  if (!isCurl) {
    const template = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css?family=Roboto+Mono&display=swap" rel="stylesheet">
      <title>Coronavirus Tracker</title>
      <style>
        body {
          background:  #0D0208;
          color: #00FF41;
        }
        pre {
          font-family: 'Roboto Mono', monospace;
          white-space: pre;
        }
      </style>
    </head>
    <body>
      <pre>${table.toString() + footer(lastUpdated)}</pre>
    </body>
    </html>`
    return stripAnsi(template);
  }
  return table.toString() + footer(lastUpdated);
}
