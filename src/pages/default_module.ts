import { App, TFile } from "obsidian";

export default class Default_Handler {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async update(file: TFile) {
        const content = await this.app.vault.read(file);

        this.parseContent(content);
        this.updateContent(file);
    }

    private parseContent(content: string) {

    }

    private async updateContent(file: TFile) {

    }
}