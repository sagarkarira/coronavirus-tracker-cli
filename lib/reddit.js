const axios = require('axios');
const moment = require('moment');
const Table = require('cli-table3');
const stripAnsi = require('strip-ansi');

exports.getLiveUpdates = async ({ json = false, isCurl = true }) => {
  const result = await axios('https://www.reddit.com/live/14d816ty1ylvo/.json');
  if (!result && !result.data) {
    throw new Error('Reddit live thread API failure');
  }

  const mainInfo = result.data.data.children
    .filter(o => o.data.mobile_embeds.length > 0)
    .map(o => {
      return {
        description: o.data.mobile_embeds[0].description,
        url: o.data.mobile_embeds[0].original_url,
        timestamp: o.data.created_utc
      };
    });
  if (json) {
    return mainInfo;
  }

  return formattedForTerminal(mainInfo, isCurl);
};

const formattedForTerminal = (mainInfo, isCurl) => {
  const table = new Table({
    head: ['Time', 'Update'],
    wordWrap: true,
    colWidths: [20, 120]
  });
  mainInfo.forEach(obj => {
    const prefixTime = moment(moment.unix(obj.timestamp).format()).fromNow();
    const sourceLink = prefixTime;
    if (obj.description && !sourceLink.includes('imgur')) {
      table.push([prefixTime, obj.description]);
    }
  });
  return isCurl ? table.toString() : stripAnsi(table.toString());
};
