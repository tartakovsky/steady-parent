/**
 * Quiz URL Encoding/Decoding
 *
 * Encodes quiz state into URL search params.
 * - Mid-quiz:  ?q=3&a=010    (on question 4, first 3 answered)
 * - Complete:  ?a=0101012101  (all answered, showing results)
 *
 * Each character in `a` is the 0-based index of the selected option.
 * No special characters, so URLs stay clean and parseable in chats.
 * Quiz-agnostic.
 */

type Question = { id: string; options: { id: string }[] };

const ANSWERS_PARAM = "a";
const STEP_PARAM = "q";

/**
 * Encode partial or complete answers into a compact index string.
 * Only encodes questions that have an answer.
 */
export function encodeAnswers(
  answers: Record<string, string>,
  questions: Question[]
): string {
  if (Object.keys(answers).length === 0) return "";

  const indices = questions
    .filter((q) => answers[q.id] !== undefined)
    .map((q) => {
      const optionIndex = q.options.findIndex((o) => o.id === answers[q.id]);
      return optionIndex === -1 ? "0" : String(optionIndex);
    });

  return indices.join("");
}

/**
 * Decode answers from a raw answer string using the quiz's question definitions.
 * Handles both partial (mid-quiz) and complete answer strings.
 * Returns null if malformed.
 */
export function decodeAnswers(
  raw: string,
  questions: Question[]
): Record<string, string> | null {
  if (raw.length === 0 || raw.length > questions.length) return null;

  const answers: Record<string, string> = {};

  for (let i = 0; i < raw.length; i++) {
    const question = questions[i]!;
    const index = parseInt(raw[i]!, 10);

    if (isNaN(index) || index < 0 || index >= question.options.length) {
      return null;
    }

    answers[question.id] = question.options[index]!.id;
  }

  return answers;
}

export interface QuizUrlState {
  answers: Record<string, string>;
  currentIndex: number;
  isComplete: boolean;
}

/**
 * Read full quiz state from URL search params.
 * Returns null if no quiz state is in the URL.
 */
export function readStateFromUrl(
  searchParams: URLSearchParams,
  questions: Question[]
): QuizUrlState | null {
  const raw = searchParams.get(ANSWERS_PARAM);
  if (!raw) return null;

  const answers = decodeAnswers(raw, questions);
  if (!answers) return null;

  const isComplete = raw.length === questions.length;
  const stepParam = searchParams.get(STEP_PARAM);
  const currentIndex = stepParam !== null
    ? parseInt(stepParam, 10)
    : isComplete
      ? questions.length - 1
      : raw.length;

  if (isNaN(currentIndex) || currentIndex < 0 || currentIndex >= questions.length) {
    return null;
  }

  return { answers, currentIndex, isComplete };
}

/**
 * Push current quiz state into the URL without a page reload.
 */
export function pushStateToUrl(
  answers: Record<string, string>,
  currentIndex: number,
  questions: Question[],
  isComplete: boolean,
  preview?: boolean
): void {
  const encoded = encodeAnswers(answers, questions);
  if (!encoded) {
    clearStateFromUrl();
    return;
  }

  let params = `${ANSWERS_PARAM}=${encoded}${isComplete ? "" : `&${STEP_PARAM}=${currentIndex}`}`;
  if (preview) params += "&p=1";
  const url = `${window.location.pathname}?${params}`;
  window.history.pushState(null, "", url);
}

/**
 * Clear quiz state from the URL without a page reload.
 */
export function clearStateFromUrl(): void {
  window.history.pushState(null, "", window.location.pathname);
}
