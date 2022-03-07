'use strict';

const prompts = require('prompts');
const keytar = require('keytar')
const { default: axios } = require('axios');

let companyName = null;
let username = null;

let setNewPassword = async (prevData) => {

    let passwordRes = await prompts({
        type: 'text',
        name: 'password',
        message: 'Password:',
        validate: (value) => {
            return true;
        }
    })
    let accountString = `${prevData.companyName}\\${prevData.username}:${passwordRes.password}`;
    let buffer = new Buffer.alloc(accountString.length, accountString);
    let base64AccountString = buffer.toString('base64');

    var config = {
        method: 'get',
        url: 'https://login.eloqua.com/id',
        headers: {
            'Authorization': `Basic ${base64AccountString}`,
        }
    };

    return await axios(config)
        .then(function (response) {
            console.log(response, base64AccountString);
            keytar.setPassword("eloqua", `eloquaBase64~~${prevData.companyName}~~${prevData.username}`, base64AccountString)
            return {
                key: base64AccountString,
                success: true
            }
        })
        .catch(async function (error) {
            const response = await prompts([
                {
                    type: 'confirm',
                    name: 'tryAgain',
                    message: 'The saved account token is invalid. Do you want to reset the token by entering a new password?',
                    validate: (value) => {
                        return true;
                    }
                }]);
            if (response)
                if (response.tryAgain == true) {
                    return this.auth({}, true, { ...prevData });
                }
        });
}

module.exports.auth = async (options, hard_reset, prevData) => {
    console.log(options);
    if (prevData) {
        return await setNewPassword(prevData)
    }
    else {
        let currentAccountString = null;
        let res = await prompts([{
            type: 'text',
            name: 'companyName',
            message: 'Company Name:',
            validate: (value) => {
                return true;
            }
        }, {
            type: 'text',
            name: 'username',
            message: 'Username:',
            validate: (value) => {
                return true;
            }
        },]);
        companyName = res.companyName
        username = res.username;

        currentAccountString = await keytar.getPassword("eloqua", "eloquaBase64" + "~~" + companyName + '~~' + username)

        if (!currentAccountString || hard_reset || options.reset) {
            return await setNewPassword({ companyName, username })
        }
        else {
            var config = {
                method: 'get',
                url: 'https://login.eloqua.com/id',
                headers: {
                    'Authorization': `Basic ${currentAccountString}`,
                }
            };

            return await axios(config)
                .then(function (response) {
                    return {
                        key: currentAccountString,
                        success: true
                    }
                })
                .catch(async function (error) {
                    return setNewPassword({ companyName, username })
                });

        }
    }
}



// else
// if (options.company) {
//     currentAccountString = await keytar.getPassword("eloqua", "eloquaAccountString" + options.company)
//     currentStorePassword = await keytar.getPassword("eloqua", "eloquaStorePassword" + options.company);
//     companyName = options.company;
// }
// else if
//     (companyName) {
//     currentAccountString = await keytar.getPassword("eloqua", "eloquaAccountString" + companyName)
//     currentStorePassword = await keytar.getPassword("eloqua", "eloquaStorePassword" + companyName);
// }
// else
//     if (!options.company) {
//         let companyRes = await prompts([{
//             type: 'text',
//             name: 'companyName',
//             message: 'Company Name:',
//             validate: (value) => {
//                 return true;
//             }
//         },]);
//         companyName = companyRes.companyName

//         currentAccountString = await keytar.getPassword("eloqua", "eloquaAccountString" + companyName)
//         currentStorePassword = await keytar.getPassword("eloqua", "eloquaStorePassword" + companyName);
//     }
//     else
//         companyName = options.company;

// if (!currentAccountString || !currentStorePassword || (options.reset == true && passHardReset == false) || (hard_reset && passHardReset == false)) {
//     let response = await prompts(
//         [
//             {
//                 type: 'text',
//                 name: 'username',
//                 message: 'Username:',
//                 validate: (value) => {
//                     return true;
//                 }
//             },
//             {
//                 type: 'password',
//                 name: 'password',
//                 message: 'Password:',
//                 validate: (value) => {
//                     return true;
//                 }
//             },
//             {
//                 type: 'password',
//                 name: 'storePassword',
//                 message: 'Access Token Store Password:',
//                 validate: (value) => {
//                     if (value.length < 4)
//                         return "Please choose an Access Token Password with at least 4 characters."
//                     else
//                         return true;
//                 }
//             }]);
//     if (response.storePassword) {
//         let accountString = `${companyName}\\${response.username}:${response.password}`;
//         let buffer = new Buffer.alloc(accountString.length, accountString);
//         let base64AccountString = buffer.toString('base64');

//         await keytar.setPassword("eloqua", "eloquaAccountString" + companyName, JSON.stringify(encrypt(base64AccountString, md5(response.storePassword)), response.username));
//         await keytar.setPassword("eloqua", "eloquaStorePassword" + companyName, md5(response.storePassword));

//         return
//     }
//     else {
//         let currentAccountString = await keytar.getPassword("eloqua", "eloquaAccountString" + companyName);
//         let currentStorePassword = await keytar.getPassword("eloqua", "eloquaStorePassword" + companyName);

//         const response = await prompts([
//             {
//                 type: 'password',
//                 name: 'storePassword',
//                 message: 'Access Token Store Password:',
//                 validate: (value) => {
//                     return true;
//                 }
//             }]);
//         if (response.storePassword)
//             if (md5(response.storePassword) == currentStorePassword) {
//                 let decryptedAccountString = decrypt(JSON.parse(currentAccountString), md5(response.storePassword))
//                 return await axios({
//                     method: 'get',
//                     url: 'https://secure.p01.eloqua.com/api/REST/1.0/assets/landingPage/1',
//                     headers: {
//                         'authorization': `Basic ${decryptedAccountString}`,
//                     }
//                 }).then(res => {
//                     console.log("The Access Token store password is correct.");
//                     return { key: decryptedAccountString, success: true }
//                 }).catch(async e => {
//                     const response = await prompts([
//                         {
//                             type: 'confirm',
//                             name: 'tryAgain',
//                             message: 'The Access Token is invalid. Do you want to try again?',
//                             validate: (value) => {
//                                 return true;
//                             }
//                         }]);
//                     if (response.tryAgain == true) {
//                         return this.auth(options, true);
//                     }
//                     else {
//                         let response2 = await prompts([
//                             {
//                                 type: 'confirm',
//                                 name: 'tryAgain',
//                                 message: 'Do you want to sign in with other credentials?',
//                                 validate: (value) => {
//                                     return true;
//                                 }
//                             }]);
//                         if (response2.tryAgain == true) {
//                             return this.auth(options, true);
//                         }
//                         else {
//                             process.exit();
//                         }
//                     }

//                 })
//             }
//             else {
//                 const response = await prompts([
//                     {
//                         type: 'confirm',
//                         name: 'tryAgain',
//                         message: 'The password for the Access Token Store Password is incorrect. Do you want to try again?',
//                         validate: (value) => {
//                             return true;
//                         }
//                     }]);
//                 if (response.tryAgain == true) {
//                     return this.auth(options);
//                 }
//                 else {
//                     let response2 = await prompts([
//                         {
//                             type: 'confirm',
//                             name: 'tryAgain',
//                             message: 'Do you want to sign in with other credentials?',
//                             validate: (value) => {
//                                 return true;
//                             }
//                         }]);
//                     if (response2.tryAgain == true) {
//                         return this.auth(options, true);
//                     }
//                     else {
//                         process.exit();
//                     }
//                 }
//             }
//     }

// }