import type { Achievement } from "~/server/model/Achievement";
import type { Notifier } from "./NotifierInterface";
import type {
    ManualAchievement,
    ManualAchievementData,
} from "../AchievementController";
import { Player } from "~/server/model/Player";

export class DiscordWebhookNotifier implements Notifier {
    private readonly webhookURL: string;
    private readonly messageIdCache: Map<string, string>;

    constructor(webhookURL: string) {
        this.webhookURL = webhookURL;
        this.messageIdCache = new Map();
    }

    public async sendManualAchievementSubmissionNotification(
        achievement: ManualAchievement,
        submission: Achievement<ManualAchievementData>,
    ): Promise<void> {
        const player = await Player.findOneBy({
            uuid: submission.player,
        });
        let playerName = submission.player;
        if (player != null) {
            playerName = player.primaryName;
        }

        const messageId = await $fetch<{ id: string }>(this.webhookURL, {
            method: "POST",
            query: {
                wait: true,
            },
            body: {
                embeds: [
                    {
                        title: "New Achievement Submission",
                        description: `${achievement.name} _(${achievement.description[0]})_`,
                        fields: [
                            {
                                name: "Video Link",
                                value: submission.data.video,
                            },
                            {
                                name: "Notes",
                                value: submission.data.notes ?? "_no notes_",
                            },
                            {
                                name: "Link to backend",
                                value: "https://rrstats.currymaker.net/backend",
                            },
                        ],
                        author: {
                            name: playerName,
                        },
                    },
                ],
                username: "rrstats notifier",
                avatar_url: "https://rrstats.currymaker.net/favicon.png",
            },
        });
        this.messageIdCache.set(
            `${submission.player}-${submission.achievement}`,
            messageId.id,
        );
    }

    public async updateManualAchievementVerified(
        submission: Achievement<ManualAchievementData>,
    ): Promise<void> {
        const messageId = this.messageIdCache.get(
            `${submission.player}-${submission.achievement}`,
        );
        if (messageId == null) {
            return;
        }

        const lastMessage = await $fetch<{
            embeds: { fields: { name: string; value: string }[] }[];
        }>(`${this.webhookURL}/messages/${messageId}`);
        lastMessage.embeds[0].fields = [
            {
                name: "Verified",
                value: `:white_check_mark: <t:${submission.achievedAt[0] / 1000}>`,
            },
        ];

        await $fetch(`${this.webhookURL}/messages/${messageId}`, {
            method: "PATCH",
            body: lastMessage,
        });

        this.messageIdCache.delete(
            `${submission.player}-${submission.achievement}`,
        );
    }
}
