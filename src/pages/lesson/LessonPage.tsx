import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Clock3, Dumbbell, Lightbulb, ListChecks } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { LessonBoardVisualization } from "../../components/lesson/LessonBoardVisualization";
import { LessonPawnPractice } from "../../components/lesson/LessonPawnPractice";
import { FullSetupPractice } from "../../components/lesson/FullSetupPractice";
import { ContinuousPiecePractice } from "../../components/lesson/ContinuousPiecePractice";
import { RulesPractice } from "../../components/lesson/RulesPractice";
import { allCourseLessons, courseLessonOrder } from "../../features/lessons/lessonService";
import { MovementDiagram } from "../../components/lesson/MovementDiagram";
import { getCompletedLessonIds, getSavedLessonProgress, markLessonCompleted, recordLessonStars, saveLessonProgress } from "../../features/progress/progressStorage";
import "./LessonPage.scss";

type LessonMode = "theory" | "test" | "practice";

const lessonModes: { id: LessonMode; label: string; icon: typeof BookOpen }[] = [
  { id: "theory", label: "Теорія", icon: BookOpen },
  { id: "test", label: "Тести", icon: ListChecks },
  { id: "practice", label: "Практика", icon: Dumbbell },
];

export function LessonPage() {
  const { lessonId } = useParams();
  const lesson = lessonId ? allCourseLessons[lessonId] : undefined;
  const [mode, setMode] = useState<LessonMode>("theory");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [taskIndex, setTaskIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const saved = getSavedLessonProgress();
    const isSavedLesson = Boolean(saved && saved.lessonId === lessonId);
    setMode(isSavedLesson && saved ? saved.mode : "theory");
    setSelectedOption(isSavedLesson && saved?.mode === "test" ? saved.selectedOption : null);
    setTaskIndex(isSavedLesson && saved ? saved.taskIndex : 0);
    setCompleted(lessonId && !(isSavedLesson && saved?.mode === "practice") ? getCompletedLessonIds().includes(lessonId) : false);
  }, [lessonId]);

  if (!lesson) {
    return (
      <section className="lesson-empty">
        <span className="lesson-empty__icon">♟</span>
        <h1>Урок ще готується</h1>
        <p>Цей урок поки не додано до програми. Повернись до головної та обери доступний матеріал.</p>
        <Link className="lesson-button lesson-button--primary" to="/">На головну</Link>
      </section>
    );
  }

  const currentTask = lesson.quiz.tasks[taskIndex];
  const isLastTask = taskIndex === lesson.quiz.tasks.length - 1;
  const answerIsCorrect = selectedOption === currentTask.correctOption;

  const continueQuiz = () => {
    if (!answerIsCorrect) return;
    if (isLastTask) {
      saveLessonProgress({ lessonId: lesson.id, mode: "practice", taskIndex: 0, selectedOption: null });
      setMode("practice");
      return;
    }
    saveLessonProgress({ lessonId: lesson.id, mode: "test", taskIndex: taskIndex + 1, selectedOption: null });
    setTaskIndex((index) => index + 1);
    setSelectedOption(null);
  };

  const completeLesson = (stars = 0) => {
    markLessonCompleted(lesson.id);
    if (stars > 0) recordLessonStars(lesson.id, stars);
    setCompleted(true);
  };

  return (
    <div className={`lesson-page lesson-page--${mode}`}>
      <div className="lesson-page__topline">
        <Link className="lesson-back" to="/#curriculum"><ArrowLeft size={16} /> До програми</Link>
        <span className="lesson-page__section">{lesson.sectionTitle}</span>
      </div>

      <nav className="lesson-mode-switch" aria-label="Розділи уроку">
        {lessonModes.map(({ id, label, icon: Icon }) => (
          <button
            aria-current={mode === id ? "step" : undefined}
            className={mode === id ? "is-active" : ""}
            key={id}
            onClick={() => { saveLessonProgress({ lessonId: lesson.id, mode: id, taskIndex, selectedOption }); setMode(id); if (id === "practice") setCompleted(false); }}
            type="button"
          >
            <Icon size={17} /> {label}
          </button>
        ))}
      </nav>

      <div className="lesson-page__body">
        <div className="lesson-page__main">
      {mode === "theory" && (
        <>
          <header className="lesson-hero">
            <div className="lesson-hero__meta">
              <span>Урок {lesson.number} з {lesson.totalInSection}</span>
              <span className="lesson-meta-dot" aria-hidden="true">·</span>
              <span><Clock3 size={15} /> {lesson.durationMinutes} хв</span>
              <span className="lesson-level">{lesson.level}</span>
            </div>
            <h1>{lesson.title}</h1>
            <p>{lesson.summary}</p>
            <div className="lesson-progress" role="progressbar" aria-label="Прогрес у розділі" aria-valuenow={lesson.number} aria-valuemax={lesson.totalInSection}>
              <span style={{ width: `${(lesson.number / lesson.totalInSection) * 100}%` }} />
            </div>
          </header>

          {lesson.board && <LessonBoardVisualization board={lesson.board} onPractice={() => { saveLessonProgress({ lessonId: lesson.id, mode: "practice", taskIndex, selectedOption }); setMode("practice"); }} />}
          {lesson.movement && <MovementDiagram movement={lesson.movement} onPractice={() => { saveLessonProgress({ lessonId: lesson.id, mode: "practice", taskIndex, selectedOption }); setMode("practice"); }} />}
          

          <section className="lesson-objectives">
            <h2>Після уроку ти зможеш</h2>
            <ul>{lesson.objectives.map((objective) => <li key={objective}><Check size={16} />{objective}</li>)}</ul>
          </section>

          {lesson.content.map((block, index) => (
            <section className="lesson-block" key={block.title}>
              <span className="lesson-block__number">{String(index + 1).padStart(2, "0")}</span>
              <h2>{block.title}</h2>
              {block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {block.example && <aside className="lesson-example"><strong>Приклад</strong><span>{block.example}</span></aside>}
            </section>
          ))}

          <aside className="lesson-takeaway"><Lightbulb size={21} /><div><strong>Запам’ятай</strong><p>{lesson.keyTakeaway}</p></div></aside>

          <section className="lesson-next-steps" aria-labelledby="lesson-next-title">
            <span className="lesson-kicker">Тепер твоя черга</span>
            <h2 id="lesson-next-title">Обери, що робитимеш далі</h2>
            <div className="lesson-next-steps__choices">
              <button type="button" onClick={() => { saveLessonProgress({ lessonId: lesson.id, mode: "test", taskIndex, selectedOption }); setMode("test"); }}>
                <ListChecks size={22} /><span><strong>Тести</strong><small>Перевір, що запам’ятав</small></span><ArrowRight size={17} />
              </button>
              <button type="button" onClick={() => { saveLessonProgress({ lessonId: lesson.id, mode: "practice", taskIndex, selectedOption }); setMode("practice"); }}>
                <Dumbbell size={22} /><span><strong>Практика</strong><small>Перенеси фігури на шахівниці</small></span><ArrowRight size={17} />
              </button>
            </div>
          </section>
        </>
      )}

      {mode === "test" && (
        <section className="lesson-activity">
          <header className="lesson-activity__heading">
            <span className="lesson-kicker">Перевір себе</span>
            <h1>Тести</h1>
            <p>Відповідай на запитання про тему цього уроку.</p>
          </header>
          <section className="lesson-quiz">
            <div className="lesson-quiz__title"><span><CheckCircle2 size={20} /></span><div><span className="lesson-kicker">Завдання {taskIndex + 1} з {lesson.quiz.tasks.length}</span><h2>Обери правильну відповідь</h2></div></div>
            <p className="lesson-quiz__question">{currentTask.question}</p>
            <div className="lesson-quiz__options">
              {currentTask.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrect = selectedOption !== null && index === currentTask.correctOption;
                return (
                  <button
                    className={`lesson-answer${isSelected ? " is-selected" : ""}${isCorrect ? " is-correct" : ""}${isSelected && !answerIsCorrect ? " is-wrong" : ""}`}
                    key={option}
                    onClick={() => { setSelectedOption(index); if (index === currentTask.correctOption) saveLessonProgress({ lessonId: lesson.id, mode: "test", taskIndex, selectedOption: index }); }}
                    type="button"
                    aria-pressed={isSelected}
                  >
                    <span className="lesson-answer__letter">{String.fromCharCode(65 + index)}</span>{option}
                  </button>
                );
              })}
            </div>
            {selectedOption !== null && (
              <div className={`lesson-feedback${answerIsCorrect ? " lesson-feedback--correct" : " lesson-feedback--wrong"}`} role="status">
                {answerIsCorrect ? currentTask.explanation : "Не зовсім. Спробуй ще раз!"}
                {!answerIsCorrect && <><span>{currentTask.hint}</span><button type="button" onClick={() => setSelectedOption(null)}>Спробувати ще раз</button></>}
              </div>
            )}
            {answerIsCorrect && (
              <button className="lesson-button lesson-button--primary lesson-quiz__continue" type="button" onClick={continueQuiz}>
                {isLastTask ? <>Перейти до практики <ArrowRight size={16} /></> : <>Наступне завдання <ArrowRight size={16} /></>}
              </button>
            )}
          </section>
        </section>
      )}

      {mode === "practice" && (
        <section className="lesson-activity">
          <header className="lesson-activity__heading">
            <span className="lesson-kicker">Спробуй самостійно</span>
            <h1>Практика</h1>
            <p>{lesson.id === "board-setup" ? "Розстав білих пішаків на другому ряду, а чорних — на сьомому." : "Виконай коротке завдання й закріпи головну ідею уроку."}</p>
          </header>
                    {lesson.id === "board-setup" ? <LessonPawnPractice onComplete={completeLesson} /> : lesson.id === "piece-placement" ? <FullSetupPractice onComplete={completeLesson} /> : lesson.movement ? <ContinuousPiecePractice key={lesson.id} lessonId={lesson.id} piece={lesson.movement.piece} onComplete={completeLesson} /> : ["chess-notation","chess-checkmate","chess-special-moves"].includes(lesson.id) ? <RulesPractice lessonId={lesson.id} onComplete={completeLesson} /> : (
            <section className="lesson-practice-card">
              <span className="lesson-kicker">Твоя місія</span>
              <h2>{lesson.keyTakeaway}</h2>
              <p>Поясни це своїми словами або знайди приклад у своїй шаховій партії.</p>
              {completed ? <div className="lesson-feedback lesson-feedback--correct" role="status"><CheckCircle2 size={17} /> Урок уже завершено. Чудова робота!</div> :
                <button className="lesson-button lesson-button--primary" onClick={() => completeLesson()} type="button"><Check size={16} /> Я виконав завдання</button>}
            </section>
          )}
          {completed && <div className="lesson-completion-banner" role="status"><CheckCircle2 size={18} /><span>Урок завершено! Наступний: {lessonId && courseLessonOrder.indexOf(lessonId) < courseLessonOrder.length - 1 ? allCourseLessons[courseLessonOrder[courseLessonOrder.indexOf(lessonId) + 1]]?.title : "повтори програму"}.</span><Link to={lessonId && courseLessonOrder.indexOf(lessonId) < courseLessonOrder.length - 1 ? `/lesson/${courseLessonOrder[courseLessonOrder.indexOf(lessonId) + 1]}` : "/#curriculum"}>Далі <ArrowRight size={15} /></Link></div>}
        </section>
      )}
        </div>

        <aside className="lesson-next-lesson" aria-labelledby="lesson-next-lesson-title">
          <span className="lesson-kicker">Наступний урок</span>
          <h2 id="lesson-next-lesson-title">{lessonId && courseLessonOrder.indexOf(lessonId) < courseLessonOrder.length - 1 ? allCourseLessons[courseLessonOrder[courseLessonOrder.indexOf(lessonId) + 1]]?.title : "Усі уроки завершено!"}</h2>
          <p>{lessonId && courseLessonOrder.indexOf(lessonId) < courseLessonOrder.length - 1 ? "Рухайся далі крок за кроком." : "Можеш повторити будь-який розділ програми."}</p>
          <Link to={lessonId && courseLessonOrder.indexOf(lessonId) < courseLessonOrder.length - 1 ? `/lesson/${courseLessonOrder[courseLessonOrder.indexOf(lessonId) + 1]}` : "/#curriculum"}><BookOpen size={16} /> Наступний урок <ArrowRight size={15} /></Link>
        </aside>
      </div>

      <div className="lesson-footer-actions">
        {mode !== "theory" && <button className="lesson-button lesson-button--secondary" onClick={() => { saveLessonProgress({ lessonId: lesson.id, mode: "theory", taskIndex, selectedOption }); setMode("theory"); }} type="button"><ArrowLeft size={16} /> Повернутися до теорії</button>}
        <Link className="lesson-button lesson-button--secondary" to="/#curriculum"><ArrowLeft size={16} /> До програми</Link>
      </div>
    </div>
  );
}









