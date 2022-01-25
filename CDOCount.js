const axios = require("axios");
const prompts = require("prompts")
const { auth } = require("./auth");
const { returnAssetLinks } = require("./utils/functions");
const ExcelJS = require('exceljs');
const fs = require("fs");

let waitForResults = (payload, failedPayload, totalElements) => {
    console.log(Object.keys(payload).length)
    if (Object.keys(payload).length === totalElements.length) {
        waitForResults(pay)
    }
}
let main = async (options) => {
    let res = await auth(options);
    if (res)
        if (res.success == true) {
            let pathRes;
            let podRes;
            try {
                podRes = await prompts([{
                    type: 'number',
                    name: 'pod',
                    message: 'POD Number: '
                },]);

                pathRes = await prompts([{
                    type: 'text',
                    name: 'path',
                    message: 'Saving Path: ',
                    validate: (value) => {
                        let isErr = false;
                        fs.access(value, err => {
                            if (err)
                                isErr = true;
                        })
                        if (isErr)
                            return false;
                        else
                            return true;
                    }
                },]);
            } catch (error) {

            }
            let urls = returnAssetLinks("customobjects", podRes.pod);
            try {
                let initialApiTotal = await axios({
                    method: "get",
                    url: urls.idLink + '1',
                    headers: {
                        'authorization': 'Basic ' + res.key
                    }
                })

                let totalPages = initialApiTotal.data.total / initialApiTotal.data.pageSize;
                let totalData = [];
                let pagesPromises = [];

                for (let i = 0; i < totalPages; i++) {
                    pagesPromises.push((async () => {
                        try {
                            let pageData = await axios({
                                method: "get",
                                url: urls.idLink + (i + 1).toString(),
                                headers: {
                                    'authorization': 'Basic ' + res.key
                                }
                            })
                            totalData = [...totalData, ...pageData.data.elements];
                        } catch (error) {
                        }
                    })())
                }
                await Promise.all(pagesPromises);

                let payload = {};
                let promises = [];
                for (let i = 0; i < totalData.length; i++) {
                    promises.push((async () => {
                        try {
                            let elementData = await axios({
                                method: "get",
                                url: "https://secure.p01.eloqua.com/api/REST/2.0/data/customObject/" + totalData[i].id + '/instances',
                                headers: {
                                    'authorization': 'Basic ' + res.key
                                }
                            })
                            payload[`${totalData[i].id}`] = [elementData.data.total, totalData[i].name]
                        } catch (error) {
                        }
                    })())
                }

                await Promise.all(promises)

                let csvdata = "CDO-ID\tCDO-Name\tTotal\n"

                Object.keys(payload).forEach(key => {
                    csvdata += key + "\t" + payload[key][1] + '\t' + payload[key][0] + '\n';
                })

                fs.writeFileSync(pathRes.path, csvdata);
                console.log("The file has been successfully saved to " + pathRes.path + ".")
            } catch (error) {
                console.log(error);
            }

        }
        else
            process.exit();
    else
        process.exit();
}

module.exports.cdoCount = main;