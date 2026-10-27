import { useState } from "react";
import type { LessonMovement } from "../../features/lessons/lessonTypes";
import { ChessboardGrid, type ChessPiece } from "./ChessboardGrid";
import "./MovementDiagram.scss";

export function MovementDiagram({ movement }: { movement: LessonMovement }) {
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const isPawn = movement.piece.endsWith("P");
  const piece = `${orientation === "white" ? "w" : "b"}${movement.piece.slice(1)}` as ChessPiece;
  const captureSquare = orientation === "white" ? "f5" : "f3";
  const pieces: Partial<Record<string, ChessPiece>> = {
    [movement.center]: piece,
    ...(isPawn ? { [captureSquare]: orientation === "white" ? "bP" as ChessPiece : "wP" as ChessPiece } : {}),
  };
  const markedSquares = isPawn ? [captureSquare] : movement.squares;

  return (
    <section className="movement-diagram" aria-label={`Візуалізація ходу: ${movement.title}`}>
      <div className="movement-diagram__copy">
        <span className="lesson-kicker">Подивись, як ходить фігура</span>
        <h2>{movement.title}</h2>
        <p>{movement.description}</p>
        <div className="movement-diagram__legend"><span /><span>{isPawn ? "Поле взяття: тут стоїть фігура суперника" : "Можливі клітинки ходу"}</span></div>
        <div className="movement-diagram__switch" role="group" aria-label="Орієнтація шахівниці">
          <button type="button" aria-pressed={orientation === "white"} onClick={() => setOrientation("white")}>Білі</button>
          <button type="button" aria-pressed={orientation === "black"} onClick={() => setOrientation("black")}>Чорні</button>
        </div>
      </div>
      <div className="movement-diagram__board">
        <ChessboardGrid label="Дошка з прикладом ходів" pieces={pieces} orientation={orientation} legalSquares={markedSquares} selectedSquare={movement.center} />
      </div>
      <div className="movement-diagram__notation">
        <div><strong>Де стоїть на початку</strong><span>{movement.startPositions}</span></div>
        <div><strong>Так записуємо хід</strong><code>{movement.notationExample}</code><span>{movement.notationExplanation}</span></div>
      </div>
    </section>
  );
}
