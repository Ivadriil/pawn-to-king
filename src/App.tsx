import { Route, Routes } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { HomePage } from "./pages/home/HomePage";
import { LessonPage } from "./pages/lesson/LessonPage";

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <span>Вчися грати — один хід за раз ♟</span>
        <a href={`${import.meta.env.BASE_URL}licenses/THIRD_PARTY_NOTICES.txt`}>Ліцензії компонентів</a>
      </footer>
    </>
  );
}

export default App;
