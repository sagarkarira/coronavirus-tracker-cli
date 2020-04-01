const { htmlTemplate, footer } = require('./helpers');

exports.helpContent = `

/$$   /$$ /$$$$$$$$ /$$       /$$$$$$$
| $$  | $$| $$_____/| $$      | $$____$$
| $$  | $$| $$      | $$      | $$    $$
| $$$$$$$$| $$$$$   | $$      | $$$$$$$/
| $$__  $$| $$__/   | $$      | $$____/
| $$  | $$| $$      | $$      | $$
| $$  | $$| $$$$$$$$| $$$$$$$$| $$
|__/  |__/|________/|________/|__/

---------------------------------------------------------------------------------

# Source 1 stats - updated once a day from John Hopkins University
https://corona-stats.online

---------------------------------------------------------------------------------

(DEFAULT SOURCE)
# Source 2 stats - updated every 15 minutes from worldometers.info
https://corona-stats.online?source=2

---------------------------------------------------------------------------------

# Country wise stats

## Format:
https://corona-stats.online/[countryCode]
https://corona-stats.online/[countryName]

## Example: From source 1
https://corona-stats.online/Italy?source=1
https://corona-stats.online/UK?source=1

## Example: From source 2 (DEFAULT)
https://corona-stats.online/italy
https://corona-stats.online/italy?source=2
https://corona-stats.online/UK?source=2
https://corona-stats.online/UK

---------------------------------------------------------------------------------

# State wise api (Only for US as of now)

## Format:
https://corona-stats.online/states/[countryCode]
https://corona-stats.online/states/[countryName]

## Example: From source 1
https://corona-stats.online/us
https://corona-stats.online/USA?format=json
https://corona-stats.online/USA?minimal=true

---------------------------------------------------------------------------------

# Minimal Mode - remove the borders and padding from table

## Example:
https://corona-stats.online?minimal=true
https://corona-stats.online/Italy?minimal=true           (with country filter)
https://corona-stats.online?minimal=true&source=1        (with source)
https://corona-stats.online/uk?source=2&minimal=true     (with source and country)

---------------------------------------------------------------------------------

# Get data as JSON - Add ?format=json

## Example:
https://corona-stats.online?format=json
https://corona-stats.online/Italy?format=json            (with country filter)
https://corona-stats.online/?source=2&format=json        (with source)
https://corona-stats.online/uk?source=2&format=json      (with source and country)

---------------------------------------------------------------------------------

# Get top N countries - Add ?top=N

## Example:
https://corona-stats.online?top=25
https://corona-stats.online?source=1&top=10               (with source)
https://corona-stats.online/uk?minimal=true&top=20        (with minimal)


---------------------------------------------------------------------------------

# Confirmed Cases Graph (WIP)

## Format:
https://corona-stats.online/[countryName]/graph
https://corona-stats.online/[countryCode]/graph

## Example:
https://corona-stats.online/italy/graph
https://corona-stats.online/china/graph


------------- Any issues or feedback - Hit me up on twitter @ekrysis --------------

`;

exports.countryNotFound = (isCurl) =>  {
  const body = `
    Country not found.
    Try the full country name or country code.
    Example:
      - /UK: for United Kingdom
      - /US: for United States of America.
      - /Italy: for Italy.

    ${footer(new Date)}
  `;
  return isCurl ? body : htmlTemplate(body);
};

exports.stateCountryNotFound = (isCurl) => {
  const body = `
    State wise api is only available for:
      - US
    Try:
    /US or /USA

    ${footer(new Date)}
  `;
  return isCurl ? body : htmlTemplate(body);
};