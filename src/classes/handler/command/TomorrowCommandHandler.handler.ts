import { Context, Markup } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { webUrl } from "../../../config";
import { Menu } from "../../../types/Menu.types";
import { getMenuDateText } from "../../../util";
import { Bot } from "../../Bot.class";
import { DateMenuRequest } from "../../request/DateMenuRequest.request";
import { CommandHandler } from "./CommandHandler.handler";

/**
 * Command to get tomorrows menus
 */

export class TomorrowCommandHandler extends CommandHandler {
  constructor(bot: Bot) {
    super(bot, "tomorrow", "Menüs vom nächsten Tag anzeigen");
  }

  public async event(ctx: Context<Update>): Promise<void> {
    try {
      const request: DateMenuRequest = new DateMenuRequest();
      const date: number = Date.now() + 86400000;
      const menus: Array<Menu> = await request.execute(date);
      const buttons = !!webUrl ? Markup.inlineKeyboard(menus.map(({ title, id }) => Markup.button.url(title, `${webUrl}/menu/${id}`))) : undefined;
      const text: string = getMenuDateText(menus, new Date(date));
      await ctx.reply(text, { parse_mode: "MarkdownV2", reply_markup: menus[0] ? buttons?.reply_markup : undefined });
    } catch (e) {
      await this.sendSelfDestroyingReply(ctx, "Es ist ein Fehler bei der Anfrage aufgetreten");
    }
  }
  public stop(): void | Promise<void> {}
}
