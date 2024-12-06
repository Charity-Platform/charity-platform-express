const aesjs = require("aes-js");
const axios = require("axios");
const HesabeCrypt = require("./HesabeCrypt");
const dotenv = require("dotenv").config();

const { secretKey, ivKey, accessCode } = process.env;

const getEncryptedData = (data) => {
  console.log(secretKey, ivKey, accessCode);
  if (data) {
    const key = aesjs.utils.utf8.toBytes(secretKey);
    const iv = aesjs.utils.utf8.toBytes(ivKey);

    const instance = new HesabeCrypt(key, iv);

    const text = data;
    const encrypted = instance.encryptAes(JSON.stringify(text));
    const encryptedData = encrypted;

    return encryptedData; // Encryption Result
  }
};

// Pass the data to Decrypt
const getDecryptData = (data) => {
  if (data) {
    const key = aesjs.utils.utf8.toBytes(secretKey);
    const iv = aesjs.utils.utf8.toBytes(ivKey);

    const instance = new HesabeCrypt(key, iv);

    const decrypted = instance.decryptAes(data);
    const decryptedData = JSON.parse(decrypted);

    return decryptedData; // Decryption Result
  }
};

const postPaymentData = async (data) => {
  try {
    const encryptedResults = getEncryptedData(data);
    const response = await axios.post(
      "https://api.hesabe.com/checkout",
      {
        data: encryptedResults,
      },
      {
        headers: {
          accessCode: accessCode,
          "Content-Type": "application/json",
        },
      }
    );

    if (response && response.status === 200) {
      const decryptedResults = getDecryptData(response.data);
      const responseDate = decryptedResults.response.data;
      const redirectUrl = `https://api.hesabe.com/payment?data=${responseDate}`;
      return redirectUrl;
    }
  } catch (error) {
    if (error && error.response) {
      const errorMessage = getDecryptData(error.response.data);
      if (errorMessage) {
        console.error(errorMessage);
      }
    }

    // If an error occurred and you want to propagate it, you can rethrow it
    throw error;
  }
};

module.exports = {
  getEncryptedData,
  getDecryptData,
  postPaymentData,
};
