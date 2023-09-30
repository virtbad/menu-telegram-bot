import { PrismaClient, User } from "@prisma/client";
import cron from "node-cron";
import { Context, Markup, Telegraf } from "telegraf";
import { ChatMember, Update } from "telegraf/typings/core/types/typegram";
import { webUrl } from "../config";
import { Menu } from "../types/Menu.types";
import { convertAxiosErrorString, getMenuDateText } from "../util";
import { Config } from "./Config.class";
import { CommandHandler } from "./handler/command/CommandHandler.handler";
import { HelpCommandHandler } from "./handler/command/HelpCommandHandler.handler";
import { MenuCommandHandler } from "./handler/command/MenuCommandHandler.handler";
import { StartCommandHandler } from "./handler/command/StartCommandHandler.handler";
import { SubscribeCommandHandler } from "./handler/command/SubscribeCommandHandler.handler";
import { TomorrowCommandHandler } from "./handler/command/TomorrowCommandHandler.handler";
import { UnsubscribeCommandHandler } from "./handler/command/UnsubscribeCommandHandler.handler";
import { UpcomingCommandHandler } from "./handler/command/UpcomingCommandHandler.handler";
import { Handler } from "./handler/Handler.handler";
import { MessageHandler } from "./handler/message/MessageHandler.handler";
import { Logger } from "./Logger.class";
import { DateMenuRequest } from "./request/DateMenuRequest.request";

export class Bot {
  private _prisma: PrismaClient;
  private _bot: Telegraf;
  private _handlers: Array<Handler<any>> = [];
  private _waitingForReply: Map<[number, number], [(ctx: Context<Update>) => void, NodeJS.Timeout]> = new Map();

  constructor() {
    this._prisma = new PrismaClient();
    this._bot = new Telegraf(new Config().token);
    this.initialize();
  }

  /**
   * Prisma connection instance
   */

  public get prisma(): PrismaClient {
    return this._prisma;
  }

  /**
   * Telegram bot instance
   */

  public get bot(): Telegraf {
    return this._bot;
  }

  /**
   * All registered handlers
   */

  public get handlers(): Array<Handler<any>> {
    return this._handlers;
  }

  /**
   * Launch the bot and register all handlers
   */

  public async launch(): Promise<void> {
    this._handlers.forEach((handler: Handler<any>) => {
      if (handler instanceof CommandHandler) {
        this._bot.command(handler.command, (ctx) => {
          Logger.event(`Recieved "${handler.command}"-command event`);
          handler.event(ctx);
        });
      } else if (handler instanceof MessageHandler) {
        this._bot.hears(handler.message, (ctx) => {
          Logger.event(`Recieved "${handler.message}"-message event`);
          handler.event(ctx);
        });
      }
    });
    this._bot.on("message", (ctx) => {
      if (!!(ctx.message as any).reply_to_message) {
        const repliedId: number = (ctx.message as any).reply_to_message.message_id;
        this._waitingForReply.forEach(([handler, timeout], [chatId, messageId]) => {
          if (ctx.chat.id === chatId && repliedId === messageId) {
            clearTimeout(timeout);
            handler(ctx);
          }
        });
        this._waitingForReply.delete([ctx.chat.id, repliedId]);
      }
    });

    await this._prisma.$connect();
    Logger.info("Connected to the database");

    this._bot.launch();
  }

  /**
   * Method to savely delete a message
   *
   * @param chatId chat id of the message
   *
   * @param messageId id of the message
   */

  public async deleteMessageSave(chatId: number, messageId: number): Promise<void> {
    this.removeWaitingForReply(chatId, messageId);
    try {
      await this._bot.telegram.deleteMessage(chatId, messageId);
    } catch (e) {
      Logger.error(`Failed to delete message ${messageId} from chat ${chatId}`);
    }
  }

  /**
   * Add a message to the waiting for reply handler
   *
   * @param chat id of the chat
   *
   * @param id id of the message
   *
   * @param handler handler when the reply arrives
   *
   * @param timeout timeout until the action gets aborted
   *
   * @default defined in config
   */

  public addWaitingForReply(chat: number, id: number, handler: (ctx: Context<Update>) => void, timeout: number = new Config().waitFoReplyTimeout): void {
    const out = setTimeout(() => {
      this.removeWaitingForReply(chat, id);
      Logger.info(`Deleting message ${id} in chat ${chat}`);
      this.deleteMessageSave(chat, id);
    }, timeout);
    this._waitingForReply.set([chat, id], [handler, out]);
  }

  /**
   * Remove a message from the waiting for reply handler
   *
   * @param chat id of the chat
   *
   * @param id id of the message
   */

  public removeWaitingForReply(chat: number, id: number): void {
    if (this._waitingForReply.get([chat, id])) {
      clearTimeout(this._waitingForReply.get([chat, id]) as any[1]);
      this._waitingForReply.delete([chat, id]);
    }
  }

  /**
   * Method to send menu notifications to all subscribed chats
   */

  private async sendNotifications(): Promise<void> {
    try {
      const users: Array<User> = await this.prisma.user.findMany({ where: { notify: true, active: true } });
      const request: DateMenuRequest = new DateMenuRequest();
      const data: Array<Menu> = await request.execute();
      const text: string = getMenuDateText(data);

      if (data.length === 0) return Logger.info("Skipped daily notification as result of no daily menus");
      const buttons = !!webUrl ? Markup.inlineKeyboard(data.map(({ title, id }) => Markup.button.url(title, `${webUrl}/menu/${id}`))) : undefined;

      Promise.all(
        users.map(async (user: User) => {
          try {
            await this.bot.telegram.sendMessage(user.chatId, text, { parse_mode: "MarkdownV2", reply_markup: buttons?.reply_markup });
            Logger.info(`Sent daily notification to chat "${user.chatId}"`);
          } catch (e) {
            Logger.error(`Unable to send daily notification to chat "${user.chatId}"`, convertAxiosErrorString(e));
          }
        })
      );
    } catch (e) {
      Logger.error("Failed to notify subscribed chats", convertAxiosErrorString(e));
    }
  }

  /**
   * Add new event handler
   *
   * @param handler event handler to add
   */

  private addHandler(handler: Handler<any> | Array<Handler<any>>): void {
    Array.isArray(handler) ? this._handlers.push(...handler) : this._handlers.push(handler);
  }

  /**
   * Internal function to initialize the bot
   */

  private async initialize(): Promise<void> {
    this.addHandler(new StartCommandHandler(this));
    this.addHandler(new SubscribeCommandHandler(this));
    this.addHandler(new UnsubscribeCommandHandler(this));
    this.addHandler(new MenuCommandHandler(this));
    this.addHandler(new TomorrowCommandHandler(this));
    this.addHandler(new UpcomingCommandHandler(this));
    this.addHandler(new HelpCommandHandler(this));

    this.bot.on("my_chat_member", async (ctx: Context<Update>) => {
      if (!ctx.myChatMember) return;
      const status: ChatMember = ctx.myChatMember.new_chat_member;
      const exists: boolean = !!(await this.prisma.user.findUnique({ where: { chatId: ctx.chat?.id } }));
      if (!exists) return;
      await this.prisma.user.update({ where: { chatId: ctx.chat?.id }, data: { active: !(status.status === "left" || status.status === "kicked") } });
    });

    const cronTask = cron.schedule("0 0 6 * * *", () => this.sendNotifications(), { scheduled: true, timezone: "Europe/Zurich" }); // initialize cron task for daily notifications

    process.once("SIGINT", async () => {
      await Promise.all(this._handlers.map(async (handler: Handler<any>) => await handler.stop()));
      await this._prisma.$disconnect();
      cronTask.stop();
      this._bot.stop("SIGINT");
      Logger.info(`Stopping bot. Reason: SIGINT`);
      process.exit(0);
    });
    process.once("SIGTERM", async () => {
      await Promise.all(this._handlers.map(async (handler: Handler<any>) => await handler.stop()));
      await this._prisma.$disconnect();
      cronTask.stop();
      this._bot.stop("SIGTERM");
      Logger.info(`Stopping bot. Reason: SIGTERM`);
      process.exit(0);
    });
  }
}
