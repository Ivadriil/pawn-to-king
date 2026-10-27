import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Chess } from "chess.js";
import { ChessboardGrid, type ChessPiece } from "./ChessboardGrid";
import { NotationPractice } from "./NotationPractice";
import "./RulesPractice.scss";

type BoardPosition = Partial<Record<string, ChessPiece>>;
type MoveStage = { kind: "move"; prompt: string; pieces: BoardPosition; from: string; to: string; record: string; rook?: { from: string; to: string } };
type RecordStage = { kind: "record"; prompt: string; from: string; to: string; piece: ChessPiece; record: string };
type ChoiceStage = { kind: "choice"; prompt: string; pieces: BoardPosition; choices: string[]; correct: number; explanation: string };
type Stage = MoveStage | RecordStage | ChoiceStage;
const notationStartFen = "r1bq3k/pp3pp1/4p1n1/3P4/2P4n/5NN1/PPPQPPPP/R3K3 w - - 0 1";
const notationMoveSquares = [["e2", "e4"], ["h4", "f3"], ["g2", "f3"], ["d8", "c7"], ["g3", "f5"]] as const;
function notationRecord(san: string, piece: string) {
  const customSan = san.replace(/^N/, "K");
  return piece === "n" ? customSan.replace(/([a-h][1-8])([+#]?)$/, (_match, square: string, suffix: string) => `${square.toUpperCase()}${suffix}`) : customSan;
}
const notationMoves: RecordStage[] = (() => {
  const game = new Chess(notationStartFen);
  return notationMoveSquares.map(([from, to]) => {
    const move = game.move({ from, to });
    return {
      kind: "record",
      prompt: `Запишіть хід ${move.color === "w" ? "білих" : "чорних"}.`,
      from,
      to,
      piece: `${move.color}${move.piece.toUpperCase()}` as ChessPiece,
      record: notationRecord(move.san, move.piece),
    };
  });
})();
function boardAfterNotationMove(moveCount: number): BoardPosition {
  const game = new Chess(notationStartFen);
  for (let i = 0; i < moveCount; i += 1) game.move({ from: notationMoves[i].from, to: notationMoves[i].to });
  const position: BoardPosition = {};
  game.board().forEach((rank, row) => rank.forEach((piece, column) => {
    if (piece) position[`${"abcdefgh"[column]}${8 - row}`] = `${piece.color}${piece.type.toUpperCase()}` as ChessPiece;
  }));
  return position;
}
function checkedKingSquare(moveCount: number): string[] {
  const game = new Chess(notationStartFen);
  for (let i = 0; i < moveCount; i += 1) game.move({ from: notationMoves[i].from, to: notationMoves[i].to });
  if (!game.isCheck()) return [];
  for (const [row, rank] of game.board().entries()) {
    const column = rank.findIndex((piece) => piece?.type === "k" && piece.color === game.turn());
    if (column >= 0) return [`${"abcdefgh"[column]}${8 - row}`];
  }
  return [];
}
const stages: Record<string, Stage[]> = {
  "chess-notation": notationMoves,
  "chess-checkmate": [
    { kind:"move",prompt:"Білий король під шахом від тури. Виведи його з-під шаху: e4 → f4.",pieces:{e4:"wK",e1:"bR",a8:"bK"},from:"e4",to:"f4",record:"Kf4" },
    { kind:"move",prompt:"Тепер постав мат: пересунь ферзя з g6 на g7. Білий король f6 захищає ферзя.",pieces:{f6:"wK",g6:"wQ",h8:"bK"},from:"g6",to:"g7",record:"Qg7#" },
    { kind:"choice",prompt:"Подивись на позицію: чорний король h8 не під шахом, але всі його поля закриті. Що це?",pieces:{f7:"wK",g6:"wQ",h8:"bK"},choices:["Шах і мат","Пат (нічия)","Гра триває"],correct:1,explanation:"Так! Король не під шахом і дозволеного ходу немає — це пат, нічия." },
  ],
  "chess-special-moves": [
    { kind:"move",prompt:"Коротка рокіровка: перемісти короля e1 на g1. Тура сама стане на f1.",pieces:{e1:"wK",h1:"wR",e8:"bK"},from:"e1",to:"g1",record:"O-O",rook:{from:"h1",to:"f1"} },
    { kind:"move",prompt:"Довга рокіровка: король іде e1 → c1, а тура a1 → d1.",pieces:{e1:"wK",a1:"wR",e8:"bK"},from:"e1",to:"c1",record:"O-O-O",rook:{from:"a1",to:"d1"} },
    { kind:"choice",prompt:"На цій дошці чорна тура нападає на білого короля e1. Чи можна зараз рокіруватися?",pieces:{e1:"wK",h1:"wR",e8:"bR",a8:"bK"},choices:["Так, коротко", "Ні, король під шахом"],correct:1,explanation:"Правильно! Не можна рокіруватися, коли король під шахом або проходить через атаковане поле." },
  ],
};
function boardForStage(lessonId: string, index: number): BoardPosition {
  const stage = stages[lessonId]?.[index];
  if (!stage) return {};
  return stage.kind === "record" ? boardAfterNotationMove(index + 1) : stage.pieces;
}

function canMove(piece: string, from: string, to: string, color: "w"|"b") {
  const files = "abcdefgh";
  const dx = files.indexOf(to[0]) - files.indexOf(from[0]);
  const dy = Number(to[1]) - Number(from[1]);
  const ax = Math.abs(dx), ay = Math.abs(dy);
  if (from === to || files.indexOf(to[0]) < 0) return false;
  if (piece === "P") { const forward = color === "w" ? 1 : -1; return dx === 0 && (dy === forward || (from[1] === (color === "w" ? "2" : "7") && dy === forward * 2)); }
  if (piece === "N") return (ax === 1 && ay === 2) || (ax === 2 && ay === 1);
  if (piece === "K") return ax <= 1 && ay <= 1;
  if (piece === "R") return dx === 0 || dy === 0;
  if (piece === "B") return ax === ay;
  if (piece === "Q") return dx === 0 || dy === 0 || ax === ay;
  return false;
}

export function RulesPractice(props: { lessonId: string; onComplete: (stars: number) => void }) {
  return props.lessonId === "chess-notation" ? <NotationPractice onComplete={props.onComplete} /> : <RulesPracticeCore {...props} />;
}

function RulesPracticeCore({ lessonId, onComplete }: { lessonId: string; onComplete: (stars: number) => void }) {
  const lessonStages = stages[lessonId] ?? [];
  const [stageIndex, setStageIndex] = useState(0);
  const [board, setBoard] = useState<BoardPosition>(boardForStage(lessonId, 0));
  const [historyCursor, setHistoryCursor] = useState(1);
  const [recordAnswer, setRecordAnswer] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [completedStages, setCompletedStages] = useState(0);
  const [moves, setMoves] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState(lessonId === "chess-notation" ? "" : "Обери фігуру й виконай завдання на дошці.");
  const [stageDone, setStageDone] = useState(false);
  const stage = lessonStages[stageIndex];

  useEffect(() => {
    setStageIndex(0); setHistoryCursor(1); setBoard(boardForStage(lessonId, 0)); setSelected(null); setRecordAnswer(""); setCompletedStages(0); setMoves([]); setMistakes(0); setStageDone(false); setFeedback(lessonId === "chess-notation" ? "" : "Обери фігуру й виконай завдання на дошці.");
  }, [lessonId]);

  if (!stage) return null;
  const legalSquares = stage.kind === "move" && selected === stage.from && board[stage.from]
    ? "abcdefgh".split("").flatMap((file)=>Array.from({length:8},(_,index)=>`${file}${index+1}`)).filter((square)=>(canMove(board[stage.from]![1],stage.from,square,board[stage.from]![0] as "w"|"b")||(Boolean(stage.rook)&&square===stage.to))&&(!board[square]||square===stage.to))
    : [];

  const submitRecord = () => {
    if (stage.kind !== "record" || stageDone) return;
    const expectedRecord = stage.record.toLowerCase();
    const normalizedAnswer = recordAnswer.trim().toLowerCase().replace(/\s/g, "");
    if (normalizedAnswer !== expectedRecord) { setFeedback("Подивись на хід ще раз і введи його запис."); return; }
    setStageDone(true); setCompletedStages((count) => count + 1); setMoves((items) => [...items, stage.record]);
    setFeedback("Правильно.");
  };

  const clickSquare = (square: string) => {
    if (stage.kind !== "move" || stageDone) return;
    if (square === stage.from) { setSelected(square); setFeedback("Фігуру обрано. Знайди потрібну клітинку."); return; }
    if (selected !== stage.from) return;
    const moving = board[stage.from];
    const castling = Boolean(stage.rook) && square === stage.to;
    if (!moving || (!canMove(moving[1], stage.from, square, moving[0] as "w"|"b") && !castling)) { setMistakes((count)=>count+1); setFeedback("Це неможливий хід для цієї фігури. Помилку зараховано."); return; }
    if (square !== stage.to) { setFeedback("Такий хід фігури можливий, але в цьому завданні треба знайти позначену ціль."); return; }
    const next = { ...board, [square]: moving };
    delete next[stage.from];
    if (stage.rook) { next[stage.rook.to] = board[stage.rook.from]; delete next[stage.rook.from]; }
    setBoard(next); setSelected(null); setStageDone(true); setCompletedStages((count)=>count+1); setMoves((items)=>[...items,stage.record]);
    setFeedback(stage.rook ? `Чудово! Король і тура стали на місця. Запис: ${stage.record}.` : `Правильно! Запис ходу: ${stage.record}.`);
  };

  const continuePractice = () => {
    if (stageIndex === lessonStages.length - 1) { onComplete(completedStages); return; }
    const nextIndex = stageIndex + 1; setStageIndex(nextIndex); setHistoryCursor(nextIndex + 1); setBoard(boardForStage(lessonId, nextIndex)); setSelected(null); setRecordAnswer(""); setStageDone(false); setFeedback(lessonId === "chess-notation" ? "" : "Нова ситуація на дошці. Виконай наступне завдання.");
  };

  return (
    <section className="rules-practice" aria-labelledby="rules-practice-title">
      <header className="rules-practice__intro"><span className="lesson-kicker">Практика</span><h2 id="rules-practice-title">{lessonId === "chess-notation" ? "Веди запис ходу" : stage.prompt}</h2>{lessonId === "chess-notation" ? <p className="rules-practice__turn-prompt">{stage.prompt}</p> : stage.kind !== "record" && <p>Ходи фігурою на дошці. Помилка рахується лише за неможливий хід.</p>}</header>
      <div className="rules-practice__layout">
        <ChessboardGrid label="Шахівниця для практики правил" pieces={board} selectedSquare={selected} legalSquares={legalSquares} checkedSquares={lessonId === "chess-notation" ? checkedKingSquare(historyCursor) : []} highlightedSquares={stage.kind === "record" ? (historyCursor > 0 ? [notationMoves[historyCursor - 1].from, notationMoves[historyCursor - 1].to] : []) : []} onSquareClick={clickSquare} />
        <aside className="rules-practice__side">
          <p className="rules-practice__feedback" role="status" aria-live="polite">{feedback}</p>
          {stage.kind === "record" && !stageDone && <form className="rules-practice__record" onSubmit={(event) => { event.preventDefault(); submitRecord(); }}>
            <input id="notation-square" value={recordAnswer} onChange={(event) => setRecordAnswer(event.target.value.replace(/[^a-h1-8qkrbnxX+\#\s]/gi, "").slice(0, 8))} placeholder="Запишіть хід" autoComplete="off" aria-label="Запишіть хід" disabled={historyCursor !== stageIndex + 1} /><button className="lesson-button lesson-button--primary" type="submit" disabled={historyCursor !== stageIndex + 1}>Перевірити</button>
          </form>}
          {stage.kind === "record" && !stageDone && <button className="lesson-button lesson-button--secondary" type="button" disabled={historyCursor !== stageIndex + 1} onClick={() => { setFeedback(`Правильна відповідь: ${stage.record}`); setStageDone(true); }}>Не знаю відповіді</button>}
          {stage.kind === "choice" && !stageDone && <div className="rules-practice__choices">{stage.choices.map((choice,index)=><button key={choice} type="button" onClick={()=>{if(index===stage.correct){setStageDone(true);setCompletedStages((count)=>count+1);setFeedback(stage.explanation);}else setFeedback("Не зовсім. Перевір, чи король під шахом і чи має він дозволений хід.");}}>{choice}</button>)}</div>}
          {stage.kind === "move" && <div className="rules-practice__stats"><span>Неможливих ходів: <strong>{mistakes}</strong></span></div>}
          {lessonId !== "chess-notation" && moves.length>0&&<div className="rules-practice__notation"><strong>Запис партії</strong><span>{moves.map((move,index)=><code key={`${move}-${index}`}>{move}</code>)}</span></div>}
          <div className="rules-practice__stars" aria-label={`${completedStages} зірок із ${lessonStages.length}`}>{"★".repeat(completedStages)}{"☆".repeat(lessonStages.length-completedStages)}</div>
          {lessonId === "chess-notation" && <nav className="rules-practice__history" aria-label="Перегляд ходів"><button type="button" aria-label="Попередній хід" disabled={historyCursor===0} onClick={()=>{const previous=historyCursor-1;setHistoryCursor(previous);setBoard(boardAfterNotationMove(previous));}}><ChevronLeft size={22}/></button><button type="button" aria-label="Наступний хід" disabled={historyCursor>=stageIndex+1} onClick={()=>{const next=historyCursor+1;setHistoryCursor(next);setBoard(boardAfterNotationMove(next));}}><ChevronRight size={22}/></button></nav>}
          {stageDone&&<button className="lesson-button lesson-button--primary" type="button" onClick={continuePractice}>{stageIndex===lessonStages.length-1?"Завершити практику":"Наступна ситуація"}<Check size={16}/></button>}
        </aside>
      </div>
    </section>
  );
}
