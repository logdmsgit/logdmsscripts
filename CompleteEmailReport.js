const axios = require("axios");
const prompts = require("prompts")
const { auth } = require("./auth");
const { returnAssetLinks } = require("./utils/functions");
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
            try {
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
            let urls = returnAssetLinks("emails2", 1);
            try {
                let initialApiTotal = await axios({
                    method: "get",
                    url: urls.idLink + '1',
                    headers: {
                        'authorization': 'Basic ' + res.key
                    }
                })

                let totalPages = Math.ceil(initialApiTotal.data.total / 100);
                let userKeys = {};

                try {
                    let userData = await axios({
                        method: "get",
                        url: `https://secure.p01.eloqua.com/api/REST/2.0/system/users`,
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

                for (let i = 0; i < totalPages; i++) {
                    pagesPromises.push((async () => {
                        try {
                            let pageData = await axios({
                                method: "get",
                                url: urls.idLink + (i + 1).toString() + '&depth=complete&count=100',
                                headers: {
                                    'authorization': 'Basic ' + res.key
                                }
                            })
                            console.log(i, pageData.data.total);
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

                let csvdata = "UserID\tUserName\tType\tcurrentStatus\tId\tcreatedAt\tDepth\tName\tupdatedAt\tUpdatedBy\tbounceBackEmail\temailFooterId\temailHeaderId\treplyToEmail\treplyToEmail\treplyToName\tsenderEmail\tsenderName\tsubject\tvirtualMTAId\n"


                totalData.forEach(item => {
                    if (item.userID)
                        csvdata += item["userID"].replace('\t', '');
                    else
                        csvdata += "NA"
                    if (item.createdBy)
                        csvdata += "\t" + item["createdBy"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    if (item.type)
                        csvdata += "\t" + item["type"].replace('\t', '');
                    else
                        csvdata += "\tNA"
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
                    //                 #if "permissions" in item:
                    // #  csvdata += "\t" + item["permissions"]
                    //                 #else:
                    // #  csvdata += "\tNA"
                    if (item.updatedAt)
                        csvdata += "\t" + item["updatedAt"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    if (item.updatedBy)
                        csvdata += "\t" + item["updatedBy"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    if (item.bounceBackEmail)
                        csvdata += "\t" + item["bounceBackEmail"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    if (item.emailFooterId)
                        csvdata += "\t" + item["emailFooterId"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    if (item.emailGroupId)
                        csvdata += "\t" + item["emailGroupId"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    if (item.emailHeaderId)
                        csvdata += "\t" + item["emailHeaderId"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    if (item.replyToEmail)
                        csvdata += "\t" + item["replyToEmail"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    if (item.replyToName)
                        csvdata += "\t" + item["replyToName"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    if (item.senderEmail)
                        csvdata += "\t" + item["senderEmail"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    if (item.senderName)
                        csvdata += "\t" + item["senderName"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    if (item.subject)
                        csvdata += "\t" + item["subject"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    if (item.virtualMTAId)
                        csvdata += "\t" + item["virtualMTAId"].replace('\t', '');
                    else
                        csvdata += "\tNA"
                    csvdata += "\n"
                })

                fs.writeFileSync(pathRes.path, csvdata);
                console.log("The files has been successfully saved to " + pathRes.path + ".")
            } catch (error) {
                console.log(error);
            }

        }
        else
            process.exit();
    else
        process.exit();
}

module.exports.completeEmailReport = main;