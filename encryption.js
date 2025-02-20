const crypto = require("crypto");
require("dotenv").config();

const secret_key = process.env.SECRET_KEY;
const secret_iv = process.env.SECRET_IV;
const ecnryption_method = process.env.ECNRYPTION_METHOD;

if (!secret_key || !secret_iv || !ecnryption_method) {
	throw new Error("secretKey, secretIV, and ecnryptionMethod are required");
}

// Generate secret hash with crypto to use for encryption
const key = crypto
	.createHash("sha512")
	.update(secret_key)
	.digest("hex")
	.substring(0, 32);
const encryptionIV = crypto
	.createHash("sha512")
	.update(secret_iv)
	.digest("hex")
	.substring(0, 16);

// Encrypt data
const encrypt = (data) => {
	const cipher = crypto.createCipheriv(ecnryption_method, key, encryptionIV);
	return Buffer.from(
		cipher.update(data, "utf8", "hex") + cipher.final("hex")
	).toString("base64"); // Encrypts data and converts to hex and base64
};

// Decrypt data
const decrypt = (encryptedData) => {
	const buff = Buffer.from(encryptedData, "base64");
	// Converts encrypted data to utf8
	const decipher = crypto.createDecipheriv(
		ecnryption_method,
		key,
		encryptionIV
	);
	return (
		decipher.update(buff.toString("utf8"), "hex", "utf8") +
		decipher.final("utf8")
	); // Decrypts data and converts to utf8
};

module.exports = {
	encrypt,
	decrypt,
};
