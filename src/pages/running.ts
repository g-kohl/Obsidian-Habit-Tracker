import { App, TFile } from "obsidian";

const RUN_REGEX = /^- (\d{2}\/\d{2}) \| (\d{2},\d{2}) \| (\d{2}:\d{2}:\d{2}) \| (\d{2}:\d{2}) \| (\S+)/;

const TEXT = {
    RUNS: "- Corridas:",
    KMS: "- Km's totais:",
    KMS_PER_RUN: "- Km's por corrida:",
    TOTAL_TIME: "- Tempo total:",
    TIME_PER_RUN: "- Tempo por corrida:",
    AVERAGE_PACE: "- Pace médio:",
    LONGEST_RUN: "- Maior corrida:",
    FASTEST_PACE: "- Menor pace:"
} as const;

type Run = {
    date: string;
    km: number;
    time: string;
    pace: string;
    type: string;
}

type Stats = {
    runs: number;
    kms: number;
    kmsPerRun: number;
    totalTime: string;
    timePerRun: string;
    averagePace: string;
    longestRun: number;
    fastestPace: string;
};

export default class Running_Handler {
    app: App;
    runs: Run[];

    constructor(app: App) {
        this.app = app;
        this.runs = [];
    }

    async update(file: TFile) {
        const content = await this.app.vault.read(file);
        this.runs = [];

        this.parseContent(content);
        const stats = this.computeStats();
        this.updateContent(file, content, stats);
    }

    private parseContent(content: string) {
        const lines = content.split("\n");

        for (const l of lines) {
            if (!this.isRun(l))
                continue;

            const run = this.parseRun(l);
            this.runs.push(run);
        }
    }

    private isRun(s: string) {
        return /^- \d/.test(s);
    }

    private parseRun(run: string): Run {
        const match = run.match(RUN_REGEX);

        if (!match)
            throw new Error(`Invalid run format: ${run}`);

        let [, date, km, time, pace, type] = match;

        if (!date || !km || !time || !pace)
            throw new Error(`Invalid run format: ${run}`);
            
        if (!type)
            type = "";

        return {
            date,
            km: parseFloat(km.replace(",", ".")),
            time,
            pace,
            type
        }
    }

    private createStats(): Stats {
        return {
            runs: 0,
            kms: 0,
            kmsPerRun: 0,
            totalTime: "00:00:00",
            timePerRun: "00:00:00",
            averagePace: "00:00",
            longestRun: 0,
            fastestPace: "00:00"
        };
    }

    private computeStats(): Stats {
        const stats: Stats = this.createStats();

        for (const r of this.runs){
            stats.runs++;
            stats.kms += r.km;
            stats.totalTime = this.addTime(stats.totalTime, r.time);
        }

        stats.kmsPerRun = stats.kms / stats.runs;
        stats.timePerRun = this.getTimePerRun(stats.totalTime, stats.runs);
        stats.averagePace = this.getAveragePace(stats.totalTime, stats.kms);
        stats.longestRun = Math.max(...this.runs.map(r => r.km));

        const paces = this.runs.map(r => r.pace);
        stats.fastestPace = paces.reduce((best, current) => current < best ? current : best);

        return stats;
    }

    private timeToSeconds(time: string): number {
        const parts = time.split(":").map(Number);

        if (parts.length === 3) {
            const [h, m, s] = parts;

            if (h === undefined || m === undefined || s === undefined)
                throw new Error(`Invalid time format: ${time}`);

            return h * 3600 + m * 60 + s;
        } else {
            const [m, s] = parts;

            if (!m || !s)
                throw new Error(`Invalid time format: ${time}`);

            return m * 60 + s;
        }
    }

    private secondsToTime(seconds: number, format: "HH:MM:SS" | "MM:SS" = "HH:MM:SS"): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        const mm = String(m).padStart(2, "0");
        const ss = String(s).padStart(2, "0");

        if (format === "MM:SS")
            return `${mm}:${ss}`;

        const hh = String(h).padStart(2, "0");
        return `${hh}:${mm}:${ss}`;
    }

    private addTime(time1: string, time2: string){
        const total = this.timeToSeconds(time1) + this.timeToSeconds(time2);

        return this.secondsToTime(total);
    }

    private getTimePerRun(totalTime: string, runs: number){
        const average = Math.floor(this.timeToSeconds(totalTime) / runs);

        return this.secondsToTime(average);
    }

    private getAveragePace(totalTime: string, kms: number){
        const average = Math.floor(this.timeToSeconds(totalTime) / kms);

        return this.secondsToTime(average, "MM:SS");
    }

    private async updateContent(file: TFile, content: string, stats: Stats) {
        const lines = content.split("\n");

        for (let [i, l] of lines.entries()) {
            if (l.startsWith(TEXT.RUNS))
                lines[i] = `${TEXT.RUNS} ${stats.runs}`;

            else if (l.startsWith(TEXT.KMS))
                lines[i] = `${TEXT.KMS} ${stats.kms.toFixed(2)}`;

            else if (l.startsWith(TEXT.KMS_PER_RUN))
                lines[i] = `${TEXT.KMS_PER_RUN} ${stats.kmsPerRun.toFixed(2)}`;

            else if (l.startsWith(TEXT.TOTAL_TIME))
                lines[i] = `${TEXT.TOTAL_TIME} ${stats.totalTime}`;

            else if (l.startsWith(TEXT.TIME_PER_RUN))
                lines[i] = `${TEXT.TIME_PER_RUN} ${stats.timePerRun}`;

            else if (l.startsWith(TEXT.AVERAGE_PACE))
                lines[i] = `${TEXT.AVERAGE_PACE} ${stats.averagePace}`;

            else if (l.startsWith(TEXT.LONGEST_RUN))
                lines[i] = `${TEXT.LONGEST_RUN} ${stats.longestRun}`;

            else if (l.startsWith(TEXT.FASTEST_PACE))
                lines[i] = `${TEXT.FASTEST_PACE} ${stats.fastestPace}`;
        }

        const newContent = lines.join("\n");

        if (newContent !== content)
            await this.app.vault.modify(file, newContent);
    }
}