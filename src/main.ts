import { Plugin } from "obsidian";
import PageController from "./pageController";

export default class Main extends Plugin {
    pageController!: PageController;

    async onload() {
        this.pageController = new PageController(this.app);

        this.pageController.updateCurrentPage();

        this.registerEvent(
            this.app.workspace.on("active-leaf-change", () => {
                this.pageController.updateCurrentPage();
            })
        );

        this.addCommand({
            id: 'update-page',
            name: 'Update page',
            hotkeys: [
                {
                    key: "U",
                    modifiers: ["Mod"],
                },
            ],
            callback: () => {
                this.pageController.updateCurrentPage();
            },
        });
    }

    async onunload() {
        
    }
}