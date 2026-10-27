import { useEffect, useMemo, useState } from "react";
import { Dumbbell, RotateCcw } from "lucide-react";
import { Chess, type Square } from "chess.js";
import type { LessonMovement } from "../../features/lessons/lessonTypes";
import { ChessboardGrid, type ChessPiece } from "./ChessboardGrid";
import "./MovementDiagram.scss";

function createPracticeFen(movement: LessonMovement, color: "w" | "b") {
  const isKing = movement.piece.endsWith("K");
  const position: Record<string, string> = color === "w"
    ? (isKing ? { h8: "k" } : { a1: "K", h8: "k" })
    : (isKing ? { a1: "K" } : { a1: "K", h8: "k" });
  const piece = `${color === "w" ? "w" : "b"}${movement.piece[1]}`;
  position[movement.center] = color === "w" ? piece[1] : piece[1].toLowerCase();
  if (movement.piece.endsWith("P")) position[color === "w" ? "f5" : "f3"] = color === "w" ? "p" : "P";
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

function readPieces(game: Chess): Partial<Record<string, ChessPiece>> {
  const pieces: Partial<Record<string, ChessPiece>> = {};
  game.board().forEach((rank, row) => rank.forEach((piece, column) => {
    if (piece) pieces[`${"abcdefgh"[column]}${8 - row}`] = `${piece.color}${piece.type.toUpperCase()}` as ChessPiece;
  }));
  return pieces;
}

export function MovementDiagram({ movement, onPractice }: { movement: LessonMovement; onPractice: () => void }) {
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [positionFen, setPositionFen] = useState(() => createPracticeFen(movement, "w"));
  const [pieceSquare, setPieceSquare] = useState(movement.center);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const game = useMemo(() => new Chess(positionFen), [positionFen]);
  const color = orientation === "white" ? "w" : "b";
  const isPawn = movement.piece.endsWith("P");
  const legalSquares = selectedSquare === pieceSquare
    ? game.moves({ square: pieceSquare as Square, verbose: true }).map((move) => move.to)
    : [];
  const captureSquare = orientation === "white" ? "f5" : "f3";

  useEffect(() => {
    const nextFen = createPracticeFen(movement, color);
    setPositionFen(nextFen);
    setPieceSquare(movement.center);
    setSelectedSquare(null);
  }, [movement, color]);

  const chooseSide = (side: "white" | "black") => {
    setOrientation(side);
    setPositionFen(createPracticeFen(movement, side === "white" ? "w" : "b"));
    setPieceSquare(movement.center);
    setSelectedSquare(null);
  };

  const clickSquare = (square: string) => {
    if (square === pieceSquare) { setSelectedSquare(selectedSquare === square ? null : square); return; }
    if (!selectedSquare || !legalSquares.includes(square as Square)) { setSelectedSquare(null); return; }
    const nextGame = new Chess(positionFen);
    try {
      nextGame.move({ from: pieceSquare, to: square, promotion: square[1] === "8" || square[1] === "1" ? "q" : undefined });
      setPositionFen(nextGame.fen());
      setPieceSquare(square);
      setSelectedSquare(null);
    } catch {
      setSelectedSquare(null);
    }
  };

  const reset = () => {
    setPositionFen(createPracticeFen(movement, color));
    setPieceSquare(movement.center);
    setSelectedSquare(null);
  };

  const pieces = readPieces(game);
  return (
    <section className="movement-diagram" aria-label={`Візуалізація ходу: ${movement.title}`}>
      <div className="movement-diagram__copy">
        <span className="lesson-kicker">Подивись і спробуй сам</span>
        <h2>{movement.title}</h2>
        <p>{movement.description}</p>
        <div className="movement-diagram__legend"><span /><span>{isPawn ? "Пішак б’є тільки фігуру навскіс; порожнє поле не можна бити." : "Обери фігуру — сірі кружечки покажуть її дозволені ходи."}</span></div>
        <div className="movement-diagram__switch" role="group" aria-label="Колір фігури та бік огляду дошки">
          <button type="button" aria-pressed={orientation === "white"} onClick={() => chooseSide("white")}>Білі</button>
          <button type="button" aria-pressed={orientation === "black"} onClick={() => chooseSide("black")}>Чорні</button>
        </div>
      </div>
      <div className="movement-diagram__board">
        <ChessboardGrid label="Інтерактивна дошка для перевірки дозволених ходів" pieces={pieces} orientation={orientation} selectedSquare={selectedSquare} legalSquares={legalSquares} onSquareClick={clickSquare} />
        <div className="movement-diagram__board-actions">
          <button type="button" className="lesson-button lesson-button--secondary" onClick={reset}><RotateCcw size={15} /> Повернути фігуру</button>
          <button type="button" className="lesson-button lesson-button--primary" onClick={onPractice}><Dumbbell size={15} /> Практика</button>
        </div>
        {isPawn && <p className="movement-diagram__capture-note">Фігура суперника для взяття стоїть на {captureSquare.toUpperCase()}.</p>}
        <span className="movement-diagram__caption" aria-live="polite">Фігура зараз на {pieceSquare.toUpperCase()}. Перевір дозволені ходи.</span>
      </div>
      <div className="movement-diagram__notation">
        <div><strong>Де стоїть на початку</strong><span>{movement.startPositions}</span></div>
        <div><strong>Так записуємо хід</strong><code>{movement.notationExample}</code><span>{movement.notationExplanation}</span></div>
      </div>
    </section>
  );
}
