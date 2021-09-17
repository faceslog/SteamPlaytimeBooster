const Chalk = require("chalk");
const Client = require("./src/clientController").SteamClient;
const ReadLineSync = require("readline-sync");
const Fs = require("fs");

/**
 * Ask the user to input the info needed to make the steam bot work
 * @param {Object} loginData { username: null, password: null, gameArray: []};
 * @returns {VoidFunction} Void
 */
function inputDetails(loginData)
{
     loginData.username = ReadLineSync.question(Chalk.gray.bold('Username:'));
     loginData.password = ReadLineSync.question(Chalk.gray.bold('Password:'), { hideEchoBack: true });
  
     console.log(Chalk.white.bold.bgMagenta(`Let's Add your games max (${Client.MaxGameForNormalAccount})`));
     console.log(Chalk.white.bold.bgMagenta("Please use their code, more info at (https://github.com/faceslog/SteamPlaytimeBooster)"));
      
     let n = "yes";
      
     while((n === "yes" || n === 'y') && loginData.gameArray.length <= Client.MaxGameForNormalAccount)
     {
         let code = parseInt(ReadLineSync.question(Chalk.gray.bold('New Game Code: ')));
         
         if(Client.GameCodeReg.test(code) && !loginData.gameArray.includes(code))
         {
            loginData.gameArray.push(code);
             console.log(Chalk.white.bold.bgGreen(`Game ${code} Successfully Added !`));
         }
         else if(loginData.gameArray.includes(code))
         {
             console.log(Chalk.white.bold.bgRed("Game Already Added !"));
         }
         else
         {
             console.log(Chalk.white.bold.bgRed("Invalid Game Code !"));
             // Prompt the user if he want to continue if already added one game
             // or keep asking if no game is detected cos it wont work without at least 1 game code !
             if(loginData.gameArray.length < 1) 
                 continue;
         }      
  
         console.log(Chalk.white.bold.bgMagenta("All games code added: %s"), JSON.stringify(loginData.gameArray));
         
         if(loginData.gameArray.length < Client.MaxGameForNormalAccount)
         {
             n = ReadLineSync.question(Chalk.gray.bold('Would you like to add another game ? (yes) | (no): '));
         }
         else
         {
             console.log(Chalk.white.bold.bgMagenta(`Cannot add more games ! Maximum Reached (${Client.MaxGameForNormalAccount})!`));
         }
     }
}

/**
 * Resolve a promise to check either the file given as argument exist or not
 * @param {String} filePath Path to the config File
 * @returns {Boolean} Boolean
 */
function doesFileExist(filePath) 
{     
     let flag = true;
     try
     {
         Fs.accessSync(filePath, Fs.constants.F_OK | Fs.constants.R_OK);
     }
     catch(e)
     {
         flag = false;
     }
 
     return flag;
}
 
/**
 * Create a config file for the SteamBot next time it will be launched and fills up the "loginData infos"
 * @param {String} filePath Path to the config File
 * @throws Throw an err if it fail to write / create the config file
 * @returns {VoidFunction} Void
 */
function createCfg(filePath)
{    
     let loginData = { username: null, password: null, gameArray: []};
     inputDetails(loginData);
 
     // Encore password in base64 (This is not an encryption !) it's just to prevent a bad timing and someone seeing the plain text 
     // password behind your shoulder in your configuration file
     let buffer = Buffer.from(loginData.password, "utf-8");
     loginData.password = buffer.toString('base64');
 
     Fs.writeFileSync(filePath, JSON.stringify(loginData));
}
  
/**
 * Check if the config file is properly setup, if all property exist and are not null
 * load the config file into the loginData object
 * @param {String} filePath Path to the config File
 * @param {Object} loginData { username: null, password: null, gameArray: []};
 * @throws Throw an exception if the config file is not setup properly !
 * @returns {VoidFunction} Void
 */
function loadCfg(filePath, loginData)
{
     const cfg = require(filePath);
 
     if(!cfg.hasOwnProperty("username")) throw "No username property found";
     if(!cfg.hasOwnProperty("password")) throw "No password property found";
     if(!cfg.hasOwnProperty("gameArray")) throw "No gameArray property found";
     
     if (cfg.username === null || cfg.username === "") throw "Empty password ...";
     if (cfg.password === null || cfg.password === "") throw "Empty password ...";
 
     const base64RegExp = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
     if(!base64RegExp.test(cfg.password)) throw "Password must be encoded in base64 ...";
 
     if (cfg.gameArray.length <= 0) throw "No Game Code found ...";
     // Set is a special data structure introduced in ES6 that stores a collection of unique values.
     // Since each value in a Set has to be unique, passing any duplicate item will be removed automatically
     let unique = Array.from(new Set(cfg.gameArray));
     // Array doesn't contain duplicates
     if(cfg.gameArray.length !== unique.length) throw "Duplicata in Game Code ...";
 
     loginData.username = cfg.username;
     // create a buffer
     let buffer = Buffer.from(cfg.password, "base64");
     // decode buffer as UTF-8
     loginData.password = buffer.toString("utf-8");
     loginData.gameArray = cfg.gameArray;

     return true;
}

function main() 
{
     const configFileName = "config.json";

     console.log(Chalk.white.bold.bgMagenta("Steam Playtime Booster"));
     console.log(Chalk.white.bold.bgMagenta(`Checking if config file: ${configFileName} exist ...`));

     if(!doesFileExist(configFileName))
     {
          console.log(Chalk.white.bold.bgMagenta("No config file found, asking for details and creating a new one ..."));
          
          try
          {
               createCfg(configFileName);
          }
          catch(err)
          {
               console.log((Chalk.red(err)));
               console.log(Chalk.white.bold.bgRed("Failed, Couldn't Create Config File !"));
               return 1;
          }

          console.log(Chalk.white.bold.bgGreen(`Config File Successfully Created !`));
     }
     
     let loginData = { username: null, password: null, gameArray: []};

     try 
     {
          console.log(Chalk.white.bold.bgMagenta("Trying To Load Config File ..."));
          loadCfg("./" + configFileName, loginData);
          console.log(Chalk.white.bold.bgGreen(`Config File Loaded !`));
     } 
     catch (err) 
     {
          console.log((Chalk.red(err)));  
          console.log(Chalk.white.bold.bgRed("Invalid Config File !"));
          return 1;
     }
     
     let client = new Client(loginData.username, loginData.password, loginData.gameArray);
     client.init();

     process.on('SIGINT', function() {
          console.log((Chalk.red("Terminating Process !")));  
          client.shutdown();
     });

     return 0;
}

main();



