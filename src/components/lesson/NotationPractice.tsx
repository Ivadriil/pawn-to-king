import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Chess } from "chess.js";
import { ChessboardGrid, type ChessPiece } from "./ChessboardGrid";

type BoardPosition = Partial<Record<string, ChessPiece>>;
type RecordStage = {
  prompt: string;
  from: string;
  to: string;
  beforePieces: BoardPosition;
  pieces: BoardPosition;
  checkedSquares: string[];
  record: string;
};
type MoveSpec = { from: string; to: string; promotion?: "q" | "r" | "b" | "n" };
type Scenario = { fen: string; setup?: MoveSpec[]; move: MoveSpec };
type PracticeLevel = { title: string; description: string; stages: RecordStage[] };

const files = "abcdefgh";
const kingsideAndQueensideCastleFen = "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1";
const promotionWhiteFen = "7k/P7/8/8/8/8/8/7K w - - 0 1";
const promotionBlackFen = "7k/8/8/8/8/8/p7/7K b - - 0 1";
const whiteMateFen = "7k/8/5KQ1/8/8/8/8/8 w - - 0 1";

function readPosition(game: Chess): BoardPosition {
  const position: BoardPosition = {};
  game.board().forEach((rank, row) => rank.forEach((piece, column) => {
    if (piece) position[`${files[column]}${8 - row}`] = `${piece.color}${piece.type.toUpperCase()}` as ChessPiece;
  }));
  return position;
}

function kingInCheck(game: Chess): string[] {
  if (!game.isCheck()) return [];
  for (const [row, rank] of game.board().entries()) {
    const column = rank.findIndex((piece) => piece?.type === "k" && piece.color === game.turn());
    if (column >= 0) return [`${files[column]}${8 - row}`];
  }
  return [];
}

function formatMove(san: string, piece: string, promotion?: string): string {
  if (promotion === "n") return san.replace(/=N/, "=K");
  if (piece === "n") return san.replace(/^N/, "K").replace(/x([a-h][1-8])/, (_match, square: string) => `x${square.toUpperCase()}`);
  if (piece === "k") return san.replace(/^K/, "Король ").replace(/x([a-h][1-8])/, (_match, square: string) => `x${square.toUpperCase()}`);
  if (piece !== "p") return san.replace(/x([a-h][1-8])/, (_match, square: string) => `x${square.toUpperCase()}`);
  return san;
}

function applyMove(game: Chess, move: MoveSpec): RecordStage {
  const beforePieces = readPosition(game);
  const played = game.move(move);
  return {
    prompt: `Запишіть хід ${played.color === "w" ? "білих" : "чорних"}.`,
    from: move.from,
    to: move.to,
    beforePieces,
    pieces: readPosition(game),
    checkedSquares: kingInCheck(game),
    record: formatMove(played.san, played.piece, played.promotion),
  };
}

function makeLine(fen: string, moves: MoveSpec[]): RecordStage[] {
  const game = new Chess(fen);
  return moves.map((move) => applyMove(game, move));
}

function makeScenario({ fen, setup = [], move }: Scenario): RecordStage {
  const game = new Chess(fen);
  setup.forEach((step) => game.move(step));
  return applyMove(game, move);
}

const levels: PracticeLevel[] = [
  {
    title: "Початковий",
    description: "П’ять простих ходів різними фігурами. Запиши поле, куди прийшла фігура.",
    stages: makeLine(new Chess().fen(), [
      { from: "e2", to: "e4" }, { from: "e7", to: "e5" }, { from: "g1", to: "f3" }, { from: "b8", to: "c6" }, { from: "f1", to: "c4" },
    ]),
  },
  {
    title: "Середній",
    description: "Взяття, ходи короля, шах і мат, коротка та довга рокіровка білими.",
    stages: [
      makeScenario({ fen: "7k/8/8/4n3/2N5/8/8/K7 w - - 0 1", move: { from: "c4", to: "e5" } }),
      makeScenario({ fen: "7k/8/8/3r4/8/8/8/K2Q4 w - - 0 1", move: { from: "d1", to: "d5" } }),
      makeScenario({ fen: "k7/8/8/8/4K3/8/8/8 w - - 0 1", move: { from: "e4", to: "f4" } }),
      makeScenario({ fen: "4k3/8/8/8/8/8/4Q3/4K3 w - - 0 1", move: { from: "e2", to: "e7" } }),
      makeScenario({ fen: whiteMateFen, move: { from: "g6", to: "g7" } }),
      makeScenario({ fen: kingsideAndQueensideCastleFen, move: { from: "e1", to: "g1" } }),
      makeScenario({ fen: kingsideAndQueensideCastleFen, move: { from: "e1", to: "c1" } }),
    ],
  },
  {
    title: "Складний",
    description: "Перетворення пішака, мат і рокіровка білими та чорними в обидва боки.",
    stages: [
      makeScenario({ fen: promotionWhiteFen, move: { from: "a7", to: "a8", promotion: "q" } }),
      makeScenario({ fen: promotionWhiteFen, move: { from: "a7", to: "a8", promotion: "n" } }),
      makeScenario({ fen: promotionBlackFen, move: { from: "a2", to: "a1", promotion: "q" } }),
      makeScenario({ fen: whiteMateFen, move: { from: "g6", to: "g7" } }),
      makeScenario({ fen: new Chess().fen(), setup: [{ from: "f2", to: "f3" }, { from: "e7", to: "e5" }, { from: "g2", to: "g4" }], move: { from: "d8", to: "h4" } }),
      makeScenario({ fen: kingsideAndQueensideCastleFen, move: { from: "e1", to: "g1" } }),
      makeScenario({ fen: kingsideAndQueensideCastleFen, move: { from: "e1", to: "c1" } }),
      makeScenario({ fen: kingsideAndQueensideCastleFen.replace(" w ", " b "), move: { from: "e8", to: "g8" } }),
      makeScenario({ fen: kingsideAndQueensideCastleFen.replace(" w ", " b "), move: { from: "e8", to: "c8" } }),
    ],
  },
];

function normaliseRecord(value: string) {
  return value.trim().toLowerCase().replace(/\s/g, "").replace(/0/g, "o");
}

export function NotationPractice({ onComplete }: { onComplete: (stars: number) => void }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [historyCursor, setHistoryCursor] = useState(1);
  const [board, setBoard] = useState<BoardPosition>(levels[0].stages[0].pieces);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [stageDone, setStageDone] = useState(false);
  const [earnedTasks, setEarnedTasks] = useState<string[]>([]);
  const level = levels[levelIndex];
  const stage = level.stages[stageIndex];
  const taskKey = `${levelIndex}:${stageIndex}`;
  const isReviewing = historyCursor !== stageIndex + 1;
  const historyStage = historyCursor > 0 ? level.stages[historyCursor - 1] : undefined;
  const totalTasks = levels.reduce((count, currentLevel) => count + currentLevel.stages.length, 0);

  useEffect(() => {
    setLevelIndex(0); setUnlockedLevel(0); setStageIndex(0); setHistoryCursor(1); setBoard(levels[0].stages[0].pieces);
    setAnswer(""); setFeedback(""); setStageDone(false); setEarnedTasks([]);
  }, []);

  const selectLevel = (index: number) => {
    if (index > unlockedLevel) return;
    setLevelIndex(index); setStageIndex(0); setHistoryCursor(1); setBoard(levels[index].stages[0].pieces);
    setAnswer(""); setFeedback(""); setStageDone(false);
  };

  const checkAnswer = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (stageDone || isReviewing) return;
    if (normaliseRecord(answer) !== normaliseRecord(stage.record)) {
      setFeedback("Спробуй ще раз: перевір, куди прийшла фігура та чи є знак взяття, шаху або мату.");
      return;
    }
    setStageDone(true);
    setEarnedTasks((current) => current.includes(taskKey) ? current : [...current, taskKey]);
    setFeedback("Правильно!");
  };

  const continuePractice = () => {
    if (stageIndex < level.stages.length - 1) {
      const next = stageIndex + 1;
      setStageIndex(next); setHistoryCursor(next + 1); setBoard(level.stages[next].pieces);
      setAnswer(""); setFeedback(""); setStageDone(false);
      return;
    }
    if (levelIndex < levels.length - 1) {
      const nextLevel = levelIndex + 1;
      setUnlockedLevel((current) => Math.max(current, nextLevel));
      setLevelIndex(nextLevel); setStageIndex(0); setHistoryCursor(1); setBoard(levels[nextLevel].stages[0].pieces);
      setAnswer(""); setFeedback(""); setStageDone(false);
      return;
    }
    onComplete(earnedTasks.length);
  };

  const inspectHistory = (cursor: number) => {
    setHistoryCursor(cursor);
    setBoard(cursor === 0 ? level.stages[0].beforePieces : level.stages[cursor - 1].pieces);
  };

  return (
    <section className="rules-practice notation-practice" aria-labelledby="notation-practice-title">
      <header className="rules-practice__intro">
        <span className="lesson-kicker">Практика • рівень {levelIndex + 1} з {levels.length}</span>
        <h2 id="notation-practice-title">Веди запис ходу</h2>
        <p>{level.description}</p>
      </header>
      <nav className="notation-practice__levels" aria-label="Рівні складності">
        {levels.map((item, index) => (
          <button key={item.title} className={`notation-practice__level${index === levelIndex ? " is-active" : ""}${index > unlockedLevel ? " is-locked" : ""}`} type="button" disabled={index > unlockedLevel} aria-current={index === levelIndex ? "step" : undefined} onClick={() => selectLevel(index)}>
            <span>Рівень {index + 1}</span><strong>{item.title}</strong><small>{item.stages.length} завдань</small>{index > unlockedLevel && <Lock size={15} aria-hidden="true" />}
          </button>
        ))}
      </nav>
      <div className="notation-practice__task-count">Завдання {stageIndex + 1} з {level.stages.length}</div>
      <div className="rules-practice__layout">
        <ChessboardGrid label="Шахівниця для практики запису ходів" pieces={board} checkedSquares={historyStage?.checkedSquares ?? []} highlightedSquares={historyStage ? [historyStage.from, historyStage.to] : []} />
        <aside className="rules-practice__side">
          <p className="rules-practice__turn-prompt">{stage.prompt}</p>
          <p className="rules-practice__feedback" role="status" aria-live="polite">{feedback}</p>
          {!stageDone && <form className="rules-practice__record" onSubmit={checkAnswer}>
            <input value={answer} onChange={(event) => setAnswer(event.target.value.replace(/[^\p{L}0-9+#=\s-]/giu, "").slice(0, 16))} placeholder="Запишіть хід" autoComplete="off" aria-label="Запишіть хід" disabled={isReviewing} />
            <button className="lesson-button lesson-button--primary" type="submit" disabled={isReviewing}>Перевірити</button>
          </form>}
          {!stageDone && <button className="lesson-button lesson-button--secondary" type="button" disabled={isReviewing} onClick={() => { setFeedback(`Правильна відповідь: ${stage.record}`); setStageDone(true); }}>Не знаю відповіді</button>}
          <div className="rules-practice__stars" aria-label={`${earnedTasks.length} зірок із ${totalTasks}`}>
            {Array.from({ length: totalTasks }, (_, index) => (
              <span key={index} className={index < earnedTasks.length ? "is-earned" : undefined} aria-hidden="true">
                {index < earnedTasks.length ? "★" : "☆"}
              </span>
            ))}
          </div>
          <nav className="rules-practice__history" aria-label="Перегляд ходів">
            <button type="button" aria-label="Попередній хід" disabled={historyCursor === 0} onClick={() => inspectHistory(historyCursor - 1)}><ChevronLeft size={22} /></button>
            <button type="button" aria-label="Наступний хід" disabled={historyCursor >= stageIndex + 1} onClick={() => inspectHistory(historyCursor + 1)}><ChevronRight size={22} /></button>
          </nav>
          {stageDone && <button className="lesson-button lesson-button--primary" type="button" onClick={continuePractice}>{stageIndex === level.stages.length - 1 ? levelIndex === levels.length - 1 ? "Завершити практику" : `Перейти на рівень ${levelIndex + 2}` : "Наступне завдання"}<Check size={16} /></button>}
        </aside>
      </div>
    </section>
  );
}
