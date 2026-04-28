# 📒 Address Book

A lightweight, fully client-side Address Book application built with pure Vanilla JavaScript, HTML, and CSS — zero frameworks, zero dependencies, zero build steps.

---

## Demo & Explanation

> **Screenshot**
> *(Replace this line by dragging your screenshot image here on GitHub)*

> **Video Walkthrough**
> *(Paste your video link here, e.g. a Loom or YouTube URL)*

---

## Features

- **Add Contacts** — Form with inline validation for Name, Phone, and Email fields
- **Real-Time Search** — Instantly filters the contact list as you type
- **Delete Contacts** — Remove any contact with a single click
- **Avatar Initials** — Auto-generated avatar from the contact's name
- **Toast Notifications** — Non-intrusive success and error feedback
- **Responsive Layout** — Adapts cleanly to both desktop and mobile screens
- **In-Memory Storage** — All data lives in a JavaScript array; no backend required

---

## Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Structure  | HTML5                       |
| Styling    | CSS3 (Custom Properties)    |
| Logic      | Vanilla JavaScript (ES6+)   |
| Storage    | In-memory array (no DB)     |
| Fonts      | Google Fonts (via CDN)      |

---

## Project Structure

```
address-book/
├── index.html   # App shell and markup
├── style.css    # All styling and layout
├── app.js       # Core logic + DOM wiring
└── README.md    # This file
```

---

## How to Run

No installation, no build tools, no terminal commands required.

1. **Download or clone** this repository:
```bash
   git clone https://github.com/your-username/address-book.git
```
2. **Open the project folder.**
3. **Double-click `index.html`** to open it in your browser.

That's it. The application runs entirely in the browser.

> ✅ Compatible with all modern browsers: Chrome, Firefox, Safari, and Edge.

---

## Core API Reference

These four functions in `app.js` form the data layer of the application:

| Function | Description |
|---|---|
| `addContact(name, phone, email)` | Creates a contact with a unique ID and adds it to the array |
| `getContacts()` | Returns a copy of the full contacts array |
| `searchContact(searchString)` | Returns contacts whose names match the search string (case-insensitive) |
| `deleteContact(id)` | Removes the contact with the matching ID from the array |

---

## Design Decisions

- **No frameworks** — Demonstrates core DOM manipulation and event handling skills without abstractions.
- **Separation of concerns** — Phase 1 (data logic) and Phase 2 (UI/DOM) are clearly separated within `app.js`, making the code easy to follow and test.
- **XSS-safe rendering** — Contact cards are built using `createElement` and `.textContent` instead of `innerHTML`, so user-supplied data is never treated as markup.
- **Defensive data access** — `getContacts()` returns a `.slice()` copy of the internal array, preventing the UI layer from accidentally mutating the source of truth.

---

## Author

**Your Name**
[GitHub](https://github.com/your-username) · [LinkedIn](https://linkedin.com/in/your-username)

---

## License

This project is open source and available under the [MIT License](LICENSE).
