import { User } from "@prisma/client";
import { Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { Bot } from "../../Bot.class";
import { CommandHandler } from "./CommandHandler.handler";

/**
 * Command to disable daily notifications
 */

export class UnsubscribeCommandHandler extends CommandHandler {
  constructor(bot: Bot) {
    super(bot, "unsubscribe", "Tägliche Benachrichtigungen ausschalten");
  }

  public async event(ctx: Context<Update>): Promise<void> {
    if (!ctx.chat?.id) return;
    const user: User | null = await this.bot.prisma.user.findUnique({ where: { chatId: ctx.chat.id } });

    if (!user?.notify) {
      this.sendSelfDestroyingReply(ctx, "Benachrichtigungen sind bereits ausgeschaltet");
    } else {
      await this.bot.prisma.user.update({ where: { chatId: ctx.chat.id }, data: { notify: false } });
      this.sendSelfDestroyingReply(ctx, "Benachrichtigungen sind nun ausgeschaltet");
    }
  }

  public stop(): void | Promise<void> {}
}
