const SteamUser = require("steam-user");
const Chalk = require("chalk");

const SteamClient = class {

    #client;
    #username;
    #password;
    #gameArray;

    constructor(username, password, gameArray)
    {
        this.#client = new SteamUser();
        this.#username = username;
        this.#password = password;
        this.#gameArray = gameArray; 
    }

    init()
    {
        this.#client.logOn({ accountName: this.#username, password: this.#password });
        this.#client.on("error", (err) => { this.#error(err) });
    }

    shutdown()
    {

    }
    
    #login()
    {
        console.log(Chalk.white.bold.bgPinkBright("Login Success !"));
        this.#client.setPersona(SteamUser.EPersonaState.Online);
        client.gamesPlayed(this.#gameArray);  
    }

    #error(err)
    {
        switch(err.eresult)
        {
            case SteamUser.EResult.InvalidPassword:
                console.log(Chalk.red("[ERROR] : Login Denied - Invalid Account Details"));
                this.shutdown();
                break;
            case SteamUser.EResult.AlreadyLoggedInElsewhere:
                console.log(Chalk.red("[ERROR] : Login Denied - Already Logged In Somewhere Else"));
                this.shutdown();
                break;
            case SteamUser.EResult.AccountLogonDenied: 
                console.log(Chalk.red("[ERROR] : Login Denied - SteamGuard is Required"));
                this.shutdown();
                break;
            default:
                console.log(Chalk.red("[ERROR] : Oops Something went wrong, restart and try again"));
                this.shutdown();
        }
    }
}