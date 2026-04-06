import { App, TFile } from "obsidian";

const DAY_INFOS = 4;
const POSITIVE_VALUE = "Sim";
const NEGATIVE_VALUE = "Não";

const STREAK_TEXT = "- Dias sem:";
const BEST_STREAK_TEXT = "- Maior sequência sem:";
const SUCCESS_RATIO_TEXT = "- Taxa de sucesso:";

type Stats = {
    yes: number;
    no: number;
    streak: number;
    bestStreak: number;
    successRatio: number;
};

export default class NF_Handler {
    app: App;
    private year: [boolean, boolean, boolean, boolean][];

    constructor(app: App) {
        this.app = app;
        this.year = [];
    }

    async update(file: TFile) {
        const content = await this.app.vault.read(file);
        this.year = [];

        this.parseContent(content);
        const stats = this.computeStats();
        this.updateStats(file, content, stats);
    }

    private parseContent(content: string) {
        const lines = content.split("\n");

        for (const l of lines) {
            if (!this.isDay(l))
                continue

            const values = l.match(/Sim|Não/gi);

            if (!values || values.length != DAY_INFOS)
                throw new Error(`Invalid day format: ${l}`);

            const newDay = this.createDay();

            for (let i = 0; i < DAY_INFOS; i++)
                newDay[i] = values[i] == POSITIVE_VALUE ? true : false;

            this.year.push(newDay);
        }
    }

    private createDay(): [boolean, boolean, boolean, boolean] {
        return [false, false, false, false];
    }

    private isDay(s: string) {
        return s.match(/^\d/);
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

    private computeStats() {
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

    private async updateStats(file: TFile, content: string, stats: Stats) {
        const lines = content.split("\n");

        for (let [i, l] of lines.entries()) {
            if (l.startsWith(STREAK_TEXT))
                lines[i] = `${STREAK_TEXT} ${stats.streak}`;

            else if (l.startsWith(BEST_STREAK_TEXT))
                lines[i] = `${BEST_STREAK_TEXT} ${stats.bestStreak}`;

            else if (l.startsWith(SUCCESS_RATIO_TEXT))
                lines[i] = `${SUCCESS_RATIO_TEXT} ${stats.successRatio.toFixed(2)}`;
        }

        const newContent = lines.join("\n");

        await this.app.vault.modify(file, newContent);
    }
}