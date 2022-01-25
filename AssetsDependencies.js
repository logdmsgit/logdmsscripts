const axios = require("axios");
const prompts = require("prompts")
const { auth } = require("./auth");
const { returnAssetLinks } = require("./utils/functions");
const cliProgress = require('cli-progress');
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
            let assetTypeRes
            let podRes
            try {
                assetTypeRes = await prompts([{
                    type: 'text',
                    name: 'assetType',
                    message: 'Asset Type: ',
                    validate: (value) => {
                        let possibleValues = ["microsites", "fieldmerges", "contactfields", "optionlists", "emailfooters", "emailheaders", "emailgroups", "contactlists", "emails", "forms", "landingpages", "segments", "programs", "campaigns", "customobjects"];
                        if (possibleValues.indexOf(value.toLowerCase().trim()) >= 0)
                            return true;
                        else
                            return false
                        //`The entered Asset Type is wrong. The possible values are: "microsites", "fieldmerges", "contactfields", "optionlists", "emailfooters", "emailheaders", "emailgroups", "contactlists", "emails", "forms", "landingpages", "segments", "programs", "campaigns", "customobjects".`
                    }
                },]);
            } catch (error) {

            }

            let pathRes;
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
            let urls = returnAssetLinks(assetTypeRes.assetType, podRes.pod);
            let n = 0;
            const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
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
                for (let i = 0; i < Math.ceil(totalPages); i++) {
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
                }
                bar.start(totalData.length, 0);

                let payload = {};
                let promises = [];
                for (let i = 0; i < totalData.length; i++) {
                    promises.push((async () => {
                        try {
                            let elementData = await axios({
                                method: "get",
                                url: urls.depLink + totalData[i].id + '/dependencies',
                                headers: {
                                    'authorization': 'Basic ' + res.key
                                }
                            })
                            payload[`${totalData[i].id}`] = [elementData.data, totalData[i].name]
                            n++;
                            bar.update(n);
                        } catch (error) {
                        }
                    })())
                }

                await Promise.all(promises)

                let csvdata = "AssetID\tAssetType\tType\tId\tDepth\tName\tDependencyType\n"

                Object.keys(payload).forEach(key => {
                    csvdata += key + "\t" + payload[key][1] + '\t';
                    if (payload[key][0] === "") {
                        csvdata += "NA\tNA\tNA\tNA\tNA\n"
                    }
                    else
                        payload[key][0].forEach((data, k) => {
                            if (k > 0)
                                csvdata += key + "\t" + payload[key][1] + '\t';
                            if (data["type"])
                                csvdata += data["type"]
                            else
                                csvdata += "NA"
                            if (data["id"])
                                csvdata += "\t" + data["id"]
                            else
                                csvdata += "\tNA"
                            if (data["depth"])
                                csvdata += "\t" + data["depth"]
                            else
                                csvdata += "\tNA"
                            if (data["name"])
                                csvdata += "\t" + data["name"]
                            else
                                csvdata += "\tNA"
                            if (data["DependencyType"])
                                csvdata += "\t" + data["DependencyType"]
                            else
                                csvdata += "\tNA"
                            csvdata += "\n"
                        })
                })
                fs.writeFileSync(pathRes.path, csvdata);
                bar.update(totalData.length);
                bar.stop();
                console.log("The file has been successfully saved to " + pathRes.path + ".")
            } catch (error) {
                bar.stop();
                console.log(error);
            }

        }
        else
            process.exit();
    else
        process.exit();
}

module.exports.assetDependencies = main;