import { App, TFile } from "obsidian";

export default class NF_Handler {
    table: Boolean[][];

    constructor() { }

    async update(app: App, file: TFile) {
        const content = await app.vault.read(file);

        this.computeStatistics(content);
        this.updateStatistics();
    }

    computeStatistics(content: string) {
        const splittedContent = content.split("##");

        for (let i = 1; i < splittedContent.length; i++) {
            const splittedMonth = splittedContent[i]?.split(".");
            console.log(splittedMonth);
        }

        // melhorar esse parsing. testar outra alternativa ao split... regex?
    }

    updateStatistics() {

    }
}