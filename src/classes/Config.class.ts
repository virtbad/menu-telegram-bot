import { existsSync, readFileSync, writeFileSync } from "fs";

/**
 * Config class
 */

export class Config {
  private _token: string;
  private _selfDescructingTimeout: number;
  private _waitFoReplyTimeout: number;

  constructor() {
    this.readConfig();
  }

  /**
   * Function to read updated config values
   */

  private readConfig(): void {
    if (existsSync("config.json")) {
      const json: any = JSON.parse(readFileSync("config.json").toString());
      const jsonOrDefault = (key: string) => json[key] || this.asObject[key];
      if (typeof json === "object") {
        this._token = jsonOrDefault("token");
        this._selfDescructingTimeout = jsonOrDefault("selfDescructingTimeout");
        this._waitFoReplyTimeout = jsonOrDefault("waitFoReplyTimeout");
        this.writeConfig();
      } else throw new Error("Config file isn't an object");
    } else {
      this.writeConfig();
      throw new Error("Initialized a new config.json file with default values. Please add a valid telegram bot token!");
    }
  }

  /**
   * Function to update config values
   */

  private writeConfig(): void {
    writeFileSync("config.json", JSON.stringify(this.asObject, null, 2));
  }

  /**
   * Config as json object representation
   */

  public get asObject(): { [key: string]: any } {
    return {
      token: this._token || "BOT_TOKEN",
      selfDescructingTimeout: this._selfDescructingTimeout || 2000,
      waitFoReplyTimeout: this._waitFoReplyTimeout || 30000,
    };
  }

  /**
   * Telegram bot token
   */

  public get token(): string {
    this.readConfig();
    return this._token;
  }

  /**
   * Timeout for self destroying messages until destruction
   */

  public get selfDescructingTimeout(): number {
    this.readConfig();
    return this._selfDescructingTimeout;
  }

  /**
   * Timeout how long the bot waits for a forced reply until the action gets aborted
   */

  public get waitFoReplyTimeout(): number {
    this.readConfig();
    return this._waitFoReplyTimeout;
  }
}
