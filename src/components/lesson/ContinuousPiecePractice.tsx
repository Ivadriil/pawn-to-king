import { useState, type DragEvent } from "react";
import { Check } from "lucide-react";
import { Chess, type Square } from "chess.js";
import { ChessboardGrid, type ChessPiece } from "./ChessboardGrid";
import "./ContinuousPiecePractice.scss";

type PieceCode = `${"w" | "b"}${"K" | "Q" | "R" | "B" | "N" | "P"}`;
type Mission = { title: string; instrumental: string; start: string; stars: string[] };

const missions: Record<string, Mission> = {
  "piece-king": { title: "Король", instrumental: "королем", start: "e4", stars: ["f5", "g6", "h7", "h8", "g8"] },
  "piece-queen": { title: "Ферзь", instrumental: "ферзем", start: "e4", stars: ["e5", "e6", "e7", "e8", "h8"] },
  "piece-rook": { title: "Тура", instrumental: "турою", start: "e4", stars: ["e5", "e8", "h8", "h5", "a5"] },
  "piece-bishop": { title: "Слон", instrumental: "слоном", start: "e4", stars: ["f5", "g6", "h7", "g8", "f7"] },
  "piece-knight": { title: "Кінь", instrumental: "конем", start: "d4", stars: ["f5", "h4", "g6", "e5", "c6"] },
  "piece-pawn": { title: "Пішак", instrumental: "пішаком", start: "e2", stars: ["e4", "e5", "e6", "e7", "e8"] },
};

function makeFen(piece: PieceCode, square: string) {
  const color = piece[0] as "w" | "b";
  const type = piece[1];
  const promoted = type === "P" && (square[1] === "8" || square[1] === "1");
  const displayedType = promoted ? "Q" : type;
  const isKing = type === "K";
  const position: Record<string, string> = color === "w"
    ? (isKing ? { b6: "k" } : { a1: "K", b6: "k" })
    : (isKing ? { b6: "K" } : { b6: "K", h8: "k" });
  position[square] = color === "w" ? displayedType : displayedType.toLowerCase();
  const ranks = Array.from({ length: 8 }, (_, row) => {
    let empty = 0;
    let result = "";
    for (const file of "abcdefgh") {
      const item = position[`${file}${8 - row}`];
      if (item) { if (empty) result += empty; result += item; empty = 0; }
      else empty += 1;
    }
    if (empty) result += empty;
    return result;
  });
  return `${ranks.join("/")} ${color} - - 0 1`;
}

function boardPieces(game: Chess): Partial<Record<string, ChessPiece>> {
  const pieces: Partial<Record<string, ChessPiece>> = {};
  game.board().forEach((rank, row) => rank.forEach((item, column) => {
    if (item) pieces[`${"abcdefgh"[column]}${8 - row}`] = `${item.color}${item.type.toUpperCase()}` as ChessPiece;
  }));
  return pieces;
}

export function ContinuousPiecePractice({ lessonId, piece, onComplete }: { lessonId: string; piece: string; onComplete: (stars: number) => void }) {
  const mission = missions[lessonId];
  const code = piece as PieceCode;
  const startPosition = code[0] === "b" && lessonId === "piece-pawn" ? "e7" : mission?.start ?? "e4";
  const [position, setPosition] = useState(startPosition);
  const [selected, setSelected] = useState(false);
  const [collected, setCollected] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);
  const [completionPercent, setCompletionPercent] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("Зірочки стоять на дошці від початку. Збери всі п’ять дозволеними ходами.");
  if (!mission) return null;

  const starSquares = code[0] === "b" && lessonId === "piece-pawn" ? ["e5", "e4", "e3", "e2", "e1"] : mission.stars;
  const fen = makeFen(code, position);
  const game = new Chess(fen);
  const legalSquares = selected
    ? game.moves({ square: position as Square, verbose: true }).map((move) => move.to)
    : [];
  const renderedCode = code[1] === "P" && (position[1] === "8" || position[1] === "1") ? `${code[0]}Q` as PieceCode : code;

  const moveTo = (square: string) => {
    if (finished) return;
    const nextGame = new Chess(fen);
    try {
      nextGame.move({ from: position as Square, to: square as Square, promotion: square[1] === "8" || square[1] === "1" ? "q" : undefined });
    } catch {
      setMistakes((count) => count + 1);
      setFeedback("Це неможливий хід за правилами шахів. Обирай поле з підсвіченим кружечком.");
      return;
    }
    const nextMoves = moves + 1;
    setPosition(square);
    setMoves(nextMoves);
    setSelected(false);
    if (starSquares.includes(square) && !collected.includes(square)) {
      const nextCollected = [...collected, square];
      setCollected(nextCollected);
      if (nextCollected.length === starSquares.length) {
        const percent = Math.max(50, 100 - Math.max(0, nextMoves - starSquares.length) * 10);
        const bonus = nextMoves === starSquares.length ? 1 : 0;
        setFinished(true);
        setCompletionPercent(percent);
        setFeedback(bonus ? "Усі зірочки зібрано найкоротшим шляхом! Бонусна зірка твоя!" : `Усі зірочки зібрано. Результат — ${percent}%. Спробуй ще раз, щоб знайти коротший шлях.`);
        onComplete(nextCollected.length + bonus);
      } else setFeedback(`Зірочку зібрано — ${nextCollected.length} з ${starSquares.length}. Продовжуй маршрут.`);
      return;
    }
    setFeedback("Фігура перейшла на нове поле. Збирай зірочки найкоротшим дозволеним шляхом.");
  };

  const dropPiece = (event: DragEvent<HTMLButtonElement>, square: string) => {
    event.preventDefault();
    if (event.dataTransfer.getData("application/continuous-piece") === "piece") moveTo(square);
  };

  const earned = collected.length;
  const pieces = { ...boardPieces(game), [position]: renderedCode };
  const stars = Object.fromEntries(starSquares.filter((square) => !collected.includes(square)).map((square) => [square, "★"]));

  return (
    <section className="continuous-practice" aria-labelledby="continuous-practice-title">
      <div className="continuous-practice__intro">
        <span className="lesson-kicker">Одна позиція • {starSquares.length} зірочок</span>
        <h2 id="continuous-practice-title">Збери всі зірочки {mission.instrumental}</h2>
        <p>Усі цілі стоять на дошці від початку. Ходи лише за правилами шахів: за найкоротший маршрут отримаєш 100% і бонусну зірку; довший маршрут теж зарахується, але з нижчим відсотком.</p>
      </div>

      <div className="continuous-practice__layout">
        <ChessboardGrid
          label="Одна шахівниця для безперервної практики"
          pieces={pieces}
          legalSquares={selected ? legalSquares : []}
          selectedSquare={selected ? position : null}
          stars={stars}
          onSquareClick={(square) => square === position ? setSelected(true) : selected && legalSquares.includes(square as Square) ? moveTo(square) : undefined}
          onContextMenu={(event) => event.preventDefault()}
          onPieceDragStart={(event) => event.dataTransfer.setData("application/continuous-piece", "piece")}
          onSquareDragOver={(event) => event.preventDefault()}
          onSquareDrop={dropPiece}
        />

        <aside className="continuous-practice__score">
          <div className="continuous-practice__piece"><img src={`${import.meta.env.BASE_URL}chess-pieces/${renderedCode}.svg`} alt="" /><strong>{mission.title}</strong></div>
          <p className="continuous-practice__feedback" role="status" aria-live="polite">{feedback}</p>
          <div className="continuous-practice__stats"><span>Ходів: <strong>{moves}</strong></span><span>Помилок: <strong>{mistakes}</strong></span></div>
          <div className="continuous-practice__stars" aria-label={`${earned} зірок із ${starSquares.length + 1}`}>{"★".repeat(earned)}{"☆".repeat(starSquares.length - earned)}{completionPercent === 100 ? "★" : "☆"}</div>
          {finished && <div className="continuous-practice__complete" role="status"><Check size={18} /><span>Усі зірочки зібрано за {moves} ходів. Результат — {completionPercent}%. {completionPercent === 100 ? "Бонусна зірка за найкоротший шлях!" : `Для 100% потрібно вкластися у ${starSquares.length} ходів.`}</span></div>}
        </aside>
      </div>
    </section>
  );
}
