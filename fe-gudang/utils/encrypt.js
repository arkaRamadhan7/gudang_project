const { randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } = require('crypto');

const algorithm = 'aes-256-cbc';
const password = process.env.TOKEN_SECRET;

if (!password) {
    throw new Error('TOKEN_SECRET environment variable is not defined');
}

const encrypt = (text) => {
    const iv = randomBytes(16);
    const salt = randomBytes(16);
    const key = pbkdf2Sync(password, salt, 100000, 32, 'sha512');
    const cipher = createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
        iv: `${iv.toString('hex')}:${salt.toString('hex')}`,
        encryptedText: encrypted
    };
};

const decrypt = (encryptedText, ivSalt) => {
    const [ivHex, saltHex] = ivSalt.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const salt = Buffer.from(saltHex, 'hex');

    const key = pbkdf2Sync(password, salt, 100000, 32, 'sha512');
    const decipher = createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};

module.exports = { encrypt, decrypt };
