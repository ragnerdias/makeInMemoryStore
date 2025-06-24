
# 📦 **WbotServices & makeInMemoryStore - Documentation**

This repository provides:
- Service files for managing and interacting with WhatsApp sessions via a bot.
- A custom in-memory data storage module (`makeInMemoryStore`) for managing session data efficiently without disk persistence.

---

## 🚀 **WbotServices**

This module provides service files responsible for managing and interacting with WhatsApp sessions via a bot.

### Services Overview

#### `CheckNumber.ts`
✅ **Main Purpose:** Validate if a phone number is registered and able to receive messages on WhatsApp.  
🔧 **Key operations:** Connect to the active session and check the number’s validity using the WhatsApp API.

---

#### `GetProfilePicUrl.ts`
✅ **Main Purpose:** Fetch and return the profile picture URL of a WhatsApp contact.  
🔧 **Key operations:** Call WhatsApp API to retrieve profile picture URL by contact ID.

---

#### `StartWhatsAppSession.ts`
✅ **Main Purpose:** Start or reconnect a single WhatsApp session.  
🔧 **Key operations:** Manage connection lifecycle and state for a WhatsApp instance.

---

#### `StartAllWhatsAppsSessions.ts`
✅ **Main Purpose:** Start or reconnect all configured WhatsApp sessions at once.  
🔧 **Key operations:** Loop through session configurations and start each session.

---

#### `SendWhatsAppMessage.ts`
✅ **Main Purpose:** Send plain text messages through WhatsApp.  
🔧 **Key operations:** Compose and dispatch messages via WhatsApp API.

---

#### `SendWhatsAppMedia.ts`
✅ **Main Purpose:** Send media (images, videos, documents) via WhatsApp.  
🔧 **Key operations:** Handle media attachments and send to target recipients.

---

#### `EditWhatsAppMessage.ts`
✅ **Main Purpose:** Edit a previously sent message (where supported).  
🔧 **Key operations:** Use API functions to replace or modify message content.

---

#### `DeleteWhatsAppMessage.ts`
✅ **Main Purpose:** Delete a previously sent message.  
🔧 **Key operations:** Issue delete commands to remove messages using message IDs.

---

#### `ForwardWhatsAppMessage.ts`
✅ **Main Purpose:** Forward an existing message to another contact or group.  
🔧 **Key operations:** Use the original message ID to forward the content.

---

#### `CheckIsValidContact.ts`
✅ **Main Purpose:** Ensure a contact ID exists and is valid on WhatsApp.  
🔧 **Key operations:** Query WhatsApp servers for the contact’s validity.

---

### 🛠 **General Notes**
- Each service file functions as a module invoked by controllers or route handlers.
- Services depend on the WhatsApp Web API (or library implementations like Baileys).
- Error handling, session management, and reconnection logic are integrated by design.

💡 **Tip:** Extend these services with logging, custom error reporting, or business-specific logic as needed.

---

## ⚡ **makeInMemoryStore (store)**

`makeInMemoryStore` is a module designed for efficient in-memory data storage, created to replace or enhance storage features missing from certain versions of Baileys.

### Core Functionality
- Acts as a temporary, fast-access data store operating entirely in memory.
- All data is lost when the application process ends — ideal for development, testing, or ephemeral use cases.

---

### Installation
Ensure `pino` is installed to enable logging:

```bash
npm install pino
```

---

### Initialization

Example usage in `index.js`:

```javascript
const makeInMemoryStore = require('./store.js'); // Adjust path if needed
const pino = require('pino');

const logger = pino({
    level: 'silent' // Change as needed (e.g., 'info', 'debug')
});

const store = makeInMemoryStore({
    logger: logger.child({ stream: 'store' }) // Dedicated child logger for store
});

// Now 'store' can manage in-memory data
// Example methods: store.read(), store.write(), store.chats.all(), etc.
```

---

### Code Explanation

- `const makeInMemoryStore = require('./store.js');`  
  Imports the `makeInMemoryStore` module.

- `const logger = pino({ level: 'silent' });`  
  Initializes a logger. Adjust level according to verbosity requirements.

- `const store = makeInMemoryStore({ ... });`  
  Creates an in-memory store instance.

- `logger.child({ stream: 'store' })`  
  (Optional) Creates a child logger specifically for store logs.

---

## 🤝 **Contributions**
Contributions are welcome! Submit bug reports, feature requests, or pull requests via the project’s GitHub repository.
