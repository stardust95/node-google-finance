exports.COMPANY_NEWS_URL = 'https://finance.google.com/finance/company_news';
exports.HISTORICAL_URL = 'http://finance.google.com/finance/historical';
exports.QUOTES_URL = 'https://finance.google.com/finance';
exports.MARKET_NEWS_URL = 'https://finance.google.com/finance/market_news';

// Query by company_news
// exports.MARKET_INDEX_SYMBOL = {
//   'NASDAQ': 'INDEXNASDAQ:.IXIC',
//   'SHA'   : 'SHA:000001',
//
// };

exports.googleFinanceKeyToFullName = {
  'id'      : 'ID',
  't'       : 'StockSymbol',
  'e'       : 'Index',
  'l'       : 'LastTradePrice',
  'l_cur'   : 'LastTradeWithCurrency',
  'ltt'     : 'LastTradeTime',
  'lt_dts'  : 'LastTradeDateTime',
  'lt'      : 'LastTradeDateTimeLong',
  'div'     : 'Dividend',
  'yld'     : 'Yield',
  's'       : 'LastTradeSize',
  'c'       : 'Change',
  'cp'      : 'ChangePercent',
  'el'      : 'ExtHrsLastTradePrice',
  'el_cur'  : 'ExtHrsLastTradeWithCurrency',
  'elt'     : 'ExtHrsLastTradeDateTimeLong',
  'ec'      : 'ExtHrsChange',
  'ecp'     : 'ExtHrsChangePercent',
  'pcls_fix': 'PreviousClosePrice',
  'op'      : 'Open',
  'hi'      : 'High',
  'lo'      : 'Low',
  'vo'      : 'Volume',
  'avvo'    : 'AverageVolume',
  'hi52'    : 'High52Week',
  'lo52'    : 'Low52Week',
  'mc'      : 'MarketCapitalization',
  'pe'      : 'PE',
  'fwpe'    : 'fwpe',
  'beta'    : 'Beta',
  'eps'     : 'EPS',
  'dy'      : 'DividendYield',
  'ldiv'    : 'LatestDividend',
  'shares'  : 'Shares',
  'instown' : 'InstitutionalOwnership',
  // 'eo'      : '',
  // 'sid'     : 'us-TRBC:57',
  'sname'   : 'SectorName',
  // 'iid'     : 'us-TRBC:5710601010',
  'iname'   : 'IndustryName',
  'name'    : 'Name',
  'management'  : 'Management',
  'keyratios' : 'KeyRatios',
  'kr_recent_quarter_date'  : 'KeyRatioRecentQuarterDate',
  'kr_annual_date'  : 'KeyRatioAnnualDate',

};
