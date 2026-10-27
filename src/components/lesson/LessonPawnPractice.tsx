import { useState, type DragEvent, type MouseEvent } from "react";
import { Check, RotateCcw } from "lucide-react";
import "./LessonPawnPractice.scss";

type PawnColor = "white" | "black";
type Placement = Partial<Record<string, PawnColor>>;

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

export function LessonPawnPractice({ onComplete }: { onComplete: (stars: number) => void }) {
  const [placement, setPlacement] = useState<Placement>({});
  const [selectedColor, setSelectedColor] = useState<PawnColor | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isLessonFinished, setIsLessonFinished] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [stars, setStars] = useState(0);

  const placePawn = (square: string, color: PawnColor, from?: string) => {
    setPlacement((current) => {
      const next = { ...current };
      if (from) delete next[from];
      next[square] = color;
      return next;
    });
    setIsComplete(false);
  };

  const handleSquareRightClick = (event: MouseEvent<HTMLButtonElement>, square: string) => {
    event.preventDefault();
    setPlacement((current) => {
      const next = { ...current };
      delete next[square];
      return next;
    });
    setIsComplete(false);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>, square: string) => {
    event.preventDefault();
    const color = event.dataTransfer.getData("application/chess-pawn-color") as PawnColor;
    const from = event.dataTransfer.getData("application/chess-pawn-square");
    if (color === "white" || color === "black") placePawn(square, color, from || undefined);
  };

  const checkPosition = () => {
    const expected = new Set([
      ...files.map((file) => `${file}2`),
      ...files.map((file) => `${file}7`),
    ]);
    const squares = Object.keys(placement);
    const correct = squares.length === expected.size
      && squares.every((square) => expected.has(square))
      && files.every((file) => placement[`${file}2`] === "white" && placement[`${file}7`] === "black");
    setAttempts((count) => count + 1);
    setIsComplete(correct);
    if (correct) setStars(attempts === 0 ? 3 : attempts < 3 ? 2 : 1);
  };

  const resetBoard = () => {
    setPlacement({});
    setSelectedColor(null);
    setIsComplete(false);
  };

  return (
    <section className="pawn-practice" aria-labelledby="pawn-practice-title">
      <div className="pawn-practice__intro">
        <span className="lesson-kicker">Практика</span>
        <h2 id="pawn-practice-title">Розстав пішаків на свої місця</h2>
        <p>Білі пішаки мають стояти на другому ряду, а чорні — на сьомому. Перетягни пішака або вибери його й торкнися клітинки. Щоб прибрати пішака з дошки, натисни на нього правою кнопкою.</p>
      </div>

      <div className="pawn-practice__layout">
        <div className="pawn-practice__board-wrap">
          <div className="pawn-practice__board" role="group" aria-label="Квадратна шахівниця для розстановки пішаків">
            {ranks.flatMap((rank) => files.map((file, fileIndex) => {
              const square = `${file}${rank}`;
              const color = placement[square];
              const isDark = (fileIndex + rank) % 2 === 1;
              return <button aria-label={`${square}${color ? `, ${color === "white" ? "білий" : "чорний"} пішак` : ""}`} className={`pawn-practice__square${isDark ? " pawn-practice__square--dark" : ""}${color ? " pawn-practice__square--occupied" : ""}`} key={square} onClick={() => selectedColor && placePawn(square, selectedColor)} onContextMenu={(event) => { event.preventDefault(); handleSquareRightClick(event, square); }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, square)} onDragStart={(event) => { if (!color) return; event.dataTransfer.setData("application/chess-pawn-color", color); event.dataTransfer.setData("application/chess-pawn-square", square); }} draggable={Boolean(color)} type="button">
                {color && <img src={`${import.meta.env.BASE_URL}chess-pieces/${color === "white" ? "wP" : "bP"}.svg`} alt={`${color === "white" ? "Білий" : "Чорний"} пішак`} draggable={false} />}
                {file === "a" && <span className="pawn-practice__rank">{rank}</span>}
                {rank === 1 && <span className="pawn-practice__file">{file}</span>}
              </button>;
            }))}
          </div>
          <button className="pawn-practice__reset" onClick={resetBoard} type="button"><RotateCcw size={15} /> Очистити дошку</button>
        </div>

        <div className="pawn-practice__tools">
          <h3>Обери пішака</h3>
          <button
            aria-label="Обрати білого пішака для розстановки"
            aria-pressed={selectedColor === "white"}
            className={`pawn-practice__piece${selectedColor === "white" ? " is-selected" : ""}`}
            draggable
            onClick={() => setSelectedColor("white")}
            onContextMenu={(event) => event.preventDefault()}
            onDragStart={(event) => event.dataTransfer.setData("application/chess-pawn-color", "white")}
            type="button"
          >
            <img src={`${import.meta.env.BASE_URL}chess-pieces/wP.svg`} alt="" />
          </button>
          <button
            aria-label="Обрати чорного пішака для розстановки"
            aria-pressed={selectedColor === "black"}
            className={`pawn-practice__piece${selectedColor === "black" ? " is-selected" : ""}`}
            draggable
            onClick={() => setSelectedColor("black")}
            onContextMenu={(event) => event.preventDefault()}
            onDragStart={(event) => event.dataTransfer.setData("application/chess-pawn-color", "black")}
            type="button"
          >
            <img src={`${import.meta.env.BASE_URL}chess-pieces/bP.svg`} alt="" />
          </button>
          <button className="lesson-button lesson-button--primary pawn-practice__check" onClick={checkPosition} type="button">
            Перевірити розстановку
          </button>
          {isComplete && (
            <div className="lesson-feedback lesson-feedback--correct" role="status">
              {"★".repeat(stars)} Чудово! Білі пішаки на другому ряду, чорні — на сьомому.
              <button className="lesson-button lesson-button--primary" onClick={() => { onComplete(stars); setIsLessonFinished(true); }} type="button" disabled={isLessonFinished}>
                {isLessonFinished ? <><Check size={16} /> Урок завершено</> : "Завершити урок"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

