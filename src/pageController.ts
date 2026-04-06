import { App } from "obsidian";
import NF_Handler from "./pages/nf";
import ToDo_Handler from "pages/todo";

export default class PageController {
    app: App;
    NF_handler: NF_Handler;
    ToDo_handler: ToDo_Handler;

    constructor(app: App) {
        this.app = app;
        this.NF_handler = new NF_Handler(app);
        this.ToDo_handler = new ToDo_Handler(app);
    }

    updateCurrentPage() {
        const file = this.app.workspace.getActiveFile();

        if (!file) return;

        const currentPage = file.name;

        if (this.is_NF_page(currentPage))
            this.NF_handler.update(file);

        if (this.is_ToDo_page(currentPage))
            this.ToDo_handler.update(file);
    }

    is_NF_page(page: string) {
        return page.startsWith("NF");
    }

    is_ToDo_page(page: string) {
        return page.startsWith("To-Do");
    }
}