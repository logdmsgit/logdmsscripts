const axios = require("axios");
const prompts = require("prompts")
const { auth } = require("./auth");
const { returnAssetLinks } = require("./utils/functions");
const fs = require("fs");
const cliProgress = require('cli-progress');

let waitForResults = (payload, failedPayload, totalElements) => {
    if (Object.keys(payload).length === totalElements.length) {
        waitForResults(pay)
    }
}
let main = async (options) => {
    let res = await auth(options);
    if (res)
        if (res.success == true) {
            let assetTypeRes
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
            let urls = returnAssetLinks(assetTypeRes.assetType, podRes.pod);
            try {
                let initialApiTotal = await axios({
                    method: "get",
                    url: urls.idLink + '1',
                    headers: {
                        'authorization': 'Basic ' + res.key
                    }
                })

                let totalPages = Math.ceil(initialApiTotal.data.total / initialApiTotal.data.pageSize);
                let userKeys = {};

                try {
                    let userData = await axios({
                        method: "get",
                        url: `https://secure.p0${podRes.pod}.eloqua.com/api/REST/2.0/system/users`,
                        headers: {
                            'authorization': 'Basic ' + res.key
                        }
                    })
                    userData.data.elements.forEach(element => {
                        userKeys[element.id] = element.name;
                    })
                } catch (error) {
                    console.log(error);
                }

                let totalData = [];
                let pagesPromises = [];
                let n = 0;
                const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
                bar.start(totalPages, 0);
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
                            n++;
                            bar.update(n);
                            totalData = [...totalData, ...pageData.data.elements];
                        } catch (error) {
                        }
                    })())
                }
                await Promise.all(pagesPromises);
                totalData.forEach((el, key) => {
                    if (totalData[key]["createdBy"])
                        totalData[key]["userID"] = el["createdBy"]
                    else {
                        totalData[key]["userID"] = "N/A"
                        totalData[key]["createdBy"] = "N/A"
                        totalData[key]["updatedBy"] = "N/A"
                    }

                    if (Object.keys(userKeys).indexOf(totalData[key]["createdBy"]) >= 0)
                        totalData[key]["createdBy"] = userKeys[Object.keys(userKeys)[Object.keys(userKeys).indexOf(totalData[key]["createdBy"])]]
                    else
                        totalData[key]["createdBy"] = "N/A"


                    if (Object.keys(userKeys).indexOf(totalData[key]["updatedBy"]) >= 0)
                        totalData[key]["updatedBy"] = userKeys[Object.keys(userKeys)[Object.keys(userKeys).indexOf(totalData[key]["updatedBy"])]]
                    else
                        totalData[key]["updatedBy"] = "N/A"
                })

                let csvdata = "UserID\tcreatedBy\tType\tcurrentStatus\tId\tcreatedAt\tDepth\tName\tupdatedAt\tUpdatedBy\tsubject\n"


                totalData.forEach(item => {
                    if (item.userID)
                        csvdata += item["userID"];
                    else
                        csvdata += "NA";
                    if (item["createdBy"])
                        csvdata += "\t" + item["createdBy"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    if (item.type)
                        csvdata += "\t" + item["type"].replace('\t', '');
                    else
                        csvdata += "\tNA";
                    if (item.currentStatus)
                        csvdata += "\t" + item["currentStatus"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    if (item.id)
                        csvdata += "\t" + item["id"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    if (item.createdAt)
                        csvdata += "\t" + item["createdAt"].replace('\t', '');
                    else
                        csvdata += "\tNA"

                    if (item.depth)
                        csvdata += "\t" + item["depth"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    if (item.name)
                        csvdata += "\t" + item["name"].replace('\t', '');
                    else
                        csvdata += "\tNA"

                    if (item["updatedAt"])
                        csvdata += "\t" + item["updatedAt"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    if (item.updatedBy)
                        csvdata += "\t" + item["updatedBy"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    if (item.subject)
                        csvdata += "\t" + item["subject"].replace('\t', '');
                    else
                        csvdata += "\tNA"

                    csvdata += "\n"
                })
                bar.update(totalPages);
                bar.stop();
                fs.writeFileSync(pathRes.path, csvdata);
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

module.exports.assetReport = main;