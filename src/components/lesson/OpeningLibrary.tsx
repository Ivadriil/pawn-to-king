import { useState } from "react";
import "./OpeningLibrary.scss";

const files = "abcdefgh".split("");
const ranks = [8,7,6,5,4,3,2,1];
type Opening = { name: string; moves: string; idea: string; fen: string };

function MiniBoard({ fen, title }: { fen: string; title: string }) {
  const [placement] = fen.split(" ");
  const rows = placement.split("/");
  return <div className="opening-board" role="img" aria-label={`Шахівниця: ${title}`}>
    {ranks.flatMap((rank, rowIndex) => {
      const row: string[] = [];
      for (const token of rows[rowIndex]) {
        if (/\d/.test(token)) row.push(...Array(Number(token)).fill("")); else row.push(token);
      }
      return files.map((file, colIndex) => {
        const piece = row[colIndex];
        const squareColor = (rowIndex + colIndex) % 2 === 1 ? "dark" : "light";
        return <span className={`opening-board__square opening-board__square--${squareColor}`} key={`${file}${rank}`}>
          {piece && <img src={`${import.meta.env.BASE_URL}chess-pieces/${piece === piece.toUpperCase() ? `w${piece}` : `b${piece.toUpperCase()}`}.svg`} alt="" loading="lazy" />}
        </span>;
      });
    })}
  </div>;
}

export function OpeningLibrary({ openings }: { openings: readonly Opening[] }) {
  const [active, setActive] = useState(0);
  return <section className="opening-library" aria-label="Популярні шахові дебюти">
    <p className="opening-library__intro">Обери дебют, щоб роздивитися позицію після перших ходів і зрозуміти його задум.</p>
    <div className="opening-library__grid">
      {openings.map((opening, index) => <button className={`opening-card${active === index ? " is-active" : ""}`} key={opening.name} onClick={() => setActive(index)} type="button" aria-pressed={active === index}>
        <span className="opening-card__number">{String(index + 1).padStart(2, "0")}</span><strong>{opening.name}</strong><span>{opening.moves}</span>
      </button>)}
    </div>
    <article className="opening-detail" aria-live="polite">
      <MiniBoard fen={openings[active].fen} title={openings[active].name} />
      <div><span className="lesson-kicker">Початковий приклад</span><h2>{openings[active].name}</h2><p className="opening-detail__moves">{openings[active].moves}</p><p>{openings[active].idea}</p></div>
    </article>
    <p className="opening-library__note">Запис ходів подано в короткій міжнародній нотації: N — кінь, B — слон. Плани залежать від відповіді суперника.</p>
  </section>;
}

