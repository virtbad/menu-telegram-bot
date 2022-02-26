import { User } from "@prisma/client";
import { Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { Bot } from "../../Bot.class";
import { CommandHandler } from "./CommandHandler.handler";

/**
 * Command to enable daily notifications
 */

export class SubscribeCommandHandler extends CommandHandler {
  constructor(bot: Bot) {
    super(bot, "subscribe", "Tägliche Benachrichtigungen einschalten");
  }

  public async event(ctx: Context<Update>): Promise<void> {
    if (!ctx.chat?.id) return;
    const user: User | null = await this.bot.prisma.user.findUnique({ where: { chatId: ctx.chat.id } });

    if (user?.notify) {
      this.sendSelfDestroyingReply(ctx, "Benachrichtigungen sind bereits eingeschaltet");
    } else {
      await this.bot.prisma.user.update({ where: { chatId: ctx.chat.id }, data: { notify: true } });
      this.sendSelfDestroyingReply(ctx, "Benachrichtigungen sind nun eingeschaltet");
    }
  }

  public stop(): void | Promise<void> {}
}
