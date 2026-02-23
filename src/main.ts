import { Plugin } from "obsidian";
import HabitController from "./habitController";

export default class Main extends Plugin {
    habitController: HabitController;

    async onload() {
        this.habitController = new HabitController(this.app);
        this.habitController.updateCurrentHabit();
    }

    async onunload() {
        
    }
}