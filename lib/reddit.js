const axios = require('axios');
const LIVE_THREAD_URL = 'https://www.reddit.com/live/14d816ty1ylvo/.json';
const moment = require('moment');
// const terminalLink = require('terminal-link');
const Table = require('cli-table3');
const stripAnsi = require('strip-ansi');

exports.getLiveUpdates = async ({ json = false, isCurl = true }) => {
  const result = await axios(`https://www.reddit.com/live/14d816ty1ylvo/.json`);
  if (!result && !result.data) {
    throw new Error(`Reddit live thread API faliure`);
  }
  const mainInfo = result.data.data.children
    .filter(o => o.data.mobile_embeds.length > 0)
    .map(o => {
      return {
        description: o.data.mobile_embeds[0].description,
        url:o.data.mobile_embeds[0].original_url,
        timestamp: o.data.created_utc,
      };
    });
  if (json) {
    return mainInfo;
  }
  return formattedForTerminal(mainInfo, isCurl);
};

const formattedForTerminal = (mainInfo, isCurl) => {
  let liveUpdates = 'Latest Updates: \n\n';
  var table = new Table({
    head: ['Time', 'Update'],
    wordWrap: true,
    colWidths: [20, 120],
  });
  mainInfo.forEach(obj => {
    const prefixTime = moment(moment.unix(obj.timestamp).format()).fromNow();
    const sourceLink = prefixTime;
    if (obj.description && sourceLink.indexOf('imgur') === -1) {
      // liveUpdates += `${obj.description} --[${sourceLink}] \n\n`;
      table.push([prefixTime, obj.description ]);
    }
  });
  liveUpdates += 'Source: https://www.reddit.com/live/14d816ty1ylvo';
  // return liveUpdates;
  return isCurl ? table.toString() : stripAnsi(table.toString());
}