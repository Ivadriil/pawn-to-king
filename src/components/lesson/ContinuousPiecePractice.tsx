import { useState, type DragEvent } from "react";
import { Check } from "lucide-react";
import { ChessboardGrid } from "./ChessboardGrid";
import "./ContinuousPiecePractice.scss";

type PieceCode = `${"w" | "b"}${"K" | "Q" | "R" | "B" | "N" | "P"}`;
type Mission = { title: string; instrumental: string; start: string; stars: string[] };

const files = "abcdefgh".split("");
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
const missions: Record<string, Mission> = {
  "piece-king": { title: "Король", instrumental: "королем", start: "e4", stars: ["f5", "g6", "h7", "h8", "g8"] },
  "piece-queen": { title: "Ферзь", instrumental: "ферзем", start: "e4", stars: ["e5", "e6", "e7", "e8", "h8"] },
  "piece-rook": { title: "Тура", instrumental: "турою", start: "e4", stars: ["e5", "e8", "h8", "h5", "a5"] },
  "piece-bishop": { title: "Слон", instrumental: "слоном", start: "e4", stars: ["f5", "g6", "h7", "g8", "f7"] },
  "piece-knight": { title: "Кінь", instrumental: "конем", start: "d4", stars: ["f5", "h4", "g6", "e5", "c6"] },
  "piece-pawn": { title: "Пішак", instrumental: "пішаком", start: "e2", stars: ["e4", "e5", "e6", "e7", "e8"] },
};

const xy = (square: string) => [files.indexOf(square[0]), Number(square[1])] as const;

function canMove(piece: string, from: string, to: string, color: "w" | "b") {
  const [x1, y1] = xy(from);
  const [x2, y2] = xy(to);
  const dx = Math.abs(x2 - x1);
  const signedDy = y2 - y1;
  const dy = Math.abs(signedDy);
  if (from === to || x2 < 0) return false;
  if (piece === "K") return dx <= 1 && dy <= 1;
  if (piece === "Q") return dx === 0 || dy === 0 || dx === dy;
  if (piece === "R") return dx === 0 || dy === 0;
  if (piece === "B") return dx === dy;
  if (piece === "N") return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
  if (piece === "P") { const direction = color === "w" ? 1 : -1; const startRank = color === "w" ? "2" : "7"; return dx === 0 && (signedDy === direction || (from[1] === startRank && signedDy === direction * 2)); }
  return false;
}

export function ContinuousPiecePractice({ lessonId, piece, onComplete }: { lessonId: string; piece: string; onComplete: (stars: number) => void }) {
  const mission = missions[lessonId];
  const code = piece as PieceCode;
  const startPosition = mission?.start ?? "e4";
  const [position, setPosition] = useState(code[0] === "b" && lessonId === "piece-pawn" ? "e7" : startPosition);
  const [selected, setSelected] = useState(false);
  const [collected, setCollected] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState("Зірочки вже на дошці. Обери фігуру та рухайся до них по черзі.");
  if (!mission) return null;

  const starSquares = code[0] === "b" && lessonId === "piece-pawn" ? ["e5", "e4", "e3", "e2", "e1"] : mission.stars;
  const legalSquares = ranks.flatMap((rank) => files.map((file) => `${file}${rank}`)).filter((square) => canMove(code[1], position, square, code[0] as "w"|"b"));

  const moveTo = (square: string) => {
    if (finished) return;
    if (!canMove(code[1], position, square, code[0] as "w"|"b")) {
      setMistakes((count) => count + 1);
      setFeedback("Так фігура не ходить. Спробуй клітинку з сірим кружечком.");
      return;
    }
    setPosition(square);
    setMoves((count) => count + 1);
    setSelected(false);
    if (starSquares.includes(square) && !collected.includes(square)) {
      const nextCollected = [...collected, square];
      setCollected(nextCollected);
      setFeedback(`Зірочку зібрано! ${nextCollected.length} із ${starSquares.length}.`);
      if (nextCollected.length === starSquares.length) {
        setFinished(true);
        setFeedback("Усі зірочки зібрано! Чудова робота!");
        onComplete(starSquares.length);
      }
      return;
    }
    setFeedback("Фігура перейшла на нову клітинку. Продовжуй шлях до зірочок!");
  };

  const dropPiece = (event: DragEvent<HTMLButtonElement>, square: string) => {
    event.preventDefault();
    if (event.dataTransfer.getData("application/continuous-piece") === "piece") moveTo(square);
  };

  const earned = collected.length;
  const pieces = { [position]: code };
  const stars = Object.fromEntries(starSquares.filter((square) => !collected.includes(square)).map((square) => [square, "★"]));

  return (
    <section className="continuous-practice" aria-labelledby="continuous-practice-title">
      <div className="continuous-practice__intro">
        <span className="lesson-kicker">Одна партія • {starSquares.length} зірочок</span>
        <h2 id="continuous-practice-title">Збери всі зірочки {mission.instrumental}</h2>
        <p>Усі цілі стоять на дошці від початку. Рухайся без скидання позиції, збирай зірочки й не ходи назад пішаком.</p>
      </div>

      <div className="continuous-practice__layout">
        <ChessboardGrid
          label="Одна шахівниця для безперервної практики"
          pieces={pieces}
          legalSquares={selected ? legalSquares : []}
          selectedSquare={selected ? position : null}
          stars={stars}
          onSquareClick={(square) => square === position ? setSelected(true) : selected && moveTo(square)}
          onContextMenu={(event) => event.preventDefault()}
          onPieceDragStart={(event) => event.dataTransfer.setData("application/continuous-piece", "piece")}
          onSquareDragOver={(event) => event.preventDefault()}
          onSquareDrop={dropPiece}
        />

        <aside className="continuous-practice__score">
          <div className="continuous-practice__piece"><img src={`/chess-pieces/${code}.svg`} alt="" /><strong>{mission.title}</strong></div>
          <p className="continuous-practice__feedback" role="status" aria-live="polite">{feedback}</p>
          <div className="continuous-practice__stats"><span>Ходів: <strong>{moves}</strong></span><span>Помилок: <strong>{mistakes}</strong></span></div>
          <div className="continuous-practice__stars" aria-label={`${earned} зірок із ${starSquares.length}`}>{"★".repeat(earned)}{"☆".repeat(starSquares.length - earned)}</div>
          {finished && <div className="continuous-practice__complete"><Check size={18} /><span>Усі зірочки зібрано за {moves} ходів!</span></div>}
        </aside>
      </div>
    </section>
  );
}
