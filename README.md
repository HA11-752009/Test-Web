# CR7 Namer MEDO — دعم فني احترافي

Static support website with Telegram bot integration. Works on GitHub Pages with zero backend.

## GitHub Pages Setup

1. **Upload or fork** this repository to your GitHub account.

2. **Configure the Telegram bot** — open `script.js` and fill in these values at the top (get BOT_TOKEN from [@BotFather](https://t.me/BotFather)):

   ```js
   const CONFIG = {
     BOT_TOKEN: "YOUR_BOT_TOKEN_HERE",      // From @BotFather
     BOT_USERNAME: "your_bot_username",     // Bot username (without @)
     MEDO_CHAT_ID: "YOUR_MEDO_ID_HERE",     // MEDO's Telegram chat ID
     ZOSER_CHAT_ID: "YOUR_ZOSER_ID_HERE",   // ZOSER's Telegram chat ID
     POLL_INTERVAL: 2000,
     API_BASE: "https://api.telegram.org/bot"
   };
   ```

3. **Get Chat IDs:**
   - Both agents send `/start` to your bot
   - Visit: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   - Find their `chat.id` values in the JSON response

4. **Enable GitHub Pages:**
   - Repository → Settings → Pages
   - Source: **Deploy from a branch**
   - Branch: `main` / `(root)`
   - Click **Save**

5. **Your site is live at:**
   ```
   https://<username>.github.io/<repo-name>
   ```

## How Agents Reply

1. Each agent opens a **direct message** with the bot on Telegram (search for the bot username and press **Start**)
2. When a support request comes in, the bot sends a notification to the agent with two buttons:

   | Button | Action |
   |--------|--------|
   | ✏️ **رد على المستخدم** | Opens DM with bot — just type your response, no prefix needed! |
   | ❌ **إنهاء المحادثة** | Ends the conversation on the website remotely |

3. **To reply:** click **"✏️ رد على المستخدم"** → opens the bot chat → then simply type your response and send. The website picks it up automatically.

4. **To end a conversation:** click **"❌ إنهاء المحادثة"** → the session closes on the website and the user gets a notification.

### Manual Reply Format (Fallback)

If the button doesn't work, you can also type this format manually:
```
reply:SESSION_ID your reply text here
```
Example:
```
reply:abc1-def2-ghi3 شكراً لتواصلك، كيف يمكنني مساعدتك؟
```

## Files

| File | Description |
|------|-------------|
| `index.html` | Page structure, modals, chat UI |
| `style.css` | All styles, animations, glassmorphism |
| `script.js` | Telegram API, session, chat, particles, cursor |
| `README.md` | Setup instructions |

## Notes

- Zero external dependencies (except Google Fonts CDN)
- Fully static — works on any web server
- Mobile responsive with RTL Arabic support
- Session persists in localStorage
