import { Context } from "telegraf";
import { Message } from "telegraf/typings/core/types/typegram";
import { Bot } from "../Bot.class";
import { Config } from "../Config.class";

/**
 * Abstract handler class for event handling
 */

export abstract class Handler<T extends Context<any>> {
  /**
   * Running bot instance
   */

  protected readonly bot: Bot;

  /**
   * Id of the initiator message if it was removed
   */

  protected initiatorMessageDestroyed?: number = undefined;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  /**
   * Event to be handled by the handler
   *
   * @param ctx event context
   */

  public abstract event(ctx: T): void;

  /**
   * Function called when the bot stops
   */

  public abstract stop(): Promise<void> | void;

  /**
   * Reply to an incoming message with a self destroying reply
   *
   * @default self destruction after 2000ms
   *
   * @param ctx context of the message
   *
   * @param message message to reply with
   *
   * @param victims messages which should additionally should be destroyed
   */

  public async sendSelfDestroyingReply(ctx: T, message: string, victims: Array<number> = []): Promise<void> {
    const chatId: number = ctx.chat.id;
    const msg: Message.TextMessage = await ctx.reply(message, {
      reply_to_message_id: !this.initiatorMessageDestroyed ? ctx.message?.message_id : undefined,
      parse_mode: "MarkdownV2",
    });

    setTimeout(() => {
      if (!this.initiatorMessageDestroyed) this.bot.deleteMessageSave(chatId, ctx.message?.message_id);
      this.bot.deleteMessageSave(chatId, msg.message_id);
      victims.forEach((id: number) => {
        if (id !== ctx.message?.message_id && id !== msg.message_id) {
          this.bot.deleteMessageSave(chatId, id);
        }
      });
    }, new Config().selfDescructingTimeout);
  }
}
