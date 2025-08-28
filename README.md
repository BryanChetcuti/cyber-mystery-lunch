# 🍕🔐 Cyber Mystery Lunch

A fast, team-building web game where your tech crew solves a **cyber incident mystery** over lunch.  
Playable on phones, runs on **Cloudflare Workers + Durable Objects**, scenarios in JSON, and open for contributions.

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/workers/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-cyber--mystery--lunch-181717?logo=github)](https://github.com/bchetcuti/cyber-mystery-lunch)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 🎮 How It Works

- **Host** creates a game → shows the host console on the big screen.  
- **Players** join with a code → answer rounds on their phones.  
- **Timer** counts down each round, scoreboard updates live.  
- Modes: **Serious**, **Funny**, and a hidden **Easter Egg** (tap the title 7×).  
- End of game → winners announced, bragging rights secured.  

---

## 🚀 Live Demo

👉 Try it here: **[your-workers-dev-URL](https://your-worker-url.workers.dev)**  
(or set up your own deployment below).

---

## 🛠️ Tech Stack

- **Frontend**: Static HTML/CSS/JS served from Cloudflare Worker assets  
- **Backend**: Cloudflare Durable Object for room state & scoring  
- **Data**: JSON scenarios (`public/data/*.json`)  

---

## 📂 Repo Structure
cyber-mystery-lunch/
├── public/ # Static frontend & assets
│ ├── index.html # Join / Host setup
│ ├── host.html # Host controls + scoreboard
│ ├── game.html # Player UI
│ ├── app.css
│ ├── data/ # Game scenarios (served to clients)
│ │ ├── serious.json
│ │ ├── funny.json
│ │ └── easter-egg.json
│ └── docs/ # Extra docs served statically
│ ├── api.md
│ └── host-cheat-sheet.md
├── worker/ # Cloudflare Worker + Durable Object
│ ├── index.ts
│ └── types.ts
├── wrangler.toml # Wrangler config
├── package.json
└── README.md

---

## 🧑‍💻 Local Dev

```bash
# install deps
npm i

# run locally with hot reload
npm run dev

# deploy to Cloudflare Workers
npm run deploy
🌐 Deployment

Install Wrangler
:

npm install -g wrangler


Authenticate:

wrangler login


Deploy:

npm run deploy


(Optional) Add a custom domain in Cloudflare Dashboard → Workers & Pages → Triggers → Custom Domains.

✍️ Writing Scenarios

Each round lives in public/data/*.json. Example:

{
  "id": "r1",
  "prompt": "Unusual outbound traffic detected. What do you do?",
  "choices": [
    { "id": "A", "text": "Shut down internet egress", "correct": true },
    { "id": "B", "text": "Wait for more logs", "correct": false },
    { "id": "C", "text": "Reboot random servers", "correct": false },
    { "id": "D", "text": "Send an apology email", "correct": false }
  ],
  "points": 10,
  "seconds": 30
}

🧑‍🤝‍🧑 Contributing

Pull Requests welcome!

Add new scenarios under public/data/

Improve UI/UX for host or players

File issues for bugs, ideas, or new features

📜 License

MIT — free to use, hack, and share.

🎯 Roadmap

 QR code join link

 Sound cue when timer hits 0

 Persist results to KV/D1

 Optional host PIN for extra control
