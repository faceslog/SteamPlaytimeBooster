const ReadLineSync = require("readline-sync");
const Chalk = require("chalk");

const MaxGameIdle = 25;
const GameCodeReg = /^\d+$/;

function inputDetails(username, password, gameArray)
{
    username = ReadLineSync.question(Chalk.gray.bold('Username:'));
    password = ReadLineSync.question(Chalk.gray.bold('Password:'));

    console.log(Chalk.white.bold.bgMagentaBright("Let's Add your games code !"));
    console.log(Chalk.white.bold.bgMagentaBright("More Info at ()"));
    
    let n = "yes";
    let count = 0;

    while(n === "yes" && count <= MaxGameIdle)
    {
       let code = parseInt(ReadLineSync.question(Chalk.gray.bold('New Game Code: ')));
       
       if(GameCodeReg.test(code))
       {
            gameArray.push(code);
            count ++;
            console.log(Chalk.white.bold.bgGreen(`Game ${code} Successfully Added !`));
       }
       else
       {
            console.log(Chalk.white.bold.bgRed("Invalid Game Code !"));
            // Prompt the user if he want to continue if already added one game
            // or keep asking if no game is detected cos it wont work without at least 1 game code !
            if(count < 1) 
                continue;
       }      

       console.log("All games code added: %s", JSON.stringify(gameArray));
       n = ReadLineSync.question(Chalk.gray.bold('Would you like to continue (yes) / (no): '));
    }
}

function main() 
{
    console.log(Chalk.white.bold.bgMagentaBright("Steam Playtime Booster"));

    let username, password, gameArray = [];
    inputDetails(username, password, gameArray);
}

main();



