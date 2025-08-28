export type Mode = "serious" | "funny" | "easter";
export type Choice = { id: string; text: string; correct: boolean };
export type Round = { id: string; prompt: string; choices: Choice[]; points: number; seconds: number };
export type Scenario = { title: string; rounds: Round[] };

export type Player = { id: string; name: string; score: number; answered?: Record<string, string> };
export type RoomState = {
  code: string;
  mode: "serious" | "funny";
  scenario: Scenario;
  players: Record<string, Player>;
  phase: "lobby" | "round" | "results";
  currentRoundIdx: number;
  startedAt?: number;
};
