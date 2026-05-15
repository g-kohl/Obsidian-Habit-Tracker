import { App, TFile } from "obsidian";

const BOOK_REGEX = /^(?:\d+\.\s+)?"(.+)"\s+\((.+)\)(?:\s+\\\[.+\\\])?\s*:\s+(\d{2}\/\d{2}\/\d{4})\s+-\s+(\d{2}\/\d{2}\/\d{4}):\s+(\d+)\s+páginas$/;

const TEXT = {
    PAGES: "- Páginas:",
    PAGES_PER_DAY: "- Páginas por dia:",
    PAGES_PER_BOOK: "- Páginas por livro",
} as const;

type Book = {
    title: string;
    autor: string;
    startDate: Date;
    endDate: Date;
    pages: number;
}

type Stats = {
    days: number;
    books: number;
    pages: number;

    pagesPerDay: number;
    pagesPerBook: number;
};

export default class Reading_Handler {
    app: App;
    books: Book[];

    constructor(app: App) {
        this.app = app;
        this.books = [];
    }

    async update(file: TFile) {
        const content = await this.app.vault.read(file);
        this.books = [];

        this.parseContent(content);
        const stats = this.computeStats();
        this.updateContent(file, content, stats);
    }

    private parseContent(content: string) {
        const lines = content.split("\n");

        for (const l of lines) {
            if (this.isBook(l) && this.isBookFinished(l)) {
                const book = this.parseBook(l);

                this.books.push(book);
            }
        }
    }

    private isBook(s: string) {
        return /^\d/.test(s);
    }

    private isBookFinished(s: string) {
        return !(/xx\/xx/.test(s));
    }

    private parseBook (book: string): Book {
        const match = book.match(BOOK_REGEX);
        
        if (!match) {
            throw new Error(`Invalid book format: ${book}`);
        }

        const [, title, autor, startDate, endDate, pages] = match;

        if (!title || !autor || !startDate || !endDate || !pages)
            throw new Error(`Invalid dates or pages: ${book}`);

        return {
            title,
            autor,
            startDate: this.parseDate(startDate),
            endDate: this.parseDate(endDate),
            pages: parseInt(pages)
        };
    }

    private parseDate(date: string) {
        const parts = date.split("/").map(Number);

        if (parts.length !== 3 || parts.some(isNaN)) {
            throw new Error(`Data inválida: "${date}"`);
        }

        const [day, month, year] = parts as [number, number, number];
        return new Date(year, month - 1, day);
    }
    
    private createStats(): Stats {
        return {
            days: 0,
            books: 0,
            pages: 0,
            pagesPerDay: 0,
            pagesPerBook: 0
        };
    }

    private computeStats() {
        const stats: Stats = this.createStats();

        for (const b of this.books) {
            stats.books++;
            stats.pages += b.pages;
        }

        const firstBook = this.books[0];
        const lastBook = this.books[stats.books-1];

        if (!firstBook || !lastBook)
            throw new Error("No books found");

        stats.days = (lastBook.endDate.getTime() - firstBook.startDate.getTime()) / (1000 * 60 * 60 * 24);
        stats.pagesPerBook = stats.pages / stats.books;
        stats.pagesPerDay = stats.pages / stats.days;

        return stats;
    }

    private async updateContent(file: TFile, content: string, stats: Stats) {
        const lines = content.split("\n");

        for (let [i, l] of lines.entries()) {
            if (l.startsWith(TEXT.PAGES))
                lines[i] = `${TEXT.PAGES} ${stats.pages}`;

            else if (l.startsWith(TEXT.PAGES_PER_DAY))
                lines[i] = `${TEXT.PAGES_PER_DAY} ${stats.pagesPerDay.toFixed(2)}`;

            else if (l.startsWith(TEXT.PAGES_PER_BOOK))
                lines[i] = `${TEXT.PAGES_PER_BOOK} ${stats.pagesPerBook.toFixed(2)}`;
        }

        const newContent = lines.join("\n");

        if (newContent !== content)
            await this.app.vault.modify(file, newContent);
    }
}