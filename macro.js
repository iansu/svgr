/* eslint-disable import/no-unresolved */
const { createMacro } = require('babel-plugin-macros');

const macro = require('./lib/macro').default;

module.exports = createMacro(macro);
