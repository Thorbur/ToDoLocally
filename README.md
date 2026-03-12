ToDoLocally
===========

A public-domain licensed task manager built using IndexedDB. 

#### Features:
- Everything a basic todo list can do
- Fully locally = no internet connection required
- No installation, just run it in your browser
- 3 task stages for better overview and daily prioritization
- Task details like due date, priority, notes
- Editing of tasks
- Deletion of tasks
- Hiding of tasks
- Drag n' Drop support to move tasks between stages
- Highlighting overdue tasks
- Attribute based search of tasks
- Export & Import of task database
- Automatic local backup after each change
- Restore backup from the menu
- Settings menu with language selection (English, German, Chinese, French, Spanish, Italian, Arabic, Persian, Portuguese, Hindi, Ukrainian, Japanese, Korean)
- Settings menu with theme selection (Default, Dark mode, High contrast, Ocean, Sepia)

#### Backup and restore
- Backups are written automatically after every successful task change.
- When the app runs via `http://` or `https://`, backups are stored in the browser's Origin Private File System (OPFS) as `todo-backup.json`.
- When the app runs via `file://`, backups are stored in `localStorage` under `todo-backup-json`.
- The menu entry `Restore backup` replaces the current task database with the latest local backup.

#### Settings
- **Language**: Choose the interface language from the Settings panel in the side menu.
- **Theme**: Choose between `Default`, `Dark mode`, `High contrast`, `Ocean`, and `Sepia`.
- Both language and theme preferences are stored in `localStorage` and are restored automatically on next launch.

#### Hosting / local server
Running from a local HTTP server is recommended, especially to use OPFS backup support.

Available helper scripts:
- `serve.ps1` for Windows (PowerShell)
- `serve-linux.sh` for Linux (bash)
- `serve-macos.sh` for macOS (bash)

Default URL and port:
- `http://localhost:8999/`

Examples:
- Windows (PowerShell): `./serve.ps1`
- Linux: `chmod +x serve-linux.sh && ./serve-linux.sh`
- macOS: `chmod +x serve-macos.sh && ./serve-macos.sh`

Optional arguments for Linux/macOS scripts:
- `./serve-linux.sh <port> <root>`
- `./serve-macos.sh <port> <root>`

If you open `index.html` directly via `file://`, the app still works and backups are stored in `localStorage` instead of OPFS.

#### Upcoming features:
- Optional Synchronization with a cloud storage provider (e.g. Nextcloud, Scaleway, Proton Drive or Koofr)
- Encryption of task database

#### Searching
Searching of tasks is possible by entering a search query in the search field.
The parser is based on the Nearley framework (https://nearley.js.org). 
Below you can find the query language definition and there validity based on the attribute type:
  
Keywords to be exchanged with values from the tasks:
- title = the title / summary of the task (text string)
- notes = the notes about the task (text string)
- stage = the stage the task is in (text string)
- priority = the priority of the task (text string)
- due = the due date of the task (date string)
- resolved = the resolution / completion date of the task (date string)
- done = if the task is completed (boolean)
- hidden = if the task is hidden (boolean)
- id = the ID of the task (number)

Operators to form conditional terms:
- "<" = smaller (date string, number)
- ">" = greater (date string, number)
- "=" = equals (date string, text string, boolean, number)
- "!=" = not equals (date string, text string, boolean, number)
- "~" = contains (text string)
- "!~" = not contains (text string)
  
Allowed values:
- text string values must begin and end with double quotes (") and are allowed to contain 
any character including whitespace. 
Double quotes itself need to be escaped with a backslash (\\").
- date string values must also begin and end with double quotes. It is recommended to use the 
ISO date and timestamp format. However, internally the value is interpreted by the JavaScript 
function "Date.parse". Therefore, any common date formats should work out.
- boolean values are just "true" or "false" without double quotes
- number values are simples integers ([0-9]+)
