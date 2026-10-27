# Chess for Beginners

A Ukrainian-language learning website that helps children and beginners learn chess step by step. Lessons combine short explanations, knowledge checks, and interactive chessboard exercises.

**Open the website:** [Chess for Beginners](https://ivadriil.github.io/pawn-to-king/)

## Features

- Lessons on the chessboard, pieces and their moves, check, checkmate, stalemate, castling, and move notation.
- Quizzes and practical exercises at different difficulty levels.
- An interactive board for moving and placing pieces.
- Learning examples featuring popular chess openings.
- Learning progress and stars for completed exercises.
- Light and dark themes, with responsive layouts for phones and tablets.

## Run the website locally

1. Install [Node.js](https://nodejs.org/). The LTS version is recommended.
2. Clone or download this repository, then open its folder in a terminal.
3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the address shown in the terminal. It is usually [http://127.0.0.1:5173/](http://127.0.0.1:5173/).

To stop the server, return to the terminal and press `Ctrl+C`.

## Build and preview

```bash
npm run build
npm run preview
```

After running `npm run preview`, open the address shown in the terminal.

## Tech stack

- React and TypeScript
- Vite
- SCSS
- `chess.js` for chess move validation
- `@mirasen/react-chessboard` and `@mirasen/chessboard` for the chessboard
- `lucide-react` for icons

## Project status

The live website is published with GitHub Pages. Every push to `main` builds and deploys the latest version automatically. To run the project locally, use `npm run dev`.
