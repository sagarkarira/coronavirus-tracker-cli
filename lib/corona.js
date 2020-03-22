const Table = require('cli-table3');
const _ = require('lodash');
const helpers = require('./helpers');
const asciichart = require('asciichart');
const api = require('./api');
const chalk = require('chalk');

const {
  extraStats,
  getCountry,
  getConfirmed,
  getActive,
  getDeaths,
  getRecovered,
  getMortalityPer,
  getRecoveredPer,
  getEmoji,
  getOneDayChange,
  getOneWeekChange,
  getTotalStats,
  footer,
  htmlTemplate,
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
  return _.sortBy(countryArr, (o) => -o.confirmed);
}

exports.getGraph = async ({ countryCode = 'ALL', isCurl = true}) => {
  const data = await api.getCoronaData();
  const { confirmed, deaths, recovered } = data;
  const countryData = getDataByCountry(confirmed, deaths, recovered);
  const worldStats = getTotalStats(countryData);
  worldStats.countryCode = 'ALL';
  worldStats.countryName = 'World';
  countryData.push(worldStats);

  const singleCountryData = countryData.filter(obj => obj.countryCode === countryCode);
  // const graphLength = '                                                       ';
  const graphLength = '            Confirmed Cases Graph                      ';
  const padding = '                                      ';
  const graphConfig = {
    height: 30,
    offset: 2,
    padding,
  };
  const { confirmedByDay, } = singleCountryData[0];

  const confirmedGraph = asciichart.plot(confirmedByDay, graphConfig);
  const body = chalk.greenBright(confirmedGraph)
  + chalk.cyanBright('\n\n' +padding + '22 Feb' + graphLength + '22 Mar') + '\n';

  if (!isCurl) {
    return htmlTemplate(body);
  }
  return body;


};

exports.getCompleteTable = async ({
  isCurl = true,
  emojis = false,
  minimal = false,
  top = 1000
}) => {
  const table = new Table({
    head: helpers.getTableHeaders(emojis, 'Country'),
    chars: helpers.getTableBorders(minimal),
    style: helpers.getTableStyles(minimal),
  });
  const data = await api.getCoronaData();
  const { confirmed, deaths, recovered } = data;
  const countryData = getDataByCountry(confirmed, deaths, recovered);
  const worldStats = getTotalStats(countryData);
  const worldRow = [
    'World',
    getConfirmed(worldStats.confirmed),
    getRecovered(worldStats.recovered),
    getDeaths(worldStats.deaths),
    getActive(worldStats.active),
    getMortalityPer(worldStats.mortalityPer),
    getRecoveredPer(worldStats.recoveredPer),
    getOneDayChange(worldStats),
    getOneWeekChange(worldStats),
    ...(emojis ? ['🌎'] : [])
  ];

  table.push({ '': worldRow });
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
      ...(emojis ? [countryEmoji] : [])
    ];
    table.push({ [rank++]: values });
    return rank === top + 1;
  });
  table.push({ '': worldRow });
  const { lastUpdated } = countryData[0];
  const ret = table.toString() + footer(lastUpdated);

  return isCurl ? ret : htmlTemplate(ret);
};
