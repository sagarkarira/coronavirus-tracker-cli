const Table = require('cli-table3');
const helpers = require('./helpers');
const api = require('./api');
const chalk = require('chalk');
const { getEmoji, cFormatter } = helpers;

exports.getWorldoMetersTable = async ({
  countryCode = null,
  isCurl = true,
  emojis = false,
  minimal = false,
  top = 1000,
  format,
}) => {
  const secondColumnName = countryCode ? 'Country': 'World';
  const table = new Table({
    head: helpers.getTableHeadersV2(emojis, secondColumnName),
    chars: helpers.getTableBorders(minimal),
    style: helpers.getTableStyles(minimal),
  });
  const { data, worldStats } = await api.getWorldoMetersData(countryCode);
  if (format === 'json') {
    return { data, worldStats };
  }

  let rank = 1;
  data.some(cd => {
    const countryEmoji = getEmoji(cd.countryCode) || '🏳️';
    const values = [
      cFormatter(`${cd.country.slice(0, 30)} (${cd.countryCode === undefined ? '' : cd.countryCode })` , chalk.cyanBright),
      cFormatter(cd.cases, chalk.green, 'right', true),
      cFormatter(cd.todayCases, chalk.cyanBright, 'right', true, ' ▲'),
      cFormatter(cd.deaths, chalk.whiteBright, 'right', true),
      cFormatter(cd.todayDeaths, chalk.redBright, 'right', true, ' ▲'),
      cFormatter(cd.recovered, chalk.greenBright, 'right', true),
      cFormatter(cd.active, chalk.blueBright , 'right', true),
      cFormatter(cd.critical, chalk.magenta, 'right', true),
      cFormatter(cd.casesPerOneMillion, chalk.yellow, 'right', true),
      ...(emojis ? [countryEmoji] : [])
    ];
    table.push({ [rank++]: values });
    return rank === top + 1;
  });
  table.push({
    '': [
      'World',
      cFormatter(worldStats.cases, chalk.green, 'right', true),
      cFormatter(worldStats.todayCases, chalk.cyanBright, 'right', true, ' ▲'),
      cFormatter(worldStats.deaths, chalk.whiteBright, 'right', true),
      cFormatter(worldStats.todayDeaths, chalk.redBright, 'right', true, ' ▲'),
      cFormatter(worldStats.recovered, chalk.greenBright, 'right', true),
      cFormatter(worldStats.active, chalk.blueBright , 'right', true),
      cFormatter(worldStats.critical, chalk.magenta, 'right', true),
      cFormatter(worldStats.casesPerOneMillion, chalk.yellow, 'right', true),
      ...(emojis ? ['🌎'] : [])
    ]
  });
  const lastUpdated = new Date();
  const ret = table.toString() + helpers.footer(lastUpdated);
  return isCurl ? ret : helpers.htmlTemplate(ret);
};


