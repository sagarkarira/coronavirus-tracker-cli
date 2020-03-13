const Table = require('cli-table3');
const axios = require('axios');
const _ = require('lodash');
const chalk = require('chalk');
const emojiFlags = require('emoji-flags');
const h = require('humanize-number');

function getConfirmed(confirmed) {
  return {
    content: chalk.blueBright(h(confirmed)),
    hAlign: 'right',
  };
}

function getRecoverd(recovered) {
  return {
    content: chalk.yellowBright(h(recovered)),
    hAlign: 'right',
  };
}

function getDeaths(deaths) {
  return {
    content: chalk.grey(h(deaths)),
    hAlign: 'right',
  }
}

function getActive(confirmed, recovered, deaths) {
  return {
    content: h(confirmed - recovered - deaths),
    hAlign: 'right'
  }
}

function getMortalityRate(deaths, confirmed, average = null) {
  const mortalityRate = ((deaths / confirmed) * 100).toFixed(2);
  return chalk.redBright(mortalityRate);
}

function getRecoveredRate(recovered, confirmed, average = null) {
  const recoveredRate = ((recovered / confirmed) * 100).toFixed(2);
  return chalk.greenBright(recoveredRate);
}

function getEmoji(countryCode) {
  if (countryCode && emojiFlags.countryCode(countryCode)) {
    return emojiFlags.countryCode(countryCode).emoji;
  }
  return '';
}

function getDataByCountry(confirmed, deaths, recovered) {
  const countryMap = {};
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
      };
    } else {
      countryMap[countryName].confirmed += confirmedMap[mapKey].latest;
      countryMap[countryName].recovered += recoveredMap[mapKey].latest;
      countryMap[countryName].deaths += deathsMap[mapKey].latest;
    }
  });
  const countryArr = Object.keys(countryMap).map(key => countryMap[key]);
  return _.sortBy(countryArr, (o) => -o.confirmed)
}

exports.getCompleteTable = async () => {
  const head = [
    '',
    'Country',
    'Confirmed ✅',
    'Recovered 😃',
    'Deaths 😞',
    'Active 😷',
    'Mortality %',
    'Recovered %',
    'Flag 🏳'
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
  const countryData = getDataByCountry(confirmed, deaths, recovered)
  table.push({
    '': [
      'World',
      getConfirmed(latest.confirmed),
      getRecoverd(latest.recovered),
      getDeaths(latest.deaths),
      getActive(latest.confirmed, latest.recovered, latest.deaths),
      getMortalityRate(latest.deaths, latest.confirmed),
      getRecoveredRate(latest.recovered, latest.confirmed),
      '🌎'
    ]
  })
  let rank = 1;
  countryData.forEach(cd => {
    const countryEmoji = getEmoji(cd.countryCode);
    const values = [
      chalk.cyanBright(cd.country),
      getConfirmed(cd.confirmed),
      getRecoverd(cd.recovered),
      getDeaths(cd.deaths),
      getActive(cd.confirmed, cd.recovered, cd.deaths),
      getMortalityRate(cd.deaths, cd.confirmed),
      getRecoveredRate(cd.deaths, cd.confirmed),
      getEmoji(cd.countryCode),
    ]
    table.push({ [rank++]: values })
  });
  return table.toString();
}