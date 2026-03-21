import { Plugin } from "obsidian";
import {DEFAULT_SETTINGS, MyPluginSettings} from "./settings";
import PageController from "./pageController";

export default class Main extends Plugin {
    settings: MyPluginSettings;
    pageController: PageController;

    async onload() {
        await this.loadSettings();

        this.pageController = new PageController(this.app);

        this.pageController.updateCurrentPage();

        this.registerEvent(
            this.app.workspace.on("active-leaf-change", () => {
                this.pageController.updateCurrentPage();
            })
        )
    }

    async onunload() {
        
    }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<MyPluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}