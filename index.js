#!/usr/bin/env node

const { auth } = require("./auth")
const { program } = require("commander");
const { assetDependencies } = require("./AssetsDependencies");
const { cdoCount } = require("./CDOCount");
const { completeEmailReport } = require("./CompleteEmailReport");
const { assetReport } = require("./AssetsReport");

process.on('SIGINT', () => {
    console.log("The program has been terminated.");
    process.exit();
})

program
    .option('-c, --company <company>', 'Specify the company.')
    .option('-r, --reset ', 'Reset the app.')


program
    .command("login")
    .action((e) => {
        auth(program.opts());
    })
program
    .command("assetdependencies")
    .action((e) => {
        assetDependencies(program.opts());
    })
program
    .command("completeemailreport")
    .action((e) => {
        completeEmailReport(program.opts());
    })
program
    .command("assetreport")
    .action((e) => {
        assetReport(program.opts())
    })

program
    .command("cdocount")
    .action((e) => {
        cdoCount(program.opts())
    })
program.parse(process.argv)