#!/usr/bin/env node

const { getCompleteTable } = require('../lib/corona');

getCompleteTable()
  .then(console.log)
  .catch(console.error);