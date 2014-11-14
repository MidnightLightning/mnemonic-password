var assert = require('assert');

describe('Wordlist', function() {
  var words = require('../words');
  it('is unique for the first four letters', function() {
    var seen = {};
    words.map(function(el) {
      var prefix = el.label.substring(0,4);
      if (typeof seen[prefix] !== 'undefined') {
        assert.fail(el.label, seen[prefix], el.label+' has same prefix as '+seen[prefix]);
      } else {
        seen[prefix] = el.label;
      }
    });
  });
});
