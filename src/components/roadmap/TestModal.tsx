"use client";

import { useMemo, useState } from "react";
import type { RoadmapTest } from "@/types/roadmap";

interface TestModalProps {
  test: RoadmapTest;
  onClose: () => void;
  onResult: (score: number, passed: boolean) => void;
}

export default function TestModal({ test, onClose, onResult }: TestModalProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const questionCount = test.questions.length;
  const answeredCount = Object.keys(answers).length;
  const score = useMemo(() => {
    if (questionCount === 0) return 0;
    const correct = test.questions.filter(
      (question) => answers[question.id] === question.correctAnswerIndex
    ).length;
    return Math.round((correct / questionCount) * 100);
  }, [answers, questionCount, test.questions]);
  const passed = score >= 70;

  function handleSubmit() {
    if (answeredCount < questionCount) return;
    setSubmitted(true);
    onResult(score, passed);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="test-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
              Knowledge Check
            </p>
            <h2 id="test-modal-title" className="mt-1 text-lg font-bold text-gray-900">
              {test.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close test"
          >
            X
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-5">
            {test.questions.map((question, index) => {
              const selected = answers[question.id];
              const isCorrect = selected === question.correctAnswerIndex;

              return (
                <fieldset key={question.id} className="rounded-xl border border-gray-200 p-4">
                  <legend className="px-1 text-sm font-bold text-gray-900">
                    {index + 1}. {question.question}
                  </legend>
                  <div className="mt-3 flex flex-col gap-2">
                    {question.options.map((option, optionIndex) => {
                      const optionId = `${question.id}-${optionIndex}`;
                      const isSelected = selected === optionIndex;
                      const showCorrect =
                        submitted && optionIndex === question.correctAnswerIndex;
                      const showWrong = submitted && isSelected && !showCorrect;

                      return (
                        <label
                          key={optionId}
                          htmlFor={optionId}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                            showCorrect
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : showWrong
                              ? "border-red-200 bg-red-50 text-red-800"
                              : isSelected
                              ? "border-indigo-200 bg-indigo-50 text-indigo-800"
                              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            id={optionId}
                            type="radio"
                            name={question.id}
                            checked={isSelected}
                            disabled={submitted}
                            onChange={() =>
                              setAnswers((current) => ({
                                ...current,
                                [question.id]: optionIndex,
                              }))
                            }
                            className="mt-0.5 h-4 w-4 accent-indigo-600"
                          />
                          <span>{option}</span>
                        </label>
                      );
                    })}
                  </div>
                  {submitted && (
                    <p
                      className={`mt-3 rounded-lg px-3 py-2 text-xs leading-relaxed ${
                        isCorrect
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {question.explanation}
                    </p>
                  )}
                </fieldset>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600">
            {submitted
              ? `Score: ${score}% - ${passed ? "Passed" : "Needs review"}`
              : `${answeredCount}/${questionCount} answered`}
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {submitted ? "Close" : "Cancel"}
            </button>
            {!submitted && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={answeredCount < questionCount}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Submit Test
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
