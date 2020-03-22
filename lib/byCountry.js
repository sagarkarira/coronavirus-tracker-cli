const Table = require('cli-table3');
const _ = require('lodash');
const helpers = require('./helpers');
const api = require('./api');

const {
  extraStats,
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
  return _.sortBy(countryArr, (o) => -o.confirmed);
}

exports.getJSONData = async () => {
  const data = await api.getCoronaData();
  const { confirmed, deaths, recovered } = data;
  const countryData = getDataByState(confirmed, deaths, recovered);
  const totalStats = getTotalStats(countryData);
  totalStats.country = 'World';
  return countryData.concat(totalStats);
};

exports.getJSONDataForCountry = async (countryCode) => {
  const data = await api.getCoronaData();
  const { confirmed, deaths, recovered } = data;
  const countryData = getDataByState(confirmed, deaths, recovered)
    .filter(obj => obj.countryCode === countryCode);
  return countryData;
};

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
  const { confirmed, deaths, recovered } = data;
  const countryData = getDataByState(confirmed, deaths, recovered)
    .filter(obj => obj.countryCode === countryCode);

  if (countryData.length === 0) {
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
    ]
  });

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
        ...(emojis ? [countryEmoji] : [])
      ];
      table.push({ [rank++]: values });
    });
  }

  const { lastUpdated } = countryData[0];
  const ret = table.toString() + footer(lastUpdated);

  return isCurl ? ret : htmlTemplate(ret);
};
