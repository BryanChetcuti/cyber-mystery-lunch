# 🍕🔐 Cyber Mystery Lunch

A quick, team-friendly web game for solving a lighthearted **tech mystery** over lunch.
Playable on phones, hosted on **Cloudflare Workers**, and fully open for customization.

---

## 🚀 Features

* Mobile-first UI (works on any phone).
* Host & Player modes.
* Two game styles:

  * **Serious Mode** → incident response scenarios.
  * **Funny Mode** → fridge hackers, TimTam ransoms, and silly scenarios.
* Live scoreboard.
* Scenarios stored in JSON — easy to edit or extend.

---

## 🛠️ Quick Start

### 1. Clone & install

```bash
git clone https://github.com/your-org/cyber-mystery-lunch.git
cd cyber-mystery-lunch
npm install
```

### 2. Log into Cloudflare

```bash
npx wrangler login
```

### 3. Run locally

```bash
npm run dev
```

### 4. Deploy

```bash
npm run deploy
```

Cloudflare will print the public game URL, e.g.:

```
https://cyber-mystery-lunch.your-team.workers.dev
```

---

## 📱 How to Play

1. **Host** opens the main URL → selects mode (Serious / Funny) → starts the game.
2. **Players** join by entering a name and the game code (default: `demo`).
3. Each round:

   * A question prompt appears.
   * Players tap their chosen answer.
   * The app marks responses and awards points.
4. **Host** advances rounds → Scoreboard updates live.
5. After 5 rounds, the winner is revealed. 🎉

---

## 📂 Repo Layout

```
cyber-mystery-lunch/
├── data/                 # Game scenarios
│   ├── serious.json
│   └── funny.json
├── public/               # Static frontend
│   ├── index.html        # Join / Host setup
│   ├── host.html         # Host controls + scoreboard
│   ├── game.html         # Player UI
│   ├── app.css
├── worker/               # Cloudflare Worker + Durable Object
│   ├── index.ts
│   └── types.ts
├── wrangler.toml
├── package.json
└── README.md
```

---

## ✏️ Customizing Scenarios

Game questions are stored in `data/serious.json` and `data/funny.json`.

Each round looks like:

```json
{
  "id": "r1",
  "prompt": "Which log line is suspicious?",
  "choices": [
    { "id": "A", "text": "GET /intranet", "correct": false },
    { "id": "B", "text": "POST /admin", "correct": true }
  ],
  "points": 10,
  "seconds": 45
}
```

Add or remove rounds as you like.
⚡ No code changes required — just edit the JSON.

---

## 🎤 Host Guide (Step-by-Step)

You don’t need to know code — just follow these steps to run a session.

### Before Lunch

1. **Get the game link** from your tech lead (Cloudflare URL).
2. **Decide the mood**

   * *Serious Mode* → real cyber incident questions.
   * *Funny Mode* → fridge hackers, ransom in TimTams, silly scenarios.

### At Lunch

1. **Open the host console**

   * Go to the game URL.
   * Under *“Start a Game (Host)”*, choose *Serious* or *Funny*.
   * Click **Create & Open Host View**.
   * This opens the **Host Console** (scoreboard + controls).

2. **Invite players**

   * Share the link.
   * Players enter the game code (`demo`) and their name.
   * Their names appear on your **Scoreboard**.

3. **Start the game**

   * When everyone’s in, hit **Start Game**.
   * The first question appears on all phones.

4. **Advance rounds**

   * After each round, click **Next Round**.
   * The scoreboard updates live.

5. **Wrap up**

   * After the final round, the winner is revealed.
   * Announce scores and award bragging rights (or dessert). 🎉

### Tips

* Runs best in **15–20 minutes**.
* Works smoothly with 5–15 players.
* Switch mode depending on the team vibe.

---

## 🎬 Host Script

Short lines you can read aloud during the game.

### Opening

**Serious Mode:**

> “Alright team — you’re enjoying a quiet lunch when suddenly… the SOC monitoring app lights up. We’ve got a live cyber incident. Can you spot the clues and contain the breach before dessert?”

**Funny Mode:**

> “Lunch is going well until disaster strikes: the office fridge has been hacked. The hackers want TimTams, pizza, and maybe your Spotify playlist. Work together and save lunch!”

### Between Rounds

> “Next clue coming in — stay sharp.”
> *(Optional Funny mode)* “The fridge sounds… angrier.”

### Before Final Round

> “Last challenge — this one decides the outcome. Answer fast!”

### Ending

**Serious Mode:**

> “And that’s it — incident contained. You scored \[X] points.
> 40+ points = attackers stopped.
> Less = enjoy writing the incident report.”

**Funny Mode:**

> “The fridge saga ends here. You scored \[X] points.
> Did you save the snacks? Or did the hackers walk away with the TimTams? Either way — you survived the Great Lunch Breach!”

---

## 🧩 Roadmap / Nice-to-haves

* Countdown timers for all players.
* QR code join link.
* Persistent leaderboards (Cloudflare KV/D1).
* Azure Functions deployment variant.

---

## 📜 License

MIT — free to use, tweak, and extend.

---

🪄 Easter Egg
On the home page, tap the big title 7 times. You’ll unlock a hidden “Easter” mode.
When you start the game after unlocking, it loads `data/easter-egg.json`.
