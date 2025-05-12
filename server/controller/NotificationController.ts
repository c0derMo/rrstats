import type { Achievement } from "../model/Achievement";
import type {
    ManualAchievement,
    ManualAchievementData,
} from "./AchievementController";
import { DiscordWebhookNotifier } from "./notifiers/DiscordWebhookNotifier";
import type { Notifier } from "./notifiers/NotifierInterface";
import consola from "consola";

const logger = consola.withTag("rrstats:notifications");

export default class NotificationController {
    private static notifiers: Notifier[] = [];

    public static initialize() {
        const config = useRuntimeConfig();
        if (config.discordWebhook !== "") {
            NotificationController.addNotifier(
                new DiscordWebhookNotifier(config.discordWebhook),
            );
        }
    }

    public static addNotifier(notifier: Notifier) {
        NotificationController.notifiers.push(notifier);
        logger.info(`Added ${notifier.constructor.name} notifier.`);
    }

    public static async sendManualAchievementSubmissionNotification(
        achievement: ManualAchievement,
        submission: Achievement<ManualAchievementData>,
    ): Promise<void> {
        const promises: Promise<void>[] = [];
        for (const notifier of NotificationController.notifiers) {
            promises.push(
                notifier.sendManualAchievementSubmissionNotification(
                    achievement,
                    submission,
                ),
            );
        }
        await Promise.allSettled(promises);
        logger.info("Sent manual achievement submission notification.");
    }

    public static async updateManualAchievementVerified(
        submission: Achievement<ManualAchievementData>,
    ): Promise<void> {
        const promises: Promise<void>[] = [];
        for (const notifier of NotificationController.notifiers) {
            promises.push(notifier.updateManualAchievementVerified(submission));
        }
        await Promise.allSettled(promises);
        logger.info("Sent manual achievement verified update.");
    }
}
