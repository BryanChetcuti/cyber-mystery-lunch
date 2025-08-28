// worker/index.ts
import { Choice, RoomState, Scenario, Mode } from "./types";

export interface Env {
  GAME_ROOM: DurableObjectNamespace;
  DEFAULT_MODE: Mode; // "serious" | "funny" | "easter"
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    // Only proxy API calls to the Durable Object. Static assets are served by Wrangler (assets/public).
    if (url.pathname.startsWith("/api/")) {
      const code = url.searchParams.get("code") ?? "demo";
      const id = env.GAME_ROOM.idFromName(code);
      const stub = env.GAME_ROOM.get(id);
      return stub.fetch(request);
    }

    return new Response("Not found", { status: 404 });
  },
};

export class GameRoom implements DurableObject {
  private state: DurableObjectState;
  private env: Env;
  private data: RoomState | null = null;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  // ---- Durable Object entrypoint ----
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\//, "");
    const code = url.searchParams.get("code") ?? "demo";

    if (!this.data) {
      await this.ensureRoom(code, this.env.DEFAULT_MODE);
    }

    try {
      switch (path) {
        case "create":
          return this.createRoom(request, code);
        case "join":
          return this.join(request);
        case "start":
          return this.start();
        case "current":
          return this.current();
        case "answer":
          return this.answer(request);
        case "next":
          return this.next();
        case "scoreboard":
          return this.scoreboard();
        default:
          return this.json({ ok: false, error: "Route not found" }, 404);
      }
    } catch (err: any) {
      return this.json({ ok: false, error: err?.message ?? "Unhandled error" }, 500);
    }
  }

  // ---- Room lifecycle ----
  private async ensureRoom(code: string, mode: Mode) {
    const stored = await this.state.storage.get<RoomState>("room");
    if (stored) {
      this.data = stored;
      return;
    }
    const scenario = await this.loadScenario(mode);
    this.data = {
      code,
      mode,
      scenario,
      players: {},
      phase: "lobby",
      currentRoundIdx: -1,
    };
    await this.persist();
  }

  private async persist() {
    await this.state.storage.put("room", this.data);
  }

  private async json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  // ---- Scenario loading (fallback only) ----
  /**
   * DOs can't reliably read Worker static assets; the host now posts the scenario to /api/create.
   * This method returns a minimal built-in fallback so dev still works if nothing is supplied.
   */
  private async loadScenario(_mode: Mode): Promise<Scenario> {
    return {
      title: "Fallback Scenario",
      rounds: [
        {
          id: "r1",
          prompt: "Which log line is suspicious?",
          choices: [
            { id: "A", text: "GET /intranet", correct: false },
            { id: "B", text: "POST /admin", correct: true },
            { id: "C", text: "healthcheck", correct: false },
            { id: "D", text: "GET /docs", correct: false },
          ],
          points: 10,
          seconds: 45,
        },
      ],
    };
  }

  private currentRound() {
    if (!this.data) return null;
    const idx = this.data.currentRoundIdx;
    if (idx < 0) return null;
    return this.data.scenario.rounds[idx];
  }

  private redact(round: any) {
    // Remove correctness flags so clients can’t peek
    return {
      ...round,
      choices: (round.choices as Choice[]).map((c) => ({ id: c.id, text: c.text })),
    };
  }

  private publicState() {
    return {
      code: this.data!.code,
      mode: this.data!.mode,
      title: this.data!.scenario.title,
      phase: this.data!.phase,
      idx: this.data!.currentRoundIdx,
      players: Object.values(this.data!.players).map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
      })),
    };
  }

  // ---- Routes ----
  private async createRoom(request: Request, code: string) {
    const { mode, scenario } = (await request.json().catch(() => ({}))) as {
      mode?: Mode;
      scenario?: Scenario;
    };

    const chosenMode: Mode = mode ?? this.data!.mode ?? "serious";
    const chosenScenario: Scenario = scenario ?? (await this.loadScenario(chosenMode));

    this.data = {
      code,
      mode: chosenMode,
      scenario: chosenScenario,
      players: {},
      phase: "lobby",
      currentRoundIdx: -1,
    };
    await this.persist();
    return this.json({ ok: true, code, mode: this.data.mode, title: chosenScenario.title });
  }

  private async join(request: Request) {
    const { name } = (await request.json().catch(() => ({}))) as { name?: string };
    if (!name) return this.json({ ok: false, error: "Missing name" }, 400);

    const id = crypto.randomUUID();
    this.data!.players[id] = { id, name, score: 0, answered: {} };
    await this.persist();
    return this.json({ ok: true, playerId: id, room: this.publicState() });
  }

  private async start() {
    if (this.data!.phase !== "lobby") return this.json({ ok: false, error: "Already started" }, 400);
    this.data!.phase = "round";
    this.data!.currentRoundIdx = 0;
    this.data!.startedAt = Date.now();
    await this.persist();
    return this.json({ ok: true, room: this.publicState() });
  }

  private async current() {
    const r = this.currentRound();
    return this.json({
      ok: true,
      phase: this.data!.phase,
      round: r ? this.redact(r) : null,
      idx: this.data!.currentRoundIdx,
    });
  }

  private async answer(request: Request) {
    const { playerId, choiceId } = (await request.json().catch(() => ({}))) as {
      playerId?: string;
      choiceId?: string;
    };
    if (!playerId || !choiceId) return this.json({ ok: false, error: "Missing playerId or choiceId" }, 400);

    const r = this.currentRound();
    if (!r) return this.json({ ok: false, error: "No active round" }, 400);

    const player = this.data!.players[playerId];
    if (!player) return this.json({ ok: false, error: "Unknown player" }, 400);

    // Prevent double answers
    if (player.answered![r.id]) {
      return this.json({ ok: true, already: true, score: player.score });
    }

    player.answered![r.id] = choiceId;

    const correct = r.choices.find((c: Choice) => c.id === choiceId)?.correct;
    if (correct) player.score += r.points;

    await this.persist();
    return this.json({ ok: true, correct: !!correct, score: player.score });
  }

  private async next() {
    if (this.data!.phase !== "round") return this.json({ ok: false, error: "Not in round" }, 400);

    const lastIdx = this.data!.scenario.rounds.length - 1;
    if (this.data!.currentRoundIdx >= lastIdx) {
      this.data!.phase = "results";
      await this.persist();
      return this.json({ ok: true, phase: "results" });
    }

    this.data!.currentRoundIdx += 1;
    await this.persist();
    return this.json({ ok: true, idx: this.data!.currentRoundIdx });
  }

  private async scoreboard() {
    const players = Object.values(this.data!.players).sort((a, b) => b.score - a.score);
    return this.json({ ok: true, players });
  }
}
