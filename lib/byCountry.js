const Table = require('cli-table3');
const axios = require('axios');
const _ = require('lodash');
const chalk = require('chalk');
const helpers = require('./helpers');
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
        deathsByDay: helpers.historyObjToArr(recoveredMap[mapKey].history),
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
  const result = await axios('https://coronavirus-tracker-api.herokuapp.com/all');
  return result.data;
}

exports.getJSONDataForCountry = async (countryCode) => {
  const result = await axios('https://coronavirus-tracker-api.herokuapp.com/all');
  const { latest, confirmed, deaths, recovered } = result.data;
  const countryData = getDataByState(confirmed, deaths, recovered, countryCode)
    .filter(obj => obj.countryCode === countryCode);
  return countryData;
}

exports.getCountryTable = async (countryCode) => {
  const head = [
    '',
    'State',
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
  const result = await axios('https://coronavirus-tracker-api.herokuapp.com/all');
  const { latest, confirmed, deaths, recovered } = result.data;
  const countryData = getDataByState(confirmed, deaths, recovered, countryCode)
    .filter(obj => obj.countryCode === countryCode);
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
        // getEmoji(cd.countryCode),
      ]
      table.push({ [rank++]: values })
    });
  }
  return table.toString() + footer;
}