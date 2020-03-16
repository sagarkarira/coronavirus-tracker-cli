const Table = require('cli-table3');
const axios = require('axios');
const _ = require('lodash');
const chalk = require('chalk');
const helpers = require('./helpers');
const api = require('./api');
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
  const confirmedMap = _.keyBy(confirmed.locations, (i) => i.country + i.province);
  const recoveredMap = _.keyBy(recovered.locations, (i) => i.country + i.province);
  const deathsMap = _.keyBy(deaths.locations, (i) => i.country + i.province);
  const countryName = process.argv[2].toLowerCase();

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
        deathsByDay: helpers.historyObjToArr(recoveredMap[mapKey].history),
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
  const countryData = (countryName) ? countryArr.filter(obj =>  obj.country.toLowerCase() === countryName) : _.sortBy(countryArr, (o) => -o.confirmed);

  return countryData;
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

exports.getCompleteTable = async () => {
  const head = [
    '',
    'Country',
    'Confirmed',
    'Recovered',
    'Deaths',
    'Active',
    'Mortality %',
    'Recovered %',
    '1 Day ▲',
    '1 Week ▲',
    // 'RoG',
    // '🏳',
  ];
  const table = new Table({
    head,
    chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
         , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
         , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
         , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
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
      // '🌎'
    ]
  })
  let rank = 1;
  countryData.forEach(cd => {
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
      // getEmoji(cd.countryCode),
    ]
    table.push({ [rank++]: values })
  });
  return table.toString() + footer;
}