import { Context, Markup } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { webUrl } from "../../../config";
import { Menu } from "../../../types/Menu.types";
import { convertAxiosErrorString, getMenuDateText } from "../../../util";
import { Bot } from "../../Bot.class";
import { Logger } from "../../Logger.class";
import { UpcomingMenusRequest } from "../../request/UpcomingMenusRequest.request";
import { CommandHandler } from "./CommandHandler.handler";

/**
 * Command to get all available upcoming menus
 */

export class UpcomingCommandHandler extends CommandHandler {
  constructor(bot: Bot) {
    super(bot, "upcoming", "Menüs der nächsten verfügbaren Tage anzeigen");
  }

  public async event(ctx: Context<Update>): Promise<void> {
    try {
      const request: UpcomingMenusRequest = new UpcomingMenusRequest();
      const menus: Array<Menu> = await request.execute();
      const datedMenus: { [key: string]: Array<Menu> } = {};
      menus.forEach((menu: Menu) => {
        if (Object.keys(datedMenus).includes(menu.date.toString())) datedMenus[menu.date] = [...datedMenus[menu.date], menu];
        else datedMenus[menu.date] = [menu];
      });

      const values: Array<Array<Menu>> = Object.values(datedMenus).sort((a: Array<Menu>, b: Array<Menu>) => {
        const dateA: number = a.find(({ date }) => date)?.date || 0;
        const dateB: number = b.find(({ date }) => date)?.date || 0;
        return dateA - dateB;
      });

      for (const menus of values) {
        const sorted: Array<Menu> = menus.sort((a: Menu, b: Menu) => a.channel - b.channel);
        const date: number | undefined = sorted.find(({ date }) => date)?.date;
        if (!date) return;
        const text: string = getMenuDateText(menus, new Date(date));
        const buttons = !!webUrl ? Markup.inlineKeyboard(menus.map(({ title, id }) => Markup.button.url(title, `${webUrl}/menu/${id}`))) : undefined;
        await ctx.reply(text, { parse_mode: "MarkdownV2", reply_markup: menus[0] ? buttons?.reply_markup : undefined });
      }
    } catch (e) {
      Logger.error("An error occured whilst fetching upcoming menus", convertAxiosErrorString(e));
      await this.sendSelfDestroyingReply(ctx, "Es ist ein Fehler bei der Anfrage aufgetreten");
    }
  }

  public stop(): void | Promise<void> {}
}
