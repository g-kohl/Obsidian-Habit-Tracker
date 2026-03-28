import { App, TFile } from "obsidian";

const DAY_INFOS = 4;

type Stats = {
    yes: number;
    no: number;
    streak: number;
    bestStreak: number;
    succesRatio: number;
};

export default class NF_Handler {
    private year: [boolean, boolean, boolean, boolean][];

    constructor() { }

    async update(app: App, file: TFile) {
        const content = await app.vault.read(file);
        this.year = [];

        this.parseContent(content);
        const stats = this.computeStats();
        this.updateStats(app, file, content, stats);
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

            for (let i = 0; i < DAY_INFOS; i++) {
                newDay[i] = values[i] == "Sim" ? true : false;
            }

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
            succesRatio: 0
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

        stats.succesRatio = stats.no / (stats.yes + stats.no);

        return stats;
    }

    async updateStats(app: App, file: TFile, content: string, stats: Stats) {
        const lines = content.split("\n");

        lines[1] = `- Dias sem: ${stats.streak}`
        lines[2] = `- Maior sequência sem: ${stats.bestStreak}`;
        lines[3] = `- Taxa de sucesso: ${stats.succesRatio.toFixed(2)}`;

        const newContent = lines.join("\n");

        await app.vault.modify(file, newContent);
    }
}