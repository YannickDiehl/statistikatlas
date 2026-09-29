import type { Question } from '../questions';

export function QuestionsStep({ questions, answers, onAnswer, onEdit, onConcept }: {
  questions: Question[];
  answers: Record<string, string>;
  onAnswer: (id: string, text: string) => void;
  onEdit: () => void;
  onConcept: (id: string) => void;
}) {
  return <>
    <p className="sandbox-note">Eine kritische Gutachterin liest deine Analyse. Ihre Fragen entstehen aus deinem Weg – nicht aus einer Musterlösung. Antworten sind freiwillig.</p>
    {questions.map(q => <section key={q.id} className="sandbox-card sandbox-question">
      <h3>{q.title}</h3>
      <p>{q.text}</p>
      <label className="sr-only" htmlFor={`sandbox-answer-${q.id}`}>Deine Antwort auf: {q.title}</label>
      <textarea id={`sandbox-answer-${q.id}`} value={answers[q.id] ?? ''} placeholder="Deine Antwort" onChange={e => onAnswer(q.id, e.target.value)} />
      <div className="sandbox-chips">
        <button onClick={onEdit}>In der Werkbank ändern</button>
        {q.concept && <button className="sandbox-link" onClick={() => onConcept(q.concept!)}>Begriff in der Karte</button>}
      </div>
    </section>)}
  </>;
}
