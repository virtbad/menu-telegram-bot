import { Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { Bot } from "../../Bot.class";
import { Logger } from "../../Logger.class";
import { Handler } from "../Handler.handler";

/**
 * Abstract command handler class to handle commands
 */

export abstract class CommandHandler extends Handler<Context<Update>> {
  /**
   * Command to handle
   */

  public readonly command: string;

  /**
   * Command description
   */

  public readonly description: string;

  constructor(bot: Bot, command: string, description: string) {
    super(bot);
    this.command = command;
    this.description = description;
    Logger.info(`Registered "${command}"-command handler`);
  }

  abstract event(ctx: Context<Update>): void;

  abstract stop(): void | Promise<void>;

  /**
   * Function to remove the initiator command if the handler was executed via the direct command
   *
   * @param bot bot instance
   *
   * @param ctx event context
   */

  protected async removeInitiatorCommand(ctx: Context<Update>): Promise<void> {
    if (this.initiatorMessageDestroyed === ctx.message?.message_id) return;
    const message: string = (ctx.message as any).text;
    if (message.startsWith(`/${this.command}`) && ctx.chat?.id && ctx.message?.message_id) {
      await this.bot.deleteMessageSave(ctx.chat.id, ctx.message?.message_id);
      this.initiatorMessageDestroyed = ctx.message.message_id;
    }
  }
}
