const chalk = require('chalk');
const h = require('humanize-number');
const emojiFlags = require('emoji-flags');
const _ = require('lodash');
const moment = require('moment');
const lookup = require('country-code-lookup');
const stripAnsi = require('strip-ansi');
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
    hAlign: 'right',
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

e.calActive = ({ confirmed, recovered, deaths }) =>
  confirmed - (recovered + deaths);
e.calMortalityPer = ({ confirmed, deaths }) =>
  ((deaths / confirmed) * 100).toFixed(2);
e.calRecoveredPer = ({ confirmed, recovered }) =>
  ((recovered / confirmed) * 100).toFixed(2);

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
    Object.keys(historyObj).map((date) => new Date(date).getTime()),
    Number,
  );

  return sortedTimestampArr.map((timestamp) => {
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
  if (arr1.length === 0) {
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

e.getTotalStats = (countryData) => {
  const worldStats = countryData.reduce(
    (acc, countryObj) => {
      acc.confirmed += countryObj.confirmed;
      acc.deaths += countryObj.deaths;
      acc.confirmedByDay = e.addArr(
        acc.confirmedByDay,
        countryObj.confirmedByDay,
      );
      acc.deathsByDay = e.addArr(acc.deathsByDay, countryObj.deathsByDay);
      return acc;
    },
    {
      confirmed: 0,
      deaths: 0,
      confirmedByDay: [],
      deathsByDay: [],
    },
  );

  worldStats.mortalityPer = e.calMortalityPer(worldStats);
  return worldStats;
};

e.countryUpperCase = (country) => {
  if (country.length > 2) {
    return country
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return country;
};

e.lookupCountry = (country) => {
  country = e.countryUpperCase(country);

  try {
    return (
      lookup.byIso(country) ||
      lookup.byFips(country) ||
      lookup.byCountry(country)
    );
  } catch (error) {
    return lookup.byFips(country) || lookup.byCountry(country);
  }
};

e.footer = (lastUpdated) => `

${chalk.greenBright('Code')}: ${chalk.blueBright(
  'https://github.com/sagarkarira/coronavirus-tracker-cli',
)}
${chalk.greenBright('Twitter')}: ${chalk.blueBright(
  'https://twitter.com/ekrysis',
)}

${chalk.magentaBright('Last Updated on:')} ${moment(lastUpdated)
  .utc()
  .format('DD-MMM-YYYY HH:MM')} UTC

${chalk.red.bold('US STATES API')}: ${chalk.blueBright(
  'https://corona-stats.online/states/us',
)}
${chalk.red.bold('HELP')}: ${chalk.blueBright(
  'https://corona-stats.online/help',
)}
${chalk.red.bold('SPONSORED BY')}: ${chalk.blueBright('ZEIT NOW')}
${chalk.greenBright(
  'Checkout fun new side project I am working on',
)}: ${chalk.bold.blueBright(
  'https://messagink.com/story/5eefb79b77193090dd29d3ce/global-response-to-coronavirus',
)}
`;

e.getTableBorders = (minimal) => {
  if (minimal) {
    return {
      top: '',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      bottom: '',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      right: '',
      'right-mid': '',
      middle: ' ',
    };
  }

  return {
    top: '═',
    'top-mid': '╤',
    'top-left': '╔',
    'top-right': '╗',
    bottom: '═',
    'bottom-mid': '╧',
    'bottom-left': '╚',
    'bottom-right': '╝',
    left: '║',
    'left-mid': '╟',
    mid: '─',
    'mid-mid': '┼',
    right: '║',
    'right-mid': '╢',
    middle: '│',
  };
};

e.getTableStyles = (minimal) => {
  if (minimal) {
    return { 'padding-left': 0, 'padding-right': 0 };
  }
};

e.getTableHeaders = (emojis, secondColumnName) => {
  const head = [
    'Rank',
    secondColumnName,
    `Confirmed ${emojis ? ' ✅' : ''}`,
    `Deaths${emojis ? ' 😞' : ''}`,
    'CFR %',
    '1 Day ▲',
    '1 Week ▲',
    ...(emojis ? ['🏳'] : []),
  ];
  return head;
};

e.getTableHeadersV2 = (emojis, secondColumnName) => {
  const head = [
    'Rank',
    secondColumnName,
    `Total Cases ${emojis ? ' ✅' : ''}`,
    'New Cases ▲',
    `Total Deaths${emojis ? ' 😞' : ''}`,
    `New Deaths ▲${emojis ? ' 😞' : ''}`,
    `Recovered${emojis ? ' 😀' : ''}`,
    `Active${emojis ? ' 😷' : ''}`,
    'Critical',
    'Cases / 1M pop',
    ...(emojis ? ['🏳'] : []),
  ];
  return head;
};
e.extraStats = (dataArr) => {
  return dataArr.map((obj) => {
    return {
      ...obj,
      mortalityPer: e.calMortalityPer(obj),
    };
  });
};

e.htmlTemplate = (body) => {
  const template = `<!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Coronavirus Tracker</title>
    <style>
      *, ::after, ::before {
        box-sizing: border-box;
      }
      body {
        background-color: #0d0208;
        color: #00ff41;
        font-size: 1rem;
        font-weight: 400;
        line-height: normal;
        margin: 0;
        text-align: left;
      }
      .container {
        margin-right: auto;
        margin-left: auto;
        padding-right: 10px;
        padding-left: 10px;
        width: 100%;
      }
      pre {
        display: block;
        font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        overflow: auto;
        white-space: pre;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <pre>${body}</pre>
    </div>
  </body>
  </html>
`;

  return stripAnsi(template);
};

exports.cFormatter = (content, chalkFn, alignment, humanize, extra = '') => {
  if (!content) {
    return '';
  }
  if (humanize) {
    content = h(content);
  }
  if (chalkFn) {
    content = chalkFn(content + extra);
  }
  if (alignment) {
    return {
      content: content,
      hAlign: alignment,
    };
  }
  return content;
};
