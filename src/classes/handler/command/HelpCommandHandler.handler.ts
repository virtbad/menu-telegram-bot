import { Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { escapeMarkdownCharacters } from "../../../util";
import { Bot } from "../../Bot.class";
import { Handler } from "../Handler.handler";
import { CommandHandler } from "./CommandHandler.handler";

/**
 * Command to show all available commands
 */

export class HelpCommandHandler extends CommandHandler {
  constructor(bot: Bot) {
    super(bot, "help", "Hilfe zu den Befehlen");
  }

  public async event(ctx: Context<Update>): Promise<void> {
    let text: string = `*__Verfügbare Befehle__*:\n\n`;
    this.bot.handlers.forEach((handler: Handler<any>) => {
      if (handler instanceof CommandHandler) text += `*/${handler.command}* - ${handler.description}\n`;
    });

    await ctx.reply(escapeMarkdownCharacters(text, ["*", "_"]), { parse_mode: "MarkdownV2" });
  }

  public stop(): void | Promise<void> {}
}
