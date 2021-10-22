const { auth } = require("./auth")


let main = async () => {
    try {
        console.log(await auth());
    } catch (error) {
    }
}

main();