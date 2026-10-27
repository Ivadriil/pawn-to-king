import { useState, type DragEvent, type MouseEvent } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { ChessboardGrid, type ChessPiece } from "./ChessboardGrid";
import "./ChessboardPlayground.scss";

type Position = Partial<Record<string, ChessPiece>>;
const white: ChessPiece[] = ["wK","wQ","wR","wB","wN","wP"];
const black: ChessPiece[] = ["bK","bQ","bR","bB","bN","bP"];
const names: Record<string,string> = { K:"Король",Q:"Ферзь",R:"Тура",B:"Слон",N:"Кінь",P:"Пішак" };
const initialPosition = (): Position => {
  const result: Position = {a1:"wR",b1:"wN",c1:"wB",d1:"wQ",e1:"wK",f1:"wB",g1:"wN",h1:"wR",a8:"bR",b8:"bN",c8:"bB",d8:"bQ",e8:"bK",f8:"bB",g8:"bN",h8:"bR"};
  for (const file of "abcdefgh") { result[`${file}2`]="wP"; result[`${file}7` ]="bP"; }
  return result;
};

export function ChessboardPlayground() {
  const [board, setBoard] = useState<Position>({});
  const [selected, setSelected] = useState<ChessPiece | null>("wP");
  const [message, setMessage] = useState("Обери фігуру й розстав її на дошці або перетягни мишкою.");
  const place = (square: string, piece: ChessPiece) => { setBoard((current)=>({...current,[square]:piece}));setSelected(piece);setMessage(`${names[piece[1]]} поставлено на ${square}.`); };
  const handleDrop = (event: DragEvent<HTMLButtonElement>, square: string) => {
    event.preventDefault();
    const origin=event.dataTransfer.getData("application/playground-origin");
    const palettePiece=event.dataTransfer.getData("application/playground-piece") as ChessPiece;
    if(origin&&board[origin]){const moving=board[origin]!;setBoard((current)=>{const next={...current};delete next[origin];next[square]=moving;return next;});setMessage(`${names[moving[1]]} переміщено на ${square}.`);return;}
    if([...white,...black].includes(palettePiece))place(square,palettePiece);
  };
  const handleClick = (square: string) => { if(selected){place(square,selected);return;}if(board[square]){setSelected(board[square]!);setMessage(`Обрано: ${names[board[square]![1]]}. Натисни іншу клітинку, щоб перемістити.`);} };
  const removePiece = (event: MouseEvent<HTMLButtonElement>,square: string) => {event.preventDefault();setBoard((current)=>{const next={...current};delete next[square];return next;});setMessage(`Фігуру з ${square} прибрано.`);};
  const clearBoard = () => {setBoard({});setSelected(null);setMessage("Дошку очищено. Обери фігуру та створи власну позицію.");};
  const resetBoard = () => {setBoard(initialPosition());setSelected(null);setMessage("Початкову розстановку відновлено.");};
  return (
    <section className="board-playground" aria-labelledby="board-playground-title">
      <div className="board-playground__intro"><span className="section-eyebrow">Твоя шахова майстерня</span><h2 id="board-playground-title">Створи власну позицію</h2><p>Розстав фігури як хочеш, переставляй їх або прибирай правою кнопкою. Тут можна вільно пробувати ідеї.</p></div>
      <div className="board-playground__layout">
        <ChessboardGrid label="Вільна шахівниця для власної позиції" pieces={board} selectedSquare={null} onSquareClick={handleClick} onContextMenu={removePiece} onPieceDragStart={(event,square)=>event.dataTransfer.setData("application/playground-origin",square)} onSquareDragOver={(event)=>event.preventDefault()} onSquareDrop={handleDrop} />
        <aside className="board-playground__tools"><div className="board-playground__group"><h3>Білі фігури</h3><div className="board-playground__pieces">{white.map(piece=><button className={selected===piece?"is-active":""} type="button" key={piece} onClick={()=>setSelected(piece)} draggable onDragStart={(event)=>event.dataTransfer.setData("application/playground-piece",piece)}><img src={`${import.meta.env.BASE_URL}chess-pieces/${piece}.svg`} alt=""/><span>{names[piece[1]]}</span></button>)}</div></div><div className="board-playground__group"><h3>Чорні фігури</h3><div className="board-playground__pieces">{black.map(piece=><button className={selected===piece?"is-active":""} type="button" key={piece} onClick={()=>setSelected(piece)} draggable onDragStart={(event)=>event.dataTransfer.setData("application/playground-piece",piece)}><img src={`${import.meta.env.BASE_URL}chess-pieces/${piece}.svg`} alt=""/><span>{names[piece[1]]}</span></button>)}</div></div><p className="board-playground__message" role="status">{message}</p><div className="board-playground__actions"><button type="button" onClick={clearBoard}><Trash2 size={15}/> Очистити</button><button type="button" onClick={resetBoard}><RotateCcw size={15}/> Початкова позиція</button></div></aside>
      </div>
    </section>
  );
}
