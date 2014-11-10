'use strict';

module.exports = {
  tokenize: tokenize,
  convert: convert
};

var classifiers = [
  {
    id: 'hundreds',
    forms: ['hundreds', 'hundred'],
    multiplier: 1e2
  },
  {
    id: 'thousands',
    forms: ['thousands', 'thousand'],
    multiplier: 1e3
  },
  {
    id: 'millions',
    forms: ['millions', 'million'],
    multiplier: 1e6
  },
  {
    id: 'billions',
    forms: ['billions', 'billion'],
    multiplier: 1e9
  }
];

/**
 * Spltits the string by classifiers
 * @param  {str} str Input string
 * @return {Object} object[classifier from classifiers]
 *                                    == number of such units
 */
function tokenize(str) {
  var result = {};
  var rem = str;

  for (var k = classifiers.length - 1; k >= 0; k--) {
    var cls = classifiers[k];
    var split = _processClassifier(rem, cls);
    if (split) {
      rem = split[1];
      result[cls.id] = split[0];
    }
  }

  if (rem) {
    result.units = rem;
  }

  return result;
}

/**
 * Processed the string using one of the classifiers
 * @param  {String} str Input string
 * @param  {Object} cls One of classifiers
 * @return {Array | Null} Null or split array
 */
function _processClassifier(str, cls) {
  for (var i = 0, l = cls.forms.length; i < l; i++) {
    var split = str.split(cls.forms[i]);

    if (split.length > 1) {
      return split.map(function(el) {
        return _normalize(el);
      });
    }
  }
  return null;
}

/**
 * Units anjusments
 * @param  {Str} str Input string
 * @return {Str} Formatted units
 */
function _normalize(str) {
  return str.replace(/\sand\s/, ' ').trim();
}

var units = {
  'one': 1,
  'two': 2,
  'three': 3,
  'four': 4,
  'five': 5,
  'six': 6,
  'seven': 7,
  'eight': 8,
  'nine': 9
};

var tens = {
  'ten': 10,
  'eleven': 11,
  'twelve': 12,
  'thirteen': 13,
  'fourteen': 14,
  'fifteen': 15,
  'sixteen': 16,
  'seventeen': 17,
  'eighteen': 18,
  'nineteen': 19,
  'twenty': 20,
  'thirty': 30,
  'fourty': 40,
  'fifty': 50,
  'sixty': 60,
  'seventy': 70,
  'eighty': 80,
  'ninety': 90
};

/**
 * Convert verbal numeric statement to a number
 * @param  {Object} obj object returned by 'tokenize'
 * @return {Number} Number
 */
function convert(obj) {
  var partial = {};

  for (var cls in obj) {
    var vAmount = obj[cls];

    partial[cls] = 0;

    // handle hundrers in MSBs
    var split = _processClassifier(vAmount, classifiers[0]);
    if (split) {
      console.log(split)
      partial[cls] += units[split[0]] * classifiers[0].multiplier;
      vAmount = split[1];
    }

    for (var t in tens) {
      if (vAmount.indexOf(t) !== -1) {
        partial[cls] += tens[t];
        vAmount = vAmount.split(t)[1].trim();
        break;
      }
    }

    if (!vAmount) continue;

    for (var u in units) {
      if (vAmount.indexOf(u) !== -1) {
        partial[cls] += units[u];
        break;
      }
    }
  }

  var res = 0;
  for (cls in partial) {
    for (var i = classifiers.length - 1; i >= 0; i--) {
      if (classifiers[i].id === cls) {
        res += partial[cls] * classifiers[i].multiplier;
        break;
      }
    }
  }
  return res + (partial.units || 0);
}
