/* ============================================================
   APP.JS — Address Book
   Phases 1 & 2: Core Logic + DOM Manipulation
   ============================================================ */


/* ============================================================
   PHASE 1: CORE DATA LAYER
   All contact data lives in this module-level array.
   No external storage, no database — purely in-memory.
   ============================================================ */

/**
 * @type {Array<{id: string, name: string, phone: string, email: string}>}
 * The single source of truth for all contacts.
 */
let contacts = [];

/**
 * Generates a simple unique ID string using timestamp + random suffix.
 * Avoids dependencies on crypto.randomUUID() for broadest browser support.
 * @returns {string} A unique identifier string.
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Adds a new contact to the in-memory array.
 * @param {string} name  - The contact's full name.
 * @param {string} phone - The contact's phone number.
 * @param {string} email - The contact's email address.
 * @returns {object} The newly created contact object.
 */
function addContact(name, phone, email) {
  const newContact = {
    id:    generateId(),
    name:  name.trim(),
    phone: phone.trim(),
    email: email.trim(),
  };
  contacts.push(newContact);
  return newContact;
}

/**
 * Returns a copy of the full contacts array.
 * Returning a copy (via slice) prevents external code from
 * accidentally mutating the source-of-truth array directly.
 * @returns {Array} All stored contact objects.
 */
function getContacts() {
  return contacts.slice();
}

/**
 * Searches contacts by name (case-insensitive, partial match).
 * @param {string} searchString - The string to search for.
 * @returns {Array} Contacts whose names include the search string.
 */
function searchContact(searchString) {
  const query = searchString.toLowerCase().trim();
  if (!query) return getContacts(); // empty search → return all
  return contacts.filter(c => c.name.toLowerCase().includes(query));
}

/**
 * Removes a contact from the array by its unique ID.
 * Uses Array.filter to produce a new array without the target contact.
 * @param {string} id - The unique ID of the contact to remove.
 * @returns {boolean} True if a contact was found and removed, false otherwise.
 */
function deleteContact(id) {
  const initialLength = contacts.length;
  contacts = contacts.filter(c => c.id !== id);
  return contacts.length < initialLength; // true = deletion occurred
}


/* ============================================================
   PHASE 2: DOM MANIPULATION & EVENT WIRING
   Everything below handles rendering and user interaction.
   It depends solely on the four functions defined above.
   ============================================================ */

// --- Cache DOM references (queried once, reused often) ---
const contactForm    = document.getElementById('contact-form');
const inputName      = document.getElementById('input-name');
const inputPhone     = document.getElementById('input-phone');
const inputEmail     = document.getElementById('input-email');
const errorName      = document.getElementById('error-name');
const errorPhone     = document.getElementById('error-phone');
const errorEmail     = document.getElementById('error-email');
const searchInput    = document.getElementById('search-input');
const contactList    = document.getElementById('contact-list');
const emptyState     = document.getElementById('empty-state');
const contactCount   = document.getElementById('contact-count');
const toast          = document.getElementById('toast');

/** @type {number|null} Timer handle used to auto-dismiss the toast */
let toastTimer = null;


/* -------- RENDERING -------- */

/**
 * Derives a 1–2 character avatar string from a contact's name.
 * "Jane Doe" → "JD", "Alice" → "Al"
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Builds and returns a single contact card DOM element.
 * Using createElement (not innerHTML) for each card keeps
 * the delete button wiring clean and avoids XSS risks with
 * user-supplied data in innerHTML.
 *
 * @param {object} contact - A contact object from the data layer.
 * @returns {HTMLElement} The assembled card element.
 */
function createContactCard(contact) {
  // Outer card wrapper
  const card = document.createElement('div');
  card.classList.add('contact-card');
  card.dataset.id = contact.id; // store id for easy lookup on delete

  // Avatar
  const avatar = document.createElement('div');
  avatar.classList.add('contact-avatar');
  avatar.textContent = getInitials(contact.name);

  // Info block
  const info = document.createElement('div');
  info.classList.add('contact-info');

  const nameEl = document.createElement('div');
  nameEl.classList.add('contact-name');
  nameEl.textContent = contact.name; // .textContent is XSS-safe

  const metaEl = document.createElement('div');
  metaEl.classList.add('contact-meta');
  metaEl.textContent = `${contact.phone}  ·  ${contact.email}`;

  info.appendChild(nameEl);
  info.appendChild(metaEl);

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('btn-delete');
  deleteBtn.textContent = 'Delete';
  deleteBtn.setAttribute('aria-label', `Delete contact ${contact.name}`);

  // Wire the delete action directly to this specific contact's id
  deleteBtn.addEventListener('click', () => handleDelete(contact.id));

  // Assemble card
  card.appendChild(avatar);
  card.appendChild(info);
  card.appendChild(deleteBtn);

  return card;
}

/**
 * Renders the provided contacts array into the #contact-list element.
 * Clears the list first, then appends a card for each contact.
 * Shows the empty state if the array is empty.
 *
 * @param {Array} contactsToRender - The (possibly filtered) contacts to display.
 */
function renderContacts(contactsToRender) {
  // Clear all existing cards (but NOT the empty-state element)
  const existingCards = contactList.querySelectorAll('.contact-card');
  existingCards.forEach(card => card.remove());

  // Update the count badge (reflects filtered OR full list)
  const total = getContacts().length;
  contactCount.textContent =
    contactsToRender.length === total
      ? `${total} contact${total !== 1 ? 's' : ''}`
      : `${contactsToRender.length} of ${total} contact${total !== 1 ? 's' : ''}`;

  if (contactsToRender.length === 0) {
    // Show empty state
    emptyState.style.display = 'block';
  } else {
    // Hide empty state and render cards
    emptyState.style.display = 'none';
    contactsToRender.forEach(contact => {
      contactList.appendChild(createContactCard(contact));
    });
  }
}


/* -------- VALIDATION -------- */

/**
 * Validates the add-contact form fields.
 * Marks fields as invalid and populates error messages.
 * @returns {boolean} True if all fields are valid, false otherwise.
 */
function validateForm() {
  let isValid = true;

  // Helper: mark a field as invalid with a message
  function setError(input, errorEl, message) {
    input.classList.add('is-invalid');
    errorEl.textContent = message;
    isValid = false;
  }

  // Helper: clear a field's error state
  function clearError(input, errorEl) {
    input.classList.remove('is-invalid');
    errorEl.textContent = '';
  }

  // Reset all errors first
  clearError(inputName,  errorName);
  clearError(inputPhone, errorPhone);
  clearError(inputEmail, errorEmail);

  // --- Name: required, at least 2 chars ---
  if (inputName.value.trim().length < 2) {
    setError(inputName, errorName, 'Name must be at least 2 characters.');
  }

  // --- Phone: required, digits/spaces/+/-/() only ---
  const phonePattern = /^[\d\s\+\-\(\)]{7,20}$/;
  if (!phonePattern.test(inputPhone.value.trim())) {
    setError(inputPhone, errorPhone, 'Enter a valid phone number (7–20 digits).');
  }

  // --- Email: basic RFC-like pattern ---
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(inputEmail.value.trim())) {
    setError(inputEmail, errorEmail, 'Enter a valid email address.');
  }

  return isValid;
}


/* -------- TOAST NOTIFICATIONS -------- */

/**
 * Briefly displays a toast notification at the bottom-right of the screen.
 * @param {string}  message - The message to display.
 * @param {'success'|'error'} type - Controls the toast colour.
 * @param {number}  [duration=3000] - Auto-dismiss delay in milliseconds.
 */
function showToast(message, type = 'success', duration = 3000) {
  // Clear any in-flight toast timer
  if (toastTimer) clearTimeout(toastTimer);

  toast.textContent = message;
  toast.className = `toast toast--${type} toast--visible`;

  toastTimer = setTimeout(() => {
    toast.classList.remove('toast--visible');
  }, duration);
}


/* -------- EVENT HANDLERS -------- */

/**
 * Handles form submission: validates, adds the contact,
 * re-renders the list, resets the form, and shows feedback.
 * @param {Event} e - The submit event.
 */
function handleFormSubmit(e) {
  e.preventDefault(); // prevent native browser submission

  if (!validateForm()) return; // stop if validation fails

  // All good — delegate to the Phase 1 data function
  const contact = addContact(
    inputName.value,
    inputPhone.value,
    inputEmail.value
  );

  // Re-render the full (unfiltered) list
  renderContacts(getContacts());

  // Reset form fields and any lingering validation styles
  contactForm.reset();

  showToast(`✓ ${contact.name} added successfully.`, 'success');
}

/**
 * Handles the delete action for a given contact ID.
 * @param {string} id - The unique ID of the contact to delete.
 */
function handleDelete(id) {
  // Find the name before deletion for the toast message
  const target = contacts.find(c => c.id === id);
  const name   = target ? target.name : 'Contact';

  const removed = deleteContact(id);

  if (removed) {
    // Re-render respecting the current search filter
    const query = searchInput.value;
    renderContacts(searchContact(query));
    showToast(`${name} deleted.`, 'error');
  }
}

/**
 * Handles real-time search input.
 * Filters the rendered list without modifying the data array.
 */
function handleSearch() {
  const query = searchInput.value;
  renderContacts(searchContact(query));
}


/* -------- INITIALISATION -------- */

/**
 * Bootstraps the application:
 * - Seeds demo contacts so the UI isn't empty on first load.
 * - Attaches event listeners.
 * - Performs initial render.
 */
function init() {
  // ---- Seed some demo contacts so reviewers see the UI in action ----
  addContact('Alice Tan',    '+60 12-345 6789', 'alice.tan@example.com');
  addContact('Bob Rahman',   '+60 16-222 3344', 'bob.rahman@example.com');
  addContact('Carol Lim',    '+60 11-987 6543', 'carol.lim@example.com');

  // ---- Attach event listeners ----
  contactForm.addEventListener('submit', handleFormSubmit);
  searchInput.addEventListener('input',  handleSearch);

  // Clear individual field errors on user input (live feedback)
  inputName.addEventListener('input',  () => {
    inputName.classList.remove('is-invalid');
    errorName.textContent = '';
  });
  inputPhone.addEventListener('input', () => {
    inputPhone.classList.remove('is-invalid');
    errorPhone.textContent = '';
  });
  inputEmail.addEventListener('input', () => {
    inputEmail.classList.remove('is-invalid');
    errorEmail.textContent = '';
  });

  // ---- Initial render ----
  renderContacts(getContacts());
}

// Kick everything off once the DOM is fully parsed
document.addEventListener('DOMContentLoaded', init);
