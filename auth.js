'use strict';

const prompts = require('prompts');
const keytar = require('keytar')
const crypto = require("crypto");
const md5 = require('md5');
const { default: axios } = require('axios');
const commandLineArgs = require('command-line-args')

const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);

const encrypt = (base64AccountString, storePassword, username) => {

    const cipher = crypto.createCipheriv(algorithm, storePassword, iv);

    const encrypted = Buffer.concat([cipher.update(base64AccountString), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex'),
        username
    };
};

const decrypt = (hash, storePassword) => {

    const decipher = crypto.createDecipheriv(algorithm, storePassword, Buffer.from(hash.iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

    return decrpyted.toString();
};

const optionsDefinitions = [
    { name: 'company', alias: 'c', type: String },
    { name: 'reset', alias: 'r', type: Boolean }
]

let companyName = null;

module.exports.auth = async (hard_reset) => {
    let passHardReset = false;
    const options = commandLineArgs(optionsDefinitions)
    let currentAccountString = null;
    let currentStorePassword = null;
    if (hard_reset == true) {
        let companyRes = await prompts([{
            type: 'text',
            name: 'companyName',
            message: 'Company Name:',
            validate: (value) => {
                return true;
            }
        },]);
        companyName = companyRes.companyName

        currentAccountString = await keytar.getPassword("eloqua", "eloquaAccountString" + companyName)
        currentStorePassword = await keytar.getPassword("eloqua", "eloquaStorePassword" + companyName);
        if (currentAccountString && currentStorePassword) {
            const response = await prompts([
                {
                    type: 'confirm',
                    name: 'tryAgain',
                    message: 'An Access Token for this Company is already saved. Do you want to insert other credentials?',
                    validate: (value) => {
                        return true;
                    }
                }]);
            if (response.tryAgain == true) {
                passHardReset = false;
            }
            else
                passHardReset = true;
        }
    }
    else
        if (options.company) {
            currentAccountString = await keytar.getPassword("eloqua", "eloquaAccountString" + options.company)
            currentStorePassword = await keytar.getPassword("eloqua", "eloquaStorePassword" + options.company);
            companyName = options.company;
        }
        else if
            (companyName) {
            currentAccountString = await keytar.getPassword("eloqua", "eloquaAccountString" + companyName)
            currentStorePassword = await keytar.getPassword("eloqua", "eloquaStorePassword" + companyName);
        }
        else
            if (!options.company) {
                let companyRes = await prompts([{
                    type: 'text',
                    name: 'companyName',
                    message: 'Company Name:',
                    validate: (value) => {
                        return true;
                    }
                },]);
                companyName = companyRes.companyName

                currentAccountString = await keytar.getPassword("eloqua", "eloquaAccountString" + companyName)
                currentStorePassword = await keytar.getPassword("eloqua", "eloquaStorePassword" + companyName);
            }
            else
                companyName = options.company;

    if (!currentAccountString || !currentStorePassword || (options.reset == true && passHardReset == false) || (hard_reset && passHardReset == false)) {
        let response = await prompts(
            [
                {
                    type: 'text',
                    name: 'username',
                    message: 'Username:',
                    validate: (value) => {
                        return true;
                    }
                },
                {
                    type: 'password',
                    name: 'password',
                    message: 'Password:',
                    validate: (value) => {
                        return true;
                    }
                },
                {
                    type: 'password',
                    name: 'storePassword',
                    message: 'Access Token Store Password:',
                    validate: (value) => {
                        if (value.length < 4)
                            return "Please choose a Access Token Password with at least 4 characters."
                        else
                            return true;
                    }
                }]);
        let accountString = `${companyName}\\${response.username}:${response.password}`;
        let buffer = new Buffer.alloc(accountString.length, accountString);
        let base64AccountString = buffer.toString('base64');

        await keytar.setPassword("eloqua", "eloquaAccountString" + companyName, JSON.stringify(encrypt(base64AccountString, md5(response.storePassword)), response.username));
        await keytar.setPassword("eloqua", "eloquaStorePassword" + companyName, md5(response.storePassword));

        return await axios({
            method: 'get',
            url: 'https://secure.p01.eloqua.com/api/REST/1.0/assets/landingPage/1',
            headers: {
                'authorization': `Basic ${base64AccountString}`,
            }
        }).then(res => {
            console.log("The access token has been securely saved.");
            return {
                key: base64AccountString,
                success: true
            }
        }).catch(async e => {
            const response = await prompts([
                {
                    type: 'confirm',
                    name: 'tryAgain',
                    message: 'The Access Token is invalid. Do you want to try again?',
                    validate: (value) => {
                        return true;
                    }
                }]);
            if (response.tryAgain == true) {
                return this.auth(true);
            }
            else {
                let response2 = await prompts([
                    {
                        type: 'confirm',
                        name: 'tryAgain',
                        message: 'Do you want to sign in with other credentials?',
                        validate: (value) => {
                            return true;
                        }
                    }]);
                if (response2.tryAgain == true) {
                    return this.auth(true);
                }
                else {
                    process.exit();
                }
            }

        })
    }

    else {
        let currentAccountString = await keytar.getPassword("eloqua", "eloquaAccountString" + companyName);
        let currentStorePassword = await keytar.getPassword("eloqua", "eloquaStorePassword" + companyName);

        const response = await prompts([
            {
                type: 'password',
                name: 'storePassword',
                message: 'Access Token Store Password:',
                validate: (value) => {
                    return true;
                }
            }]);
        if (md5(response.storePassword) == currentStorePassword) {
            let decryptedAccountString = decrypt(JSON.parse(currentAccountString), md5(response.storePassword))
            return await axios({
                method: 'get',
                url: 'https://secure.p01.eloqua.com/api/REST/1.0/assets/landingPage/1',
                headers: {
                    'authorization': `Basic ${decryptedAccountString}`,
                }
            }).then(res => {
                return { key: decryptedAccountString }
            }).catch(async e => {
                const response = await prompts([
                    {
                        type: 'confirm',
                        name: 'tryAgain',
                        message: 'The Access Token is invalid. Do you want to try again?',
                        validate: (value) => {
                            return true;
                        }
                    }]);
                if (response.tryAgain == true) {
                    return this.auth(true);
                }
                else {
                    let response2 = await prompts([
                        {
                            type: 'confirm',
                            name: 'tryAgain',
                            message: 'Do you want to sign in with other credentials?',
                            validate: (value) => {
                                return true;
                            }
                        }]);
                    if (response2.tryAgain == true) {
                        return this.auth(true);
                    }
                    else {
                        process.exit();
                    }
                }

            })
        }
        else {
            const response = await prompts([
                {
                    type: 'confirm',
                    name: 'tryAgain',
                    message: 'The password is Access Token Store Password is incorrect. Do you want to try again?',
                    validate: (value) => {
                        return true;
                    }
                }]);
            if (response.tryAgain == true) {
                return this.auth();
            }
            else {
                let response2 = await prompts([
                    {
                        type: 'confirm',
                        name: 'tryAgain',
                        message: 'Do you want to sign in with other credentials?',
                        validate: (value) => {
                            return true;
                        }
                    }]);
                if (response2.tryAgain == true) {
                    return this.auth(true);
                }
                else {
                    process.exit();
                }
            }
        }
    }

}