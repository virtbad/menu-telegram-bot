import { Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { Bot } from "../../Bot.class";
import { Logger } from "../../Logger.class";
import { Handler } from "../Handler.handler";

/**
 * Abstract message handler class to handle matching messages in the telegram chat
 */

export abstract class MessageHandler extends Handler<Context<Update>> {
  /**
   * Pattern witch wich the handler matches a message
   */

  public readonly message: string | RegExp;

  constructor(bot: Bot, message: string | RegExp) {
    super(bot);
    this.message = message;
    Logger.info(`Registered "${message}"-message handler`);
  }

  abstract event(ctx: Context<Update>): void;

  abstract stop(): void | Promise<void>;
}
