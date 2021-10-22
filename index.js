const { auth } = require("./auth")
const { program } = require("commander")

program
    .option('-c, --company <company>', 'Specify the company.')
    .option('-r, --reset ', 'Reset the app.')


program
    .command("login")
    .action((e) => {
        auth(program.opts());
    })

program.parse(process.argv)