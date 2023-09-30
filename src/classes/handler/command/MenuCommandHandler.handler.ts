import { Context, Markup } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { webUrl } from "../../../config";
import { Menu } from "../../../types/Menu.types";
import { convertAxiosErrorString, escapeMarkdownCharacters, getMenuDateText } from "../../../util";
import { Bot } from "../../Bot.class";
import { Logger } from "../../Logger.class";
import { DateMenuRequest } from "../../request/DateMenuRequest.request";
import { CommandHandler } from "./CommandHandler.handler";

/**
 * Command to get todays menus
 */

export class MenuCommandHandler extends CommandHandler {
  constructor(bot: Bot) {
    super(bot, "menu", "Menüs eines bestimmten Datums anzeigen");
  }

  public async event(ctx: Context<Update>): Promise<void> {
    try {
      const args: Array<string> = (((ctx.message as any).text as string) || "").split(" ").slice(1);
      let date: number | undefined = undefined;
      if (args.length > 0) {
        const split: Array<number> = args[0].split(".").map((value: string) => parseInt(value));
        if (split.length === 3 && !split.includes(NaN)) {
          const [day, month, year] = split;
          const parsedDay: string = day < 10 ? `0${day}` : day.toString();
          const parsedMonth: string = month < 10 ? `0${month}` : month.toString();
          const parsedDate: Date = new Date(`${parsedMonth}.${parsedDay}.${year}`);
          if (parsedDate instanceof Date && isNaN(parsedDate as any)) return await this.sendSelfDestroyingReply(ctx, escapeMarkdownCharacters(`Dies ist ein ungültiges Datum. Nutze "dd.MM.YYYY" als Format!`));
          if (parsedDate.getTime() > Date.now()) return await this.sendSelfDestroyingReply(ctx, `Dieses Datum befindet sich in der Zukunft`);
          date = parsedDate.getTime();
        } else return await this.sendSelfDestroyingReply(ctx, escapeMarkdownCharacters(`Dies ist ein ungültiges Datum. Nutze "dd.MM.YYYY" als Format!`));
      }

      const request: DateMenuRequest = new DateMenuRequest();
      const menus: Array<Menu> = await request.execute(date);
      const text: string = getMenuDateText(menus, date ? new Date(date) : new Date());
      const buttons = !!webUrl ? Markup.inlineKeyboard(menus.map(({ title, id }) => Markup.button.url(title, `${webUrl}/menu/${id}`))) : undefined;
      await ctx.reply(text, { parse_mode: "MarkdownV2", reply_markup: menus[0] ? buttons?.reply_markup : undefined });
    } catch (e) {
      Logger.error("An error occured whilst fetching menus for a given date", convertAxiosErrorString(e));
      await this.sendSelfDestroyingReply(ctx, "Es ist ein Fehler bei der Anfrage aufgetreten");
    }
  }

  public stop(): void | Promise<void> {}
}
