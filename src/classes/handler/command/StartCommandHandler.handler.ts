import { User } from "@prisma/client";
import { Context, Markup } from "telegraf";
import { Message, Update } from "telegraf/typings/core/types/typegram";
import { escapeMarkdownCharacters } from "../../../util";
import { Bot } from "../../Bot.class";
import { Logger } from "../../Logger.class";
import { CommandHandler } from "./CommandHandler.handler";
import { HelpCommandHandler } from "./HelpCommandHandler.handler";

/**
 * Command for the initial start command
 */

export class StartCommandHandler extends CommandHandler {
  constructor(bot: Bot) {
    super(bot, "start", "Start Befehl");
  }

  public async event(ctx: Context<Update>): Promise<void> {
    if (!ctx.chat?.id) return;

    const user: User | null = await this.bot.prisma.user.findUnique({ where: { chatId: ctx.chat.id } });
    const subscribeButton = Markup.inlineKeyboard([[Markup.button.callback("Tägliche Benachrichtigungen einschalten", "subscribe")], [Markup.button.callback("Hilfe", "help")]]);
    const unsubscribeButton = Markup.inlineKeyboard([[Markup.button.callback("Tägliche Benachrichtigungen ausschalten", "unsubscribe")], [Markup.button.callback("Hilfe", "help")]]);
    const button = (!!user && user.notify) || !user ? unsubscribeButton : subscribeButton;
    const welcomeText: string = "*Willkommen beim MensaBot!*\nErfahre, welche Menüs die Mensa aktuell serviert, welche Menüs in der Vergangenheit serviert wurden und welche Menüs in naher Zukunft serviert werden.";
    const welcome: Message.TextMessage = await ctx.reply(escapeMarkdownCharacters(welcomeText, ["*"]), { parse_mode: "MarkdownV2", reply_markup: button.reply_markup });
    await this.removeInitiatorCommand(ctx);

    const addUser = async (chatId: number, notify: boolean = true) => {
      await this.bot.prisma.user.create({ data: { chatId: chatId, notify: notify } });
      Logger.info(`Added new user entry to the database`);
    };

    this.bot.bot.action("help", async (cbCtx: Context<Update>) => {
      cbCtx.answerCbQuery();
      const command: HelpCommandHandler = new HelpCommandHandler(this.bot);
      command.event(cbCtx);
    });

    this.bot.bot.action("unsubscribe", async (cbCtx: Context<Update>) => {
      cbCtx.answerCbQuery();
      if (!cbCtx.chat?.id) return;
      const user: User | null = await this.bot.prisma.user.findUnique({ where: { chatId: cbCtx.chat.id } });
      if (user && !user.notify) return await this.sendSelfDestroyingReply(cbCtx, "Benachrichtigungen sind bereits ausgeschaltet");
      if (!user) await addUser(cbCtx.chat.id, false);
      else await this.bot.prisma.user.update({ where: { chatId: cbCtx.chat.id }, data: { notify: false } });
      await this.bot.bot.telegram.editMessageText(cbCtx.chat.id, welcome.message_id, undefined, escapeMarkdownCharacters(welcomeText, ["*"]), { parse_mode: "MarkdownV2", reply_markup: subscribeButton.reply_markup });
      await this.sendSelfDestroyingReply(cbCtx, "Benachrichtigungen sind nun ausgeschaltet");
    });

    this.bot.bot.action("subscribe", async (cbCtx: Context<Update>) => {
      cbCtx.answerCbQuery();
      if (!cbCtx.chat?.id) return;
      const user: User | null = await this.bot.prisma.user.findUnique({ where: { chatId: cbCtx.chat.id } });
      if (user && user.notify) return await this.sendSelfDestroyingReply(cbCtx, "Benachrichtigungen sind bereits eingeschaltet");
      if (!user) await addUser(cbCtx.chat.id);
      else await this.bot.prisma.user.update({ where: { chatId: cbCtx.chat.id }, data: { notify: true } });
      await this.bot.bot.telegram.editMessageText(cbCtx.chat.id, welcome.message_id, undefined, escapeMarkdownCharacters(welcomeText, ["*"]), { parse_mode: "MarkdownV2", reply_markup: unsubscribeButton.reply_markup });
      await this.sendSelfDestroyingReply(cbCtx, "Benachrichtigungen sind nun eingeschaltet");
    });

    if (!user) await addUser(ctx.chat.id);
  }

  public stop(): void | Promise<void> {}
}
