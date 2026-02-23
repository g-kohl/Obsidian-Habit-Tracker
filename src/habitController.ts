import { App, TFile } from "obsidian";

export default class HabitController {
    app: App;
    file: TFile | null;

    constructor(app: App){
        this.app = app;
    }

    updateCurrentHabit() {
        this.getCurrentHabit();
    }

    getCurrentHabit() {
        this.file = this.app.workspace.getActiveFile();
        console.log(this.file?.name);
    }
}