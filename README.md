
A wordlist of 2048 words, each of which only needs the first 3 letters to be uniquely-identified (26*26*26 = 17,576 possibilities, which is more than enough, but two characters isn't enough). That mean each word stores 11 bits of data.

Creating a four-word "password", you can create 2048^4 = 17,592,186,044,416 (17.6 trillion) combinations; enough for everyone on the planet to have a few hundred. To be safer, creating a five-word password creates 36,028,797,018,963,968 (36 quadrillion), enough for everyone on the planet to have ~5 million passwords.

Five words is 55 bits of data. Splitting that into 50+5, you have 50 bits of entropy (1,125,899,906,842,624 (1.1 quadrillion) possibilities), and 5 bits for a checksum (every tenth bit). That helps prevent guessing at someone else's passphrase and the ability to validate the key without querying a database.


## References
* [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
