const chalk = require('chalk');
const h = require('humanize-number');
const emojiFlags = require('emoji-flags');
const _ = require('lodash');
const moment = require('moment');
const lookup = require('country-code-lookup');
const e = exports;

e.getCountry = (country) => {
  return chalk.cyan.bold(country);
};

e.getState = (state) => {
  if (state) {
    return chalk.red(state);
  }
  return chalk.red('ALL');
};

e.getConfirmed = (confirmed) => {
  return {
    content: chalk.blueBright(h(confirmed)),
    hAlign: 'right',
  };
};

e.getRecovered = (recovered) => {
  return {
    content: chalk.yellowBright(h(recovered)),
    hAlign: 'right',
  };
};

e.getDeaths = (deaths) => {
  return {
    content: chalk.whiteBright(h(deaths)),
    hAlign: 'right',
  };
};

e.getActive = (active) => {
  return {
    content: chalk.magentaBright(h(active)),
    hAlign: 'right'
  };
};

e.getMortalityPer = (mortalityPer) => ({
  content: chalk.redBright(mortalityPer),
  hAlign: 'right',
});

e.getRecoveredPer = (recoveredPer) => ({
  content: chalk.greenBright(recoveredPer),
  hAlign: 'right',
});

e.getEmoji = (countryCode) => {
  if (countryCode && emojiFlags.countryCode(countryCode)) {
    return emojiFlags.countryCode(countryCode).emoji;
  }
  return '';
};

e.calActive = ({ confirmed, recovered, deaths }) => confirmed - (recovered + deaths);
e.calMortalityPer = ({ confirmed, deaths }) => ((deaths / confirmed) * 100).toFixed(2);
e.calRecoveredPer = ({ confirmed, recovered }) => ((recovered / confirmed) * 100).toFixed(2);

/**
   historyObj = {
    "1/22/20": 0,
    "1/23/20": 1,
    "1/24/20": 4,
    "1/25/20": 7,
  }
  Returns sorted arr of above elements - [0, 1, 4, 7]
 */
e.historyObjToArr = (historyObj) => {
  const sortedTimestampArr = _.sortBy(
    Object.keys(historyObj).map(date => new Date(date).getTime()),
    Number
  );
  return sortedTimestampArr.map(timestamp => {
    const dateFormatted = moment(timestamp).format('M/D/YY');
    return historyObj[dateFormatted];
  });
};

/**
 * Given both arr1 and arr2 has same number of elements
 * Returns -> sum[n] = arr1[n] + arr2[n]
 *
*/
e.addArr = (arr1, arr2) => {
  if (arr1.length === 0 ) {
    return arr2;
  }
  if (arr2.length === 0) {
    return arr1;
  }
  return arr1.map((val, index) => arr1[index] + arr2[index]);
};

e.getOneDayChange = ({ confirmedByDay }) => {
  const present = confirmedByDay.length - 1;
  const dailyChange = confirmedByDay[present] - confirmedByDay[present - 1];
  return {
    content: `${h(dailyChange)} ▲`,
    hAlign: 'right',
  };
};

e.getOneWeekChange = ({ confirmedByDay }) => {
  const present = confirmedByDay.length - 1;
  const weeklyChange = confirmedByDay[present] - confirmedByDay[present - 7];
  return {
    content: `${h(weeklyChange)} ▲`,
    hAlign: 'right',
  };
};

e.getRateOfGrowth = ( { confirmedByDay }) => {
  return confirmedByDay[0];
};

e.getTotalStats = (countryData) => {
  const worldStats = countryData.reduce((acc, countryObj) => {
    acc.confirmed += countryObj.confirmed;
    acc.recovered += countryObj.recovered;
    acc.deaths += countryObj.deaths;
    acc.confirmedByDay = e.addArr( acc.confirmedByDay, countryObj.confirmedByDay);
    acc.recoveredByDay = e.addArr( acc.recoveredByDay, countryObj.recoveredByDay);
    acc.deathsByDay = e.addArr( acc.deathsByDay, countryObj.deathsByDay);
    return acc;
  }, {
    confirmed: 0,
    recovered: 0,
    deaths: 0,
    confirmedByDay: [],
    recoveredByDay: [],
    deathsByDay: [],
  });
  worldStats.active = e.calActive(worldStats);
  worldStats.recoveredPer = e.calRecoveredPer(worldStats);
  worldStats.mortalityPer = e.calMortalityPer(worldStats);
  return worldStats;
};

e.countryUpperCase = country => {
  if(country.length > 2){
    return country.toLowerCase().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
  return country;
};

e.lookupCountry = country => {
  country = e.countryUpperCase(country);
  try {
    return lookup.byIso(country)
        || lookup.byFips(country)
        || lookup.byCountry(country);
  } catch (error) {
    return lookup.byFips(country) || lookup.byCountry(country);
  }
};

e.footer = (lastUpdated) => `

Stay safe. Stay inside.

Code: https://github.com/sagarkarira/coronavirus-tracker-cli
Twitter: https://twitter.com/ekrysis

Last Updated on: ${moment(lastUpdated).utc().format('DD-MMM-YYYY HH:MM')} UTC

`;

e.getTableBorders = minimal => {
  if (minimal) {
    return { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
      , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
      , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
      , 'right': '' , 'right-mid': '' , 'middle': ' ' }
  };
  return { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
    ,'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
    ,'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
    ,'right': '║' , 'right-mid': '╢' , 'middle': '│' };
};

e.getTableStyles = minimal => {
  if (minimal) {
    return { 'padding-left': 0, 'padding-right': 0 };
  }
};

e.getTableHeaders = (emojis, secondColumnName ) => {
  const head = [
    'Rank',
    secondColumnName,
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
  return head;
};