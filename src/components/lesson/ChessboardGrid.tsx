import { useLayoutEffect, useRef, useState, type CSSProperties, type DragEvent, type MouseEvent } from "react";
import "./ChessboardGrid.scss";

const files = "abcdefgh".split("");
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
export type ChessPiece = `${"w" | "b"}${"K" | "Q" | "R" | "B" | "N" | "P"}`;
const pieceNames: Record<string,string> = { K:"король",Q:"ферзь",R:"тура",B:"слон",N:"кінь",P:"пішак" };

type Props = {
  pieces: Partial<Record<string, ChessPiece>>;
  orientation?: "white" | "black";
  legalSquares?: string[];
  highlightedSquares?: string[];
  checkedSquares?: string[];
  stars?: Partial<Record<string, string>>;
  selectedSquare?: string | null;
  label: string;
  onSquareClick?: (square: string) => void;
  onContextMenu?: (event: MouseEvent<HTMLButtonElement>, square: string) => void;
  onPieceDragStart?: (event: DragEvent<HTMLButtonElement>, square: string) => void;
  onSquareDragOver?: (event: DragEvent<HTMLButtonElement>) => void;
  onSquareDrop?: (event: DragEvent<HTMLButtonElement>, square: string) => void;
};

export function ChessboardGrid({ pieces, orientation = "white", legalSquares = [], highlightedSquares = [], checkedSquares = [], stars = {}, selectedSquare, label, onSquareClick, onContextMenu, onPieceDragStart, onSquareDragOver, onSquareDrop }: Props) {
  const visibleFiles = orientation === "white" ? files : [...files].reverse();
  const visibleRanks = orientation === "white" ? ranks : [...ranks].reverse();
  const previous = useRef({ pieces, orientation });
  const [movingPieces, setMovingPieces] = useState<Record<string, { x: number; y: number }>>({});
  const animationTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useLayoutEffect(() => {
    const before = previous.current;
    previous.current = { pieces, orientation };
    if (before.orientation !== orientation) return;
    const filesInView = orientation === "white" ? files : [...files].reverse();
    const ranksInView = orientation === "white" ? ranks : [...ranks].reverse();

    const origins = Object.entries(before.pieces).filter(([square, piece]) => piece && !pieces[square]);
    const nextMoving: Record<string, { x: number; y: number }> = {};
    const usedOrigins = new Set<string>();
    for (const [toSquare, piece] of Object.entries(pieces)) {
      if (!piece || before.pieces[toSquare] === piece) continue;
      const origin = origins.find(([fromSquare, fromPiece]) => fromPiece === piece && !usedOrigins.has(fromSquare));
      if (!origin) continue;
      const [fromFile, fromRank] = [origin[0][0], Number(origin[0][1])];
      const [toFile, toRank] = [toSquare[0], Number(toSquare[1])];
      const x = filesInView.indexOf(fromFile) - filesInView.indexOf(toFile);
      const y = ranksInView.indexOf(fromRank) - ranksInView.indexOf(toRank);
      if (x || y) {
        nextMoving[toSquare] = { x: x * 121, y: y * 121 };
        usedOrigins.add(origin[0]);
      }
    }
    if (animationTimer.current) clearTimeout(animationTimer.current);
    setMovingPieces(nextMoving);
    if (Object.keys(nextMoving).length) animationTimer.current = setTimeout(() => setMovingPieces({}), 420);
    return () => { if (animationTimer.current) clearTimeout(animationTimer.current); };
  }, [pieces, orientation]);

  return (
    <div className="chessboard-grid" role="group" aria-label={label}>
      {visibleRanks.flatMap((rank) => visibleFiles.map((file) => {
        const square = `${file}${rank}`;
        const piece = pieces[square];
        const isLegal = legalSquares.includes(square);
        const isHighlighted = highlightedSquares.includes(square);
        const isChecked = checkedSquares.includes(square);
        const isStar = Boolean(stars[square]);
        const isDark = (files.indexOf(file) + rank) % 2 === 1;
        return (
          <button
            aria-label={`${square}${piece ? `, ${pieceNames[piece[1]]} ${piece[0] === "w" ? "білий" : "чорний"}` : ""}${isHighlighted ? ", можливий хід" : ""}${isLegal ? ", дозволений хід" : ""}${isStar ? ", ціль" : ""}${isChecked ? ", король під шахом" : ""}`}
            className={`chessboard-grid__square${isDark ? " is-dark" : ""}${isLegal ? " is-legal" : ""}${isHighlighted ? " is-highlighted" : ""}${isChecked ? " is-in-check" : ""}${selectedSquare === square ? " is-selected" : ""}${isStar ? " has-star" : ""}${piece && isLegal ? " has-piece" : ""}${movingPieces[square] ? " is-piece-moving" : ""}`}
            draggable={Boolean(piece && onPieceDragStart)}
            key={square}
            onClick={() => onSquareClick?.(square)}
            onContextMenu={onContextMenu ? (event) => onContextMenu(event, square) : undefined}
            onDragStart={onPieceDragStart ? (event) => onPieceDragStart(event, square) : undefined}
            onDragOver={onSquareDragOver ? (event) => onSquareDragOver(event) : undefined}
            onDrop={onSquareDrop ? (event) => onSquareDrop(event, square) : undefined}
            type="button"
          >
            {piece && <img className={movingPieces[square] ? "chessboard-grid__piece--moving" : undefined} style={movingPieces[square] ? ({ "--piece-from-x": `${movingPieces[square].x}%`, "--piece-from-y": `${movingPieces[square].y}%` } as CSSProperties) : undefined} src={`/chess-pieces/${piece}.svg`} alt="" draggable={false} />}
            {stars[square] && <span className="chessboard-grid__star" aria-hidden="true">{stars[square]}</span>}
            {file === (orientation === "white" ? "a" : "h") && <span className="chessboard-grid__rank">{rank}</span>}
            {rank === (orientation === "white" ? 1 : 8) && <span className="chessboard-grid__file">{file}</span>}
          </button>
        );
      }))}
    </div>
  );
}
