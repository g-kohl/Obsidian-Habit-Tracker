import { App, TFile } from "obsidian";
import NF from "./pages/nf";

export default class PageController {
    app: App;
    file: TFile | null;
    currentPage: string;

    NF_handler: NF;

    constructor(app: App){
        this.app = app;
    }

    getCurrentPage() {
        this.file = this.app.workspace.getActiveFile();

        if(this.file)
            this.currentPage = this.file.name;

        return;
    }

    updateCurrentPage(){
        if (this.currentPage.startsWith("NF"))
            this.NF_handler.update();
    }
}