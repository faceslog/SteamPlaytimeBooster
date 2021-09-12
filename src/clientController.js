const SteamUser = require("steam-user");
const Chalk = require("chalk");

class SteamClient extends SteamUser {

    static MaxGameForNormalAccount = 25;
    static MaxGameForLimitedAccount = 5;
    static GameCodeReg = /^\d+$/;

    #username;
    #password;
    #gameArray = [];
    
    constructor(username, password, gameArray)
    {
        super();
        this.#username = username;
        this.#password = password;
        this.#gameArray = gameArray; 
    }

    init()
    {
        this.logOn({ accountName: this.#username, password: this.#password });
        // Register event listeners
        this.on("loggedOn", () => { this.#login() });
        this.on("error", (err) => { this.#error(err) });
        this.on("accountLimitations", (isLimited, isBanned, isLocked) => { this.#handleAccountLimits(isLimited, isBanned, isLocked) });
        this.on("vacBans", (banCount, gameIds) => { this.#handleVacBans(banCount, gameIds) });
    }

    shutdown()
    {
        this.logOff();
        console.log(Chalk.white.bold.bgRed("Logout : Success !"));
        console.log(Chalk.white.bold.bgRed("Shutting Down ..."));
        process.exit(0);
    }
    
    #login()
    {
        console.log(Chalk.white.bold.bgGreen("Login : Success !"));
        this.setPersona(SteamUser.EPersonaState.Online);
        this.gamesPlayed(this.#gameArray);  
        console.log(Chalk.white.bold.bgGreen("Playing Game(s) : Success"));
    }

    #handleAccountLimits(isLimited, isBanned, isLocked)
    {
        if(isLimited && this.#gameArray.length > SteamClient.MaxGameForLimitedAccount)
        {
            console.log(Chalk.white.bold.bgRed(`This Account is Limited ! You can only add up to ${SteamClient.MaxGameForLimitedAccount} games`));
            // Keep only the first X games of the array and remove the others.
            this.#gameArray.slice(0, SteamClient.MaxGameForLimitedAccount);
            console.log(Chalk.white.bold.bgRed(`Keeping only the games ${JSON.stringify(this.#gameArray)} ...`));
        }
        else if(isBanned || isLocked)
        {
            console.log(Chalk.white.bold.bgRed("This Account is Banned ! Cannot proceed ..."));
            this.shutdown();
        }
    }

    #handleVacBans(banCount, gameIds)
    {
        if(banCount <= 0) return;

        console.log(Chalk.white.bold.bgRed("Removing VAC BAN Games"));
        // We keep only game where is not vac banned
        this.#gameArray = this.#gameArray.filter(game => !gameIds.includes(game))

        if(this.#gameArray.length <= 0)
        {
            console.log(Chalk.white.bold.bgRed("No more games left ! Exiting ...")); 
            this.shutdown();
        }
    }

    #error(err)
    {
        switch(err.eresult)
        {
            case SteamUser.EResult.InvalidPassword:
                console.log(Chalk.white.bold.bgRed("[ERROR] : Login Denied - Invalid Account Details"));
                this.shutdown();
                break;
            case SteamUser.EResult.AlreadyLoggedInElsewhere:
                console.log(Chalk.white.bold.bgRed("[ERROR] : Login Denied - Already Logged In Somewhere Else"));
                this.shutdown();
                break;
            case SteamUser.EResult.AccountLogonDenied: 
                console.log(Chalk.white.bold.bgRed("[ERROR] : Login Denied - SteamGuard is Required"));
                this.shutdown();
                break;
            default:
                console.log(Chalk.white.bold.bgRed("[ERROR] : Oops Something went wrong, restart and try again"));
                this.shutdown();
        }
    }
}

module.exports = { SteamClient };