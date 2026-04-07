import { App, TFile } from "obsidian";

const CONFIG = {
    DATE_INFOS: 3
};

type List = {
    today: string[];
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
};

export default class ToDo_Handler {
    app: App;
    private list: List

    constructor(app: App) {
        this.app = app;
        this.list = {
            today: [],
            shortTerm: [],
            mediumTerm: [],
            longTerm: []
        };
    }

    async update(file: TFile) {
        const content = await this.app.vault.read(file);

        this.parseContent(content);
        this.fixTerms();
        this.updateTerms();
    }

    private parseContent(content: string) {
        const lines = content.split("\n");

        for (const l of lines) {
            if (!this.isTask(l))
                continue;

            if (this.hasTerm(l)) {
                const term = this.getTerm(l);
                const termDate = new Date(term[2], term[1], term[0]);
            }
            else {
                this.list.longTerm.push(l);
            }
        }
    }

    private isTask(s: string) {
        return s.startsWith("-");
    }

    private hasTerm(s: string) {
        return s.match(/\b\d{2}\/\d{2}\/\d{2}\b/); // CORRIGIR
    }

    private getTerm(s: string) {
        const term = s.match(/\d{2}/); // CORRIGIR
        const intTerm: [number, number, number] = [0, 0, 0];

        if (!term || term.length != CONFIG.DATE_INFOS)
            throw new Error(`Invalid date format: ${s}`);

        for (let i = 0; i < CONFIG.DATE_INFOS; i++){
            const value = term[i];

            if(value == undefined)
                throw new Error(`Invalid date format: ${s}`);

            intTerm[i] = parseInt(value);
        }

        return intTerm;
    }


    private fixTerms() {

    }

    private async updateTerms() {

    }
}