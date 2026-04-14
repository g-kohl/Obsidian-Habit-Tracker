import { App, TFile } from "obsidian";

const CONFIG = {
    DATE_INFOS: 3,
    TODAY_TERM: 1,
    SHORT_TERM: 14,
    MEDIUM_TERM: 60
};

const TEXT = {
    TODAY_TERM: "# Hoje",
    SHORT_TERM: "# Curto prazo",
    MEDIUM_TERM: "# Médio prazo",
    LONG_TERM: "# Longo prazo",
    EMPTY_TASK: "- [ ] ."
};

type Tasks = {
    today: string[];
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
};

export default class ToDo_Handler {
    app: App;
    private list: Tasks = {
        today: [],
        shortTerm: [],
        mediumTerm: [],
        longTerm: []
    };

    private currentDate: Date = new Date();

    constructor(app: App) {
        this.app = app;
    }

    async update(file: TFile) {
        const content = await this.app.vault.read(file);
        this.resetState();

        this.parseContent(content);
        this.updateContent(file);
    }

    private parseContent(content: string) {
        const lines = content.split("\n");

        for (const l of lines) {
            if (!this.isTask(l))
                continue;

            if (this.hasTerm(l)) {
                const term = this.getTerm(l);
                const termDate = new Date(term[2] + 2000, term[1] - 1, term[0]);

                this.assignTerms(l, termDate);
            }
            else if (!this.isEmptyTask(l)) {
                this.list.longTerm.push(l);
            }
        }
    }

    private resetState() {
        this.list = {
            today: [],
            shortTerm: [],
            mediumTerm: [],
            longTerm: []
        };

        this.currentDate = new Date();
    }

    private isTask(s: string) {
        return s.startsWith("-");
    }

    private isEmptyTask(s: string) {
        return s.startsWith(TEXT.EMPTY_TASK);
    }

    private hasTerm(task: string) {
        return /\b\d{2}\/\d{2}\/\d{2}\b/.test(task);
    }

    private getTerm(task: string) {
        const match = task.match(/(\d{2})\/(\d{2})\/(\d{2})/);
        const intTerm: [number, number, number] = [0, 0, 0];

        if (!match)
            throw new Error(`Invalid date format: ${task}`);

        const [__, day, month, year] = match;

        if (!day || !month || !year)
            throw new Error(`Invalid date format: ${task}`);

        intTerm[0] = parseInt(day);
        intTerm[1] = parseInt(month);
        intTerm[2] = parseInt(year);

        return intTerm;
    }


    private assignTerms(task: string, term: Date) {
        const difference = (term.getTime() - this.currentDate.getTime()) / (1000 * 60 * 60 * 24);

        if (difference > -1 && difference <= 0) {
            this.list.today.push(task);
            return
        }

        if (difference < 0 && !this.isCompleted(task)) {
            this.list.today.push(task);
            return;
        }

        if (difference > 0 && difference <= CONFIG.TODAY_TERM) {
            this.list.today.push(task);
            return;
        }

        if (difference > CONFIG.TODAY_TERM && difference <= CONFIG.SHORT_TERM) {
            this.list.shortTerm.push(task);
            return;
        }

        if (difference > CONFIG.SHORT_TERM && difference <= CONFIG.MEDIUM_TERM) {
            this.list.mediumTerm.push(task);
            return;
        }

        if (difference > CONFIG.MEDIUM_TERM) {
            this.list.longTerm.push(task);
            return;
        }
    }

    private isCompleted(task: string) {
        return task.startsWith("- [x]");
    }

    private async updateContent(file: TFile) {
        let newContent = "";

        newContent = this.updateTerm(newContent, TEXT.TODAY_TERM, this.list.today);
        newContent = this.updateTerm(newContent, TEXT.SHORT_TERM, this.list.shortTerm);
        newContent = this.updateTerm(newContent, TEXT.MEDIUM_TERM, this.list.mediumTerm);
        newContent = this.updateTerm(newContent, TEXT.LONG_TERM, this.list.longTerm);

        await this.app.vault.modify(file, newContent);
    }

    private updateTerm(content: string, term_text: string, term_list: string[]) {
        content += `${term_text}`;

        if (term_list.length == 0)
            content += `\n${TEXT.EMPTY_TASK}`;
        else for (const task of term_list)
            content += `\n${task}`;

        content += "\n";

        return content;
    }
}