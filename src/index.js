const ReadLineSync = require("readline-sync");
const Chalk = require("chalk");
const Client = require("./clientController").SteamClient;

function inputDetails(inputData)
{
    inputData.username = ReadLineSync.question(Chalk.gray.bold('Username:'));
    inputData.password = ReadLineSync.question(Chalk.gray.bold('Password:'), { hideEchoBack: true });

    console.log(Chalk.white.bold.bgMagentaBright(`Let's Add your games max (${Client.MaxGameForNormalAccount})`));
    console.log(Chalk.white.bold.bgMagentaBright("Please use their code, more info at (https://github.com/faceslog/SteamPlaytimeBooster)"));
    
    let n = "yes";
    
    while((n === "yes" || n === 'y') && inputData.gameArray.length <= Client.MaxGameForNormalAccount)
    {
       let code = parseInt(ReadLineSync.question(Chalk.gray.bold('New Game Code: ')));
       
       if(Client.GameCodeReg.test(code) && !inputData.gameArray.includes(code))
       {
            inputData.gameArray.push(code);
            console.log(Chalk.white.bold.bgGreen(`Game ${code} Successfully Added !`));
       }
       else if(inputData.gameArray.includes(code))
       {
            console.log(Chalk.white.bold.bgRed("Game Already Added !"));
       }
       else
       {
            console.log(Chalk.white.bold.bgRed("Invalid Game Code !"));
            // Prompt the user if he want to continue if already added one game
            // or keep asking if no game is detected cos it wont work without at least 1 game code !
            if(inputData.gameArray.length < 1) 
                continue;
       }      

       console.log(Chalk.white.bold.bgMagentaBright("All games code added: %s"), JSON.stringify(inputData.gameArray));
       
       if(inputData.gameArray.length < Client.MaxGameForNormalAccount)
       {
            n = ReadLineSync.question(Chalk.gray.bold('Would you like to add another game ? (yes) | (no): '));
       }
       else
       {
            console.log(Chalk.white.bold.bgMagentaBright(`Cannot add more games ! Maximum Reached (${Client.MaxGameForNormalAccount})!`));
       }
    }
}

function main() 
{
    console.log(Chalk.white.bold.bgMagentaBright("Steam Playtime Booster"));

    let inputData = { username: null, password: null, gameArray: []}
    inputDetails(inputData);

    let client = new Client(inputData.username, inputData.password, inputData.gameArray);
    client.init();

    process.on('SIGINT', function() {
        console.log((Chalk.red("Terminating Process !")));  
        client.shutdown();
    });
}

main();



