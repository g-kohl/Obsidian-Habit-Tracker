import { App, TFile } from "obsidian";

const CONFIG = {
    DAY_INFOS: 4,
    POSITIVE_VALUE: "Sim",
    NEGATIVE_VALUE: "Não",
} as const;

const DAY_REGEX = new RegExp(
    `${CONFIG.POSITIVE_VALUE}|${CONFIG.NEGATIVE_VALUE}`,
    "g"
);

const TEXT = {
    STREAK: "- Dias sem:",
    BEST_STREAK: "- Maior sequência sem:",
    SUCCESS_RATIO: "- Taxa de sucesso:",
    TOTAL: "- Total Não/Sim:",
} as const;

type Day = [boolean, boolean, boolean, boolean];

type Stats = {
    yes: number;
    no: number;

    streak: number;
    bestStreak: number;
    successRatio: number;
};

export default class NF_Handler {
    private app: App;
    private year: Day[] = [];

    constructor(app: App) {
        this.app = app;
    }

    async update(file: TFile) {
        const content = await this.app.vault.read(file);
        this.year = [];

        this.parseContent(content);
        const stats = this.computeStats();
        this.updateContent(file, content, stats);
    }

    private parseContent(content: string) {
        const lines = content.split("\n");

        for (const l of lines) {
            if (!this.isDay(l))
                continue;

            const day = this.parseDay(l);
            this.year.push(day);
        }
    }

    private isDay(s: string): boolean {
        return /^\d/.test(s);
    }

    private parseDay(day: string): Day {
        const match = day.match(DAY_REGEX);

        if (!match || match.length != CONFIG.DAY_INFOS)
            throw new Error(`Invalid day format: ${day}`);

        const newDay: Day = [false, false, false, false];

        for (let i = 0; i < CONFIG.DAY_INFOS; i++)
            newDay[i] = match[i] == CONFIG.POSITIVE_VALUE ? true : false;
       
        return newDay;
    }

    private computeStats(): Stats {
        const stats: Stats = this.createStats();

        for (const d of this.year) {
            if (d[0]) {
                stats.yes++;
                stats.streak = 0;
            }
            else {
                stats.no++;
                stats.streak++;
            }

            if (stats.streak > stats.bestStreak)
                stats.bestStreak = stats.streak;
        }

        stats.successRatio = stats.no / (stats.yes + stats.no);

        return stats;
    }

    private createStats(): Stats {
        return {
            yes: 0,
            no: 0,
            streak: 0,
            bestStreak: 0,
            successRatio: 0
        };
    }

    private async updateContent(file: TFile, content: string, stats: Stats) {
        const lines = content.split("\n");

        for (let [i, l] of lines.entries()) {
            if (l.startsWith(TEXT.STREAK))
                lines[i] = `${TEXT.STREAK} ${stats.streak}`;

            else if (l.startsWith(TEXT.BEST_STREAK))
                lines[i] = `${TEXT.BEST_STREAK} ${stats.bestStreak}`;

            else if (l.startsWith(TEXT.SUCCESS_RATIO))
                lines[i] = `${TEXT.SUCCESS_RATIO} ${stats.successRatio.toFixed(2)}`;

            else if (l.startsWith(TEXT.TOTAL))
                lines[i] = `${TEXT.TOTAL} ${stats.no}/${stats.yes}`;
        }

        const newContent = lines.join("\n");

        if (newContent !== content)
            await this.app.vault.modify(file, newContent);
    }
}