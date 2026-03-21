import { App } from "obsidian";
import NF_Handler from "./pages/nf";

export default class PageController {
    app: App;
    NF_handler: NF_Handler;

    constructor(app: App) {
        this.app = app;
        this.NF_handler = new NF_Handler();
    }

    updateCurrentPage() {
        const file = this.app.workspace.getActiveFile();

        if (!file) return;

        const currentPage = file.name;

        if (this.is_NF_page(currentPage))
            this.NF_handler.update(this.app, file);
    }

    is_NF_page(page: string) {
        return page.startsWith("NF")
    }
}