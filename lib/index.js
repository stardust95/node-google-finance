var assert = require('assert');
var os = require('os');
var util = require('util');

var _ = require('lodash');
var S = require('string');
var moment = require('moment');
var Promise = require('bluebird');

var _constants = require('./constants');
var _utils = require('./utils');

var DEFAULT_PAGE      = 0,
    DEFAULT_PAGE_SIZE = 10;

function _sanitizeCompanyNews(options) {
  assert(_.isPlainObject(options),
         '"options" must be a plain object.');
  assert(!_.isUndefined(options.symbol) || !_.isUndefined(options.symbols),
         'Either "options.symbol" or "options.symbols" must be defined.');
  assert(_.isUndefined(options.symbol) || _.isUndefined(options.symbols),
         'Either "options.symbol" or "options.symbols" must be undefined.');
  assert(_.isUndefined(options.error) || _.isBoolean(options.error),
         '"options.error" must be a boolean value');

  if (!_.isUndefined(options.symbol)) {
    assert((_.isString(options.symbol) && !_.isEmpty(options.symbol)),
           '"options.symbol" must be a non-empty string.');
  } else {
    assert((_.isArray(options.symbols) && !_.isEmpty(options.symbols)),
           '"options.symbols" must be a non-empty string array.');
  }
}


function _sanitizeQuotes(options) {
  assert(_.isPlainObject(options),
         '"options" must be a plain object.');
  assert(!_.isUndefined(options.symbol) || !_.isUndefined(options.symbols),
         'Either "options.symbol" or "options.symbols" must be defined.');
  assert(_.isUndefined(options.symbol) || _.isUndefined(options.symbols),
         'Either "options.symbol" or "options.symbols" must be undefined.');
  assert(_.isUndefined(options.error) || _.isBoolean(options.error),
         '"options.error" must be a boolean value');

  if (!_.isUndefined(options.symbol)) {
    assert((_.isString(options.symbol) && !_.isEmpty(options.symbol)),
           '"options.symbol" must be a non-empty string.');
  } else {
    assert((_.isArray(options.symbols) && !_.isEmpty(options.symbols)),
           '"options.symbols" must be a non-empty string array.');
  }
}

function _sanitizeHistorical(options) {
  assert(_.isPlainObject(options),
         '"options" must be a plain object.');
  assert(!_.isUndefined(options.symbol) || !_.isUndefined(options.symbols),
         'Either "options.symbol" or "options.symbols" must be defined.');
  assert(_.isUndefined(options.symbol) || _.isUndefined(options.symbols),
         'Either "options.symbol" or "options.symbols" must be undefined.');
  assert(_.isUndefined(options.error) || _.isBoolean(options.error),
         '"options.error" must be a boolean value');

  if (!_.isUndefined(options.symbol)) {
    assert((_.isString(options.symbol) && !_.isEmpty(options.symbol)),
           '"options.symbol" must be a non-empty string.');
  } else {
    assert((_.isArray(options.symbols) && !_.isEmpty(options.symbols)),
           '"options.symbols" must be a non-empty string array.');
  }

  if (_.isString(options.from) && !_.isEmpty(options.from)) {
    options.from = moment(options.from);
    assert(options.from.isValid(), '"options.from" must be a valid date string.');
  } else {
    assert(_.isDate(options.from) || _.isUndefined(options.from) || _.isNull(options.from),
           '"options.from" must be a date or undefined/null.');
    if (_.isDate(options.from)) {
      options.from = moment(options.from);
    }
  }

  if (_.isString(options.to) && !_.isEmpty(options.to)) {
    options.to = moment(options.to);
    assert(options.to.isValid(), '"options.to" must be a valid date string.');
  } else {
    assert(_.isDate(options.to) || _.isUndefined(options.to) || _.isNull(options.to),
           '"options.to" must be a date or undefined/null.');
    if (_.isDate(options.to)) {
      options.to = moment(options.to);
    }
  }

  if (!options.from || options.from.isBefore('1970-01-01')) {
    options.from = moment('1970-01-01');
  }

  if (!options.to) {
    options.to = moment({ hour: 0 });
  }

  assert((!options.from && !options.to) || !options.from.isAfter(options.to),
         '"options.to" must be be greater than or equal to "options.from".');
}

function _transformCompanyNews(symbol, data) {
  return _(data)
    .sortBy(function (item) {
      return item.date;
    })
    .map(function (item) {
      return {
        guid: item.guid,
        symbol: symbol,
        title: S(item.title).stripTags().trim().decodeHTMLEntities().s,
        description: S(item.description).stripTags().trim().decodeHTMLEntities().s,
        summary: S(item.summary).stripTags().trim().decodeHTMLEntities().s,
        date: item.date,
        link: item.link,
      };
    })
    .reverse()
    .value();
}

function _transformHistorical(symbol, data) {
  var headings = data.shift();
  return _(data)
    .reverse()
    .map(function (line) {
      var result = {};
      headings.forEach(function (heading, i) {
        var value = line[i];
        if (_.includes(['Volume'], heading)) {
          value = _utils.toInt(value, null);
        } else if (_.includes(['Open', 'High', 'Low', 'Close'], heading)) {
          value = _utils.toFloat(value, null);
        } else if (_.includes(['Date'], heading)) {
          value = _utils.toDate(value, null);
          if (value && !moment(value).isValid()) {
            value = null;
          }
        }
        result[_utils.camelize(heading)] = value;
      });
      result.symbol = symbol;
      return result;
    })
    .value();
}

function _transformQuotes(symbol, data){
  function _convert(data){
    var keyMap = _constants.googleFinanceKeyToFullName;
    var result = {};
    for(var prop in keyMap){
      if( data.hasOwnProperty(prop) ){
        if( data[prop].length === 0 ){
          data[prop] = "-";
        }
        result[keyMap[prop]] = data[prop];
      }
    }
    return result;
  }
  data = JSON.parse(data.replace("//", ""))[0];

  var result = _convert(data);

  if( Array.isArray(data['related']) ){
    result['Related'] = [];
    data['related'].forEach(function(item){
      result['Related'].push(_convert(item))
    });
  }
  if( Array.isArray(data['summary']) ){
    result['Summary'] = data['summary'][0]
  }
  return result;
}


function _transformMarketNews(data) {
  data = JSON.parse(data);
  if( data.hasOwnProperty('clusters') ){
    if( data.clusters.length > 0 ){
      return _(data.clusters)
        .map(function (item) {
          if( item.a.length > 0 ){
            item = item.a[0];
            return {
              title: item.t,
              description: item.sp,
              summary: item.sp,
              date: parseInt(item.tt) ? new Date(parseInt(item.tt)*1000).toISOString() : new Date(),
              link: item.u,
              source: item.s
            };
          }else{
            return {};
          }
        })
        .sortBy(function (item) {
          return item.date;
        })
        .reverse()
        .value();
    }
  }
  return [];
}



/**
 * get company news of one stock
 * @param {*} options
 * @param {*} optionalHttpRequestOptions
 * @param {*} cb
 */
function companyNews(options, optionalHttpRequestOptions, cb) {
  if (_.isUndefined(options)) { options = {}; }
  _sanitizeCompanyNews(options);

  if(optionalHttpRequestOptions && typeof optionalHttpRequestOptions == 'function') {
    cb = optionalHttpRequestOptions;
    optionalHttpRequestOptions = undefined;
  }

  var symbols = options.symbols || _.flatten([options.symbol]);

  return Promise.resolve(symbols)
    .map(function (symbol) {
      return Promise.resolve()
        .then(function () {

          var params = { output: 'rss', q: symbol, num: DEFAULT_PAGE_SIZE, start: DEFAULT_PAGE };

          if(!isNaN(options.page_size)) params.num = options.page_size;
          if(!isNaN(options.page)) params.start = (options.page - 1) * params.num;

          return _utils.downloadRSS(_constants.COMPANY_NEWS_URL, params, optionalHttpRequestOptions);
        })
        .then(function (data) {
          return _transformCompanyNews(symbol, data);
        })
        .catch(function (err) {
          if (options.error) {
            throw err;
          } else {
            return [];
          }
        });
    }, {concurrency: os.cpus().length})
    .then(function (results) {
      if (options.symbols) {
        return _.zipObject(symbols, results);
      } else {
        return results[0];
      }
    })
    .catch(function (err) {
      throw new Error(util.format('Failed to download data (%s)', err.message));
    })
    .nodeify(cb);
}


/**
 * get history data of one stock
 * @param {*} options
 * @param {*} optionalHttpRequestOptions
 * @param {*} cb
 */
function historical(options, optionalHttpRequestOptions, cb) {
  if (_.isUndefined(options)) { options = {}; }
  _sanitizeHistorical(options);

  if(optionalHttpRequestOptions && typeof optionalHttpRequestOptions == 'function') {
    cb = optionalHttpRequestOptions;
    optionalHttpRequestOptions = undefined;
  }

  var symbols = options.symbols || _.flatten([options.symbol]);

  return Promise.resolve(symbols)
    .map(function (symbol) {
      return Promise.resolve(_utils.getDateRanges(options.from, options.to))
        .map(function (range) {
          return Promise.resolve()
            .then(function () {
              return _utils.download(_constants.HISTORICAL_URL, {
                q: symbol,
                startdate: range.from.format('YYYY-MM-DD'),
                enddate: range.to.format('YYYY-MM-DD'),
                output: 'csv'
              }, optionalHttpRequestOptions);
            })
            .then(_utils.parseCSV)
            .then(function (data) {
              return _transformHistorical(symbol, data);
            })
            .catch(function (err) {
              if (options.error) {
                throw err;
              } else {
                return [];
              }
            });
        })
        .then(_.flatten);
    }, {concurrency: os.cpus().length})
    .then(function (results) {
      if (options.symbols) {
        return _.zipObject(symbols, results);
      } else {
        return results[0];
      }
    })
    .catch(function (err) {
      throw new Error(util.format('Failed to download data (%s)', err.message));
    })
    .nodeify(cb);
}


/**
 * get quotes of one stock
 * @param {*} options
 * @param {*} optionalHttpRequestOptions
 * @param {*} cb
 */
function quotes(options, optionalHttpRequestOptions, cb) {
  if (_.isUndefined(options)) { options = {}; }
  _sanitizeQuotes(options);

  if(optionalHttpRequestOptions && typeof optionalHttpRequestOptions == 'function') {
    cb = optionalHttpRequestOptions;
    optionalHttpRequestOptions = undefined;
  }

  var symbols = options.symbols || _.flatten([options.symbol]);

  return Promise.resolve(symbols)
    .map(function(symbol){
      return Promise.resolve()
        .then(function(){
          return _utils.download(_constants.QUOTES_URL, {
            output: 'json', q: symbol,
          }, optionalHttpRequestOptions);
        })
        .then(function(data){
          return _transformQuotes(symbol, data);
        })
        .catch(function(err){
          if (options.error) {
            throw err;
          } else {
            return {};
          }
        });
    }, {concurrency: os.cpus().length})
    .then(function (results) {
      if (options.symbols) {
        return _.zipObject(symbols, results);
      } else {
        return results[0];
      }
    })
    .catch(function (err) {
      throw new Error(util.format('Failed to download data (%s)', err.message));
    })
    .nodeify(cb);
}


function marketNews(options, optionalHttpRequestOptions, cb) {
  if (_.isUndefined(options)) { options = {}; }

  if(optionalHttpRequestOptions && typeof optionalHttpRequestOptions == 'function') {
    cb = optionalHttpRequestOptions;
    optionalHttpRequestOptions = undefined;
  }

  return Promise.resolve()
    .then(function(){
      var params = _.extend(options, { output: "json" });
      if( isNaN(options.page_size) ) params.page_size = DEFAULT_PAGE_SIZE;

      return _utils.download(_constants.MARKET_NEWS_URL, params, optionalHttpRequestOptions);
    })
    .then(function(data){
      return _transformMarketNews(data);
    })
    .catch(function (err) {
      throw new Error(util.format('Failed to download data (%s)', err.message));
    })
    .nodeify(cb);
}

exports.quotes = quotes;
exports.companyNews = companyNews;
exports.historical = historical;
exports.marketNews = marketNews;
