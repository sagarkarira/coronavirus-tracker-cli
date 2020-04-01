const Table = require('cli-table3');
const chalk = require('chalk');
const helpers = require('../helpers');
const api = require('../api');
const { cFormatter } = helpers;


const getUsaStatsHeaders = (emojis, secondColumnName) => {
  const head = [
    'Rank',
    secondColumnName,
    `Total Cases ${emojis ? ' ✅' : ''}`,
    'New Cases ▲',
    `Total Deaths${emojis ? ' 😞' : ''}`,
    `New Deaths ▲${emojis ? ' 😞' : ''}`,
    `Active${emojis ? ' 😷' : ''}`,

  ];
  return head;
};


exports.getUsaStats = async ({
  isCurl = true,
  minimal = false,
  top = 1000,
  format,
}) => {
  const secondColumnName = 'US States';
  const table = new Table({
    head: getUsaStatsHeaders(null, secondColumnName),
    chars: helpers.getTableBorders(minimal),
    style: helpers.getTableStyles(minimal),
  });
  const { data } = await api.usaStats();
  if (format === 'json') {
    return { data };
  }

  let rank = 1;
  data.some(cd => {
    const values = [
      cFormatter(cd.state , chalk.cyanBright),
      cFormatter(cd.cases, chalk.green, 'right', true),
      cFormatter(cd.todayCases, chalk.cyanBright, 'right', true, ' ▲'),
      cFormatter(cd.deaths, chalk.whiteBright, 'right', true),
      cFormatter(cd.todayDeaths, chalk.redBright, 'right', true, ' ▲'),
      cFormatter(cd.active, chalk.blueBright , 'right', true),
    ];
    table.push({ [rank++]: values });
    return rank === top + 1;
  });

  const lastUpdated = new Date();
  const ret = table.toString() + helpers.footer(lastUpdated);
  return isCurl ? ret : helpers.htmlTemplate(ret);
};