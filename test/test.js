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

describe('Encoding', function() {
  var m = require('../main');
  describe('encodes known values', function() {
    it('encodes 0x00', function() {
      var key = m.encode(0x00);
      assert.equal(key.toArray().toString(), '0,0,0,0,0');
      assert.equal(key.toString(), 'abandon abandon abandon abandon abandon');
    });
    it('encodes 0x100200400801', function() { // All four words equal to "1"
      var key = m.encode(0x100200400801);
      assert.equal(key.toArray().toString(), '1,1,1,1,65');
      assert.equal(key.toString(), 'ability ability ability ability amused');
    });
    it('encodes 0x110240500C01', function() { // All four words equal to "1", plus maximum checksum
      var key = m.encode(0x110240500C01);
      assert.equal(key.toArray().toString(), '1025,513,257,129,1985');
      assert.equal(key.toString(), 'lens dizzy cage awake wealth');
    });
    it('encodes 0x10040100401', function() { // Maximum checksum set
      var key = m.encode(0x10040100401);
      assert.equal(key.toArray().toString(), '1025,512,256,128,1984');
      assert.equal(key.toString(), 'lens divorce cactus avoid way');
    });
    it('encodes 0x3F001FFC007FF', function() {
      var key = m.encode(0x3F001FFC007FF);
      assert.equal(key.toArray().toString(), '2047,0,2047,0,767');
      assert.equal(key.toString(), 'zoo abandon zoo abandon garment');
    });
    it('encodes 0x3FFFFFFFFFFFF', function() {
      var key = m.encode(0x3FFFFFFFFFFFF);
      assert.equal(key.toArray().toString(), '2047,2047,2047,2047,2047');
      assert.equal(key.toString(), 'zoo zoo zoo zoo zoo');
    });
  });
});
