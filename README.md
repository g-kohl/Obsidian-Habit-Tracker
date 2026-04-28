# Project description
This project is a Habit Tracker and To-Do List plugin for the notes app [Obsidian](https://obsidian.md/). It is **highly** customized for **my** goals and therefore is not available as a community plugin. Despite that, feel free to download this repository and use it as a source of inspiration for building your own plugin.

# Installation and building
Before anything, make sure you have Node.js installed in your system. After downloading this repository, navigate to its folder and install the dependencies by running:

```
npm install
```

To build the project, run:

```
npm run build
```

When you are developing new features, it's interesting to run:

```
npm run dev
```

This way, you don't need to build every single time.

# Features
I'll probably update this project frequently to keep adding or updating features. Because of this, this README may not always be up to date. If a module is not documented in this README, it is probably not finished.

Every feature is associated with habits from specific files. For example, for my reading habit I have a reading module that only makes changes in the file where I take notes for this specific habit.

**Disclaimer:** in these files, I write in Portuguese and the plugin expects to find texts in this language. To explain the features I'll translate the texts to English. Check the [Developer notes](#developer-notes) if you want to change the texts.

## To-Do List
A file named "To-Do" will have four sections (in this project these texts are written in portuguese): 

- "Today": tasks due today or tomorrow.
- "Short term": tasks due within 2 days to 2 weeks.
- "Medium term": tasks due within 2 weeks to 2 months.
- "Long term": tasks due after 2 months or with no specific deadline.

Write your taks as tasks lists with a date in the end of it, for example:

`- [  ] my task description - 21/04/26`

The plugin expects the date to be in the DD/MM/YY format.

With that, the plugin will automatically sort them in the four sections mentioned before. This way, you can easily manage your tasks and their deadlines. Completed tasks are removed automatically if their deadline has already passed.

## General habit tracker
A file with the name starting with "NF" will count how many days were marked as "Yes" or "No" and exhibit statistics based on that. The meaning of 'NF' is personal and not relevant to the plugin logic, but you can use this module as a general habit tracker. The statistics are:

- Success days
- Best streak
- Success/Failure ratio

## Other modules...
To add...

# Developer notes

Read this if you plan to modify, remove or add other modules, which I highly suggest because, as I mentioned, I designed this plugin to track my habits and goals and they may differ from yours.

## Project architecture

The architecture is pretty simple:

- The `Main` class extends the `Plugin` class implemented by Obsidian. It checks whenever a file is opened and calls the `PageController` class to update it. "Ctrl + U" also forces the checking, so you don't need to leave and return to the current file.

- The `PageController` class determines the currently open file and calls its responsible module.

- Each module has a class where you should implement the following functions:
    - _update_: the function that will be called by the controller class.
    - _parseContent_: parses the content of the file so you can modify and extract information from it.
    - _updateContent_: writes the new content in the file.

## Language
Since I write my Obsidian documents in Portuguese, the plugin also operates using this language. If you want to change it, all portugues texts are defined as constants in the beginning of the code, so it's easy to find and modify.