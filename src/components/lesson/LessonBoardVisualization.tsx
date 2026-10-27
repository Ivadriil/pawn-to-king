import { useEffect, useRef, useState } from "react";
import { createBoard, type Chessboard as CoreChessboard, type ChessboardExtensionInput } from "@mirasen/chessboard";
import type { LessonBoard } from "../../features/lessons/lessonTypes";
import "./LessonBoardVisualization.scss";

const pieceUrls = {
  wK: `${import.meta.env.BASE_URL}chess-pieces/wK.svg`,
  wQ: `${import.meta.env.BASE_URL}chess-pieces/wQ.svg`,
  wR: `${import.meta.env.BASE_URL}chess-pieces/wR.svg`,
  wB: `${import.meta.env.BASE_URL}chess-pieces/wB.svg`,
  wN: `${import.meta.env.BASE_URL}chess-pieces/wN.svg`,
  wP: `${import.meta.env.BASE_URL}chess-pieces/wP.svg`,
  bK: `${import.meta.env.BASE_URL}chess-pieces/bK.svg`,
  bQ: `${import.meta.env.BASE_URL}chess-pieces/bQ.svg`,
  bR: `${import.meta.env.BASE_URL}chess-pieces/bR.svg`,
  bB: `${import.meta.env.BASE_URL}chess-pieces/bB.svg`,
  bN: `${import.meta.env.BASE_URL}chess-pieces/bN.svg`,
  bP: `${import.meta.env.BASE_URL}chess-pieces/bP.svg`,
} satisfies Record<string, string>;

const boardExtensions = [
  { builtin: "renderer", options: { pieceUrls } },
  "watermark",
  "selectedSquare",
  "lastMove",
  "activeTarget",
  "legalMoves",
  "events",
  "autoPromote",
  "promotion",
  "annotations",
  "check",
] as const satisfies readonly ChessboardExtensionInput[];

export function LessonBoardVisualization({ board }: { board: LessonBoard }) {
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const boardElement = useRef<HTMLDivElement | null>(null);
  const chessboard = useRef<CoreChessboard<typeof boardExtensions> | null>(null);

  useEffect(() => {
    if (!boardElement.current) return;

    const instance = createBoard({ element: boardElement.current, extensions: boardExtensions });
    chessboard.current = instance;
    instance.setPosition(board.position);
    instance.setOrientation(orientation);

    return () => {
      instance.destroy();
      chessboard.current = null;
    };
  }, []);

  useEffect(() => {
    chessboard.current?.setPosition(board.position);
  }, [board.position]);

  useEffect(() => {
    chessboard.current?.setOrientation(orientation);
  }, [orientation]);

  const changeOrientation = (nextOrientation: "white" | "black") => setOrientation(nextOrientation);

  return (
    <section className="lesson-visual-board" aria-labelledby="lesson-board-title">
      <div className="lesson-visual-board__copy">
        <span className="lesson-kicker">Подивись на дошку</span>
        <h2 id="lesson-board-title">{board.title}</h2>
        <p>{board.description}</p>

        <div className="lesson-visual-board__switch" role="group" aria-label="Змінити бік огляду дошки">
          <button type="button" aria-pressed={orientation === "white"} onClick={() => changeOrientation("white")}>
            ♙ Білі
          </button>
          <button type="button" aria-pressed={orientation === "black"} onClick={() => changeOrientation("black")}>
            ♟ Чорні
          </button>
        </div>

        <p className="lesson-visual-board__perspective" aria-live="polite">
          {orientation === "white" ? board.whitePerspective : board.blackPerspective}
        </p>

        <div className="lesson-visual-board__ranks" aria-label="Розташування фігур на рядах">
          <div><span className="lesson-visual-board__rank lesson-visual-board__rank--white">1–2</span><span>ряди білих</span></div>
          <div><span className="lesson-visual-board__rank lesson-visual-board__rank--black">7–8</span><span>ряди чорних</span></div>
        </div>
      </div>

      <div className="lesson-visual-board__frame">
        <div className="lesson-visual-board__board">
          <div ref={boardElement} className="lesson-visual-board__chessboard" />
        </div>
        <span className="lesson-visual-board__caption">Початкова позиція</span>
      </div>
    </section>
  );
}
