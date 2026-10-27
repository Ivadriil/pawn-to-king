import { ArrowRight, BookOpen, Compass, Grid2x2, List, Play, Target } from "lucide-react";
import { Button } from "../../components/Button/Button";
import { FeatureCard } from "../../components/FeatureCard/FeatureCard";
import { ProgressBanner } from "../../components/ProgressBanner/ProgressBanner";
import { ChessboardPlayground } from "../../components/lesson/ChessboardPlayground";
import { SectionCard } from "../../components/SectionCard/SectionCard";
import { courseLessonOrder, sections, totalLessonCount } from "../../features/lessons/lessonService";
import { getCompletedLessonIds, getSavedLessonProgress, getTotalStars } from "../../features/progress/progressStorage";
import "./HomePage.scss";


const features = [
  {
    accent: "green",
    icon: <BookOpen size={30} />,
    title: "Зрозумілий матеріал",
    description: "Короткі пояснення, приклади та головне — без зайвої теорії.",
  },
  {
    accent: "blue",
    icon: <Grid2x2 size={30} />,
    title: "Інтерактивна шахівниця",
    description: "Переміщуй фігури, пробуй ходи та отримуй миттєвий зворотний зв'язок.",
  },
  {
    accent: "orange",
    icon: <Target size={30} />,
    title: "Практичні завдання",
    description: "Закріплюй знання на реальних прикладах і перевіряй себе.",
  },
  {
    accent: "purple",
    icon: <Compass size={30} />,
    title: "Проста навігація",
    description: "Завжди знаєш, де ти зараз і що робити далі.",
  },
] as const;

export function HomePage() {
  const completedIds = new Set(getCompletedLessonIds());
  const completedCount = courseLessonOrder.filter((id) => completedIds.has(id)).length;
  const savedLesson = getSavedLessonProgress();
  const nextLessonId = savedLesson && !completedIds.has(savedLesson.lessonId) ? savedLesson.lessonId : courseLessonOrder.find((id) => !completedIds.has(id)) ?? courseLessonOrder[0];
  const learningLabel = completedCount === totalLessonCount ? "Повторити програму" : completedCount > 0 || savedLesson ? "Продовжити навчання" : "Почати навчання";

  return (
    <>
      <section className="hero" id="top">
        <div className="hero__content">
          <span className="hero__badge">Вивчай шахи крок за кроком</span>
          <h1>Шахи — це просто, коли є правильний підхід</h1>
          <p>
            Навчальний сайт, який допоможе тобі швидко зрозуміти правила, освоїти
            рух фігур і застосовувати знання на практиці.
          </p>
          <div className="hero__actions">
            <Button to={`/lesson/${nextLessonId}`} variant="primary" icon={<Play size={18} />}>
              {learningLabel}
            </Button>
            <Button to="/#curriculum" variant="outline" icon={<List size={18} />}>
              Перейти до програми
            </Button>
          </div>
        </div>

        <img className="hero__image" src="/images/hero-chess.svg" alt="Шаховий кінь на дошці" />
      </section>

      <div className="page-content">


        <section className="curriculum" id="curriculum">
          <div className="curriculum__heading">
            <div>
              <span className="section-eyebrow">Навчальна програма</span>
              <h2 className="curriculum__title">Від основ шахів до популярних дебютів</h2>
            </div>
            <a className="curriculum__all" href="#curriculum">Переглянути всі розділи <ArrowRight size={17} /></a>
          </div>
          <div className="curriculum__grid">
            {sections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>
        </section>

        <ChessboardPlayground />

        <div id="progress">
          <ProgressBanner completedCount={completedCount} totalCount={totalLessonCount} stars={getTotalStars()} />
        </div>
        <section className="features">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </section>
      </div>
    </>
  );
}






