const aesjs = require("aes-js");

class HesabeCrypt {
  constructor(secret, iv) {
    this.key = secret;
    this.iv = iv;
  }

  encryptAes(txt) {
    const txtBytes = aesjs.padding.pkcs7.pad(aesjs.utils.utf8.toBytes(txt));
    const aesCbc = new aesjs.ModeOfOperation.cbc(this.key, this.iv);
    const encBytes = aesCbc.encrypt(txtBytes);
    const encHex = aesjs.utils.hex.fromBytes(encBytes);
    return encHex;
  }

  decryptAes(encHex) {
    const encBytes = aesjs.utils.hex.toBytes(encHex);
    const aesCbc = new aesjs.ModeOfOperation.cbc(this.key, this.iv);
    const decBytes = aesCbc.decrypt(encBytes);
    const decTxt = aesjs.utils.utf8.fromBytes(decBytes);
    const strippedTxt = this.pkcs5Strip(decTxt);
    return strippedTxt;
  }

  pkcs5Pad(data) {
    const blockSize = 32;
    const padLen = blockSize - (data.length % blockSize);
    const paddedTxt = data + this.strRepeat(String.fromCharCode(padLen), padLen);
    return paddedTxt;
  }

  pkcs5Strip(data) {
    const dataLen = data.length;
    if (dataLen < 32) {
      throw new Error('Invalid data length. Block size must be 32 bytes');
    }
    const padderCodeInt = parseInt(data.charCodeAt(dataLen - 1));
    if (padderCodeInt > 32) {
      throw new Error('PKCS#5 padding byte out of range');
    }
    const len = dataLen - padderCodeInt;
    const strippedTxt = data.substr(0, len);
    return strippedTxt;
  }

  strRepeat(input, multiplier) {
    let y = '';
    while (true) {
      if (multiplier & 1) {
        y += input;
      }
      multiplier >>= 1;
      if (multiplier) {
        input += input;
      } else {
        break;
      }
    }
    return y;
  }
}

module.exports = HesabeCrypt;
