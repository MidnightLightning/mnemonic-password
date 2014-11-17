var words = require('./words');
var crypto = require('crypto');


var wordMap = {};
for (var i = 0; i < words.length; i++) {
  wordMap[words[i].value] = words[i].label;
}

/**
 * Read a 50-bit unsigned integer from a Node Buffer object at a given offset
 * @param {Buffer} buf
 * @param {Number} offset
 * @return {Number}
 */
var readUInt50BE = function(buf, offset) {
  offset = offset | 0;
  var int = buf[offset];
  var mask;
  for (var i = 1; i < 7; i++) {
    mask = (i == offset+6)? 0x03 : 0xFF;
    int += (buf[offset+i] & mask) * Math.pow(2, 8*i);
  }
  return int;
};

/**
 * Given a large number, read an 11-bit number from the given bit offset
 * @param {Number} num
 * @param {Number} bitOffset
 * @return {Number}
 */
var readUInt11BE = function(num, bitOffset) {
  var shifted = (bitOffset === 0)? num+0 : Math.floor(num / Math.pow(2, bitOffset));
  return shifted & 0x7FF;
};

/**
 * Take a 50-bit seed number and split it into 11-bit numbers
 * @param {Number} seed
 */
var seedToNumbers = function(seed) {
  var out = [];
  for (var i = 0; i < 5; i++) {
    var chunk = readUInt11BE(seed, i*11);
    out.push(chunk);
  }
  var check = calcChecksum(seed) << 6;
  out[4] = out[4] | check;
  return out;
};

/**
 * Given a 50-bit number, calculate a checksum by taking every tenth bit
 * @param {Number} seed
 * @return {Number}
 */
var calcChecksum = function(seed) {
  var check = 0;
  for (var i = 0; i < 5; i++) {
    var bitOffset = i*10;
    var shifted = (bitOffset === 0)? seed+0 : Math.floor(seed / Math.pow(2, bitOffset));
    var checkBit = shifted & 1;
    check = check | (checkBit << i);
  }
  return check;
};

/**
 * Given an array of 11-bit numbers, translate into an array of words from the wordlist
 * @param {Array[Number]} numbers
 * @return {Array[String]}
 */
var numbersToWords = function(numbers) {
  var out = [];
  for (var i = 0; i < numbers.length; i++) {
    out.push(wordMap[numbers[i]]);
  }
  return out;
};
/**
 * Given a 50-bit number, translate to an array of words from the wordlist
 * @param {Number} seed
 * @return {Array[String]}
 */
var seedToWords = function(seed) {
  return numbersToWords(seedToNumbers(seed));
};

/**
 * Given an array of 11-bit numbers, translate into a compact string
 * @param {Array[Number]} numbers
 * @param {String} glue
 * @return {String}
 */
var numbersToCompact = function(numbers, glue) {
  if (typeof glue === 'undefined') {
    glue = ' ';
  }
  return numbersToWords(numbers).map(function(el) {
    return el.substring(0,4);
  }).join(glue);
};
/**
 * Given a 50-bit number, translate into a compact string
 * @param {Number} seed
 * @param {String} glue
 * @return {String}
 */
var seedToCompact = function(seed, glue) {
  return numbersToCompact(seedToNumbers(seed), glue);
};

/**
 * Given an array of 11-bit numbers, translate into a string
 * @param {Array[Number]} numbers
 * @param {String} glue
 * @return {String}
 */
var numbersToString = function(numbers, glue) {
  if (typeof glue === 'undefined') {
    glue = ' ';
  }
  return numbersToWords(numbers).join(glue);
};
/**
 * Given a 50-bit number, translate into a string
 * @param {Number} seed
 * @param {String} glue
 * @return {String}
 */
var seedToString = function(seed, glue) {
  return numbersToString(seedToNumbers(seed), glue);
};

/**
 * Create 50 bits of random data
 * @return {Number}
 */
var generateSeed = function() {
  return readUInt50BE(crypto.randomBytes(8));
};



function Mnemonic(initialValue) {
  this.value = 0;
  this.numbers = [];
  if (typeof initialValue !== 'undefined') this.setValue(initialValue);
}
Mnemonic.prototype.setValue = function(val) {
  this.value = val;
  this.numbers = this.toArray();
};
Mnemonic.prototype.getValue = function() {
  return this.value;
};
Mnemonic.prototype.toArray = function() {
  return seedToNumbers(this.value);
};
Mnemonic.prototype.toString = function(glue) {
  return numbersToString(this.numbers, glue);
};
Mnemonic.prototype.toCompact = function(glue) {
  return numbersToCompact(this.numbers, glue);
};
Mnemonic.prototype.toObj = function() {
  return {
    value: this.value,
    numbers: this.toArray(),
    string: this.toString(),
    compact: this.toCompact()
  };
};
Mnemonic.prototype.toJSON = function() {
  return JSON.stringify(this.toObj());
};


var out = {
  encode: function(seed) {
    if (typeof seed === 'undefined') {
      seed = generateSeed();
    }
    return new Mnemonic(seed);
  }
};

if (require.main === module) {
  // Run from command line
  console.log(JSON.stringify(out.encode().toObj(), null, 2));
} else {
  module.exports = out;
}
