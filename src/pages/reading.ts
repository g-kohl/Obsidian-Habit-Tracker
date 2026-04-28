import { App, TFile } from "obsidian";

type Stats = {
    days: number;
    books: number;
    pages: number;

    pagesPerDay: number;
    pagesPerBook: number;
};

export default class Reading_Handler {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async update(file: TFile) {
        const content = await this.app.vault.read(file);

        this.parseContent(content);
        const stats = this.computeStats();
        this.updateContent(file);
    }

    private parseContent(content: string) {
        const lines = content.split("\n");

        for (const l of lines) {
            
        }

        // contar livros
        // contar páginas
        // contar dias
    }

    private computeStats() {

    }

    private async updateContent(file: TFile) {

    }
}