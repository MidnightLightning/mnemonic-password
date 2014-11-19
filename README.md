This library generates random phrases intended to be used on their own as both a username and password for an authentication system. Since humans are bad at creating and remembering truly random and secure passwords, but are good at remembering phrases and words, this library helps bridge that gap.

It is based on a list of words each assigned a value between 0 and 2047, allowing each word to represent an 11-bit number. The library can generate random numbers (or take random numbers from an input source) and convert them into a mnemonic phrase of words, and do the reverse. The wordlist is taken from the [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) English wordlist.

The wordlist of 2048 words contains words that only needs the first 4 letters of each word to uniquely-identify the word (some words are only three letters long, so the four-letter match includes "null" for a fourth letter option).

## Why five words?
Creating a four-word "password", you can create 2048^4 = 17,592,186,044,416 (17.6 trillion) combinations; enough for everyone on the planet to have a few hundred (maybe sufficient, but might collide if used disposably). To be safer, creating a five-word password creates 36,028,797,018,963,968 (36 quadrillion), enough for everyone on the planet to have ~5 million passwords.

However, five words is 55 bits of data. Splitting that into 50+5, you can have 50 bits of entropy (1,125,899,906,842,624 (1.1 quadrillion) possibilities), and 5 bits for a checksum (every tenth bit). That helps prevent guessing at someone else's passphrase and the ability to validate the key without querying a database. This effectively "throws out" 35/36 quadrillion possibilities as invalid in order to help users find their real passphrase, and help detect a malignant actor attempting to brute-force the system. This also drops the bit-length of the actual password to 50-bits, which is less than the Javascript range of "Safe Integers" (53-bits and below), which makes it easier to work with in systems that operate on double-precision floating-point numbers (like Javascript).

## Usage
The canonical form of the password is all lower-case letters, space-separated. For use in URLs, the canonical form is all lower-case words, hypen-separated. A compressed form is available as well, using only the first four characters of each word (all that's needed to be unique).

In the database, however, using a 64-bit (`BIGINT`, 8-byte) unsigned storage column, or a strictly 50-bit (`BIT(50)`) column can be used.

When matching an input string, the following steps are taken:

* Convert the string to lower-case.
* Replace any non-character strings with spaces.
* Replace any runs of multiple spaces with a single space.
* Take the first five space-separated words and attempt to match them in the wordlist.
* Only the first four characters of each word are used; matching the prefixes of the words in the wordlist.

## Methods
This library is packaged as a NodeJS module, and can be called from the command line directly, or embedded in other applications. When called directly from the command line, it will generate a new key if no arguments are given, or decode a key if one is given as the first argument to the script.

```sh
$ node main.js
{
  "value": 815383874737631,
  "numbers": [
    1503,
    1714,
    360,
    715,
    2030
  ],
  "string": "room stone code floor worry",
  "compact": "room ston code floo worr"
}

$ node main.js "basically smoothed engine shrimpy cardholder"
{
  "value": 365529985661080,
  "numbers": [
    152,
    1639,
    595,
    1593,
    276
  ],
  "string": "basic smooth engine shrimp card",
  "compact": "basi smoo engi shri card"
}
```

When included as a module, it returns an object that has a `decode()` and an `encode()` method:

```js
var mnem = require('mnemonic-password');
var key = mnem.encode(); // Create a new, random key
console.log(key.toString()); // e.g. "room stone code floor worry"

var key = mnem.decode("basically smoothed engine shrimpy cardholder");
console.log(key.toString()); // "basic smooth engine shrimp card"
```

### `encode(seed)`
If a seed is provided, that is used as the seed to generate a key from (e.g. `mnem.encode(815383874737631).toString()` will always be `room stone code floor worry`). If no seed is provided, a new key is created using the NodeJS `crypto.randomBytes()` method. If you are providing a key, ensure you are using as strong a random number generator as possible, and ensure the maximum range of your entropy source is 50-bits.

### `decode(key)`
Given a String key, will attempt to decode it into it base seed. Will return false if not a valid key.

### Mnemonic (Object)
The return value of both `encode()` and `decode()` is a `Mnemonic` object that has the following methods:

* `getValue()`: returns the 50-bit seed value as a Number
* `toArray()`: returns an Array of five numbers that represent this mnemonic's seed
* `toString()`: returns the canonical String form of this mnemonic (all lower-case, space-separated)
* `toCompact()`: returns the shortened String form of this mnemonic (all lower-case, only first four letters of each word)
* `toObj()`: returns a bare Object with `value`, `numbers`, `string`, and `compact` values for convenient access (this is what is echoed in JSON-form when used on the command line)

## Protection
Using a mnemnomic phrase as both a username and a password has some inherent risks that need to be considered before implementing. A brute-force attack can be done with various levels of sophistication by a malignant actor, which your authentication system should be set up to handle:

* Attacker assumes passphrases are created by the users (Like a traditional password): If an attack assumes this, they will likely attempt to log in with common lists of passwords ("12345", "password", "princess", etc.), which are not valid mnemnoic phrases at all.
* Attacker obtains the wordlist: An attack like this may pick random words from the word list and attempt them, which will likely fail the checksum check.
* Attacker uses the mnemonic library code: Feeding non-random numbers into the mnemonic generator would allow an attacker to iterate (or randomly skip through) the whole mnemonic namespace trying all valid mnemonic combinations.

So if your authentication system doesn't require a password or email address from your users, it is a best-practice to provide them an option to supply a password and/or email to activate basic two-factor authentication options (or implement HOTP/TOTP processes). Then if a user attempts to log into an account with one of those factors active, the system either emails the address on file, or prompts for a password to continue the login.
