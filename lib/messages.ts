import type { Lang } from './i18n';
import type { QuestionType } from './questions';

/** Vene keele käänded: 1 вопрос, 2 вопроса, 5 вопросов. */
function ruPlural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

function enPlural(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}

function clock(seconds: number) {
  return { m: Math.floor(seconds / 60), s: (seconds % 60).toString().padStart(2, '0') };
}

const et = {
  appName: 'JWT harjutus',
  siteDescription: 'JWT testiks valmistumine: harjutustest ja õiged vastused.',
  dateLocale: 'et-EE',
  surveyLocale: 'et',
  rights: 'Kõik õigused kaitstud.',

  // navigatsioon
  practice: 'Harjutustest',
  answers: 'Vastused',
  allAnswers: 'Kõik vastused',
  practiceDescription: 'JWT testi harjutus- ja eksamirežiim kohese tagasisidega.',

  // küsimused ja vastused
  typeLabels: {
    single: 'Valikvastus',
    multiple: 'Mitu õiget',
    truefalse: 'Tõene / väär',
    text: 'Lühivastus',
    matching: 'Seosta',
    essay: 'Vabavastus',
  } satisfies Record<QuestionType, string>,
  questionN: (n: number) => `Küsimus ${n}`,
  correctAnswer: 'Õige vastus:',
  yourAnswer: 'Sinu vastus',
  unanswered: 'vastamata',
  yourChoice: 'sinu valik',
  statement: 'Väide',
  correctMatch: 'Õige vaste',
  modelAnswer: 'Näidisvastus',
  practiceThis: 'Harjuta seda küsimust',

  // näidistoken
  secretKey: 'salavõti',
  useThisToken: 'Kasuta järgmist tokenit',
  copy: 'Kopeeri',
  copied: 'Kopeeritud',
  copyToken: 'Kopeeri token',

  // SurveyJS väljad
  textPlaceholder: 'Sinu vastus…',
  matchColumn: 'Vaste',
  choosePlaceholder: 'Vali…',
  essayPlaceholder: 'Kirjuta oma vastus siia…',

  // avaleht
  heroTitle: 'Valmistu JWT testiks',
  heroHighlight: 'enesekindlalt',
  startPracticeTest: 'Alusta harjutustesti',
  viewAnswers: 'Vaata vastuseid',
  nQuestions: (n: number) => `${n} küsimust`,
  topicsHeading: 'Teemad',
  topicsText: 'Küsimused on jagatud JWT teemade kaupa.',
  yourProgress: 'Sinu progress',
  progressText: (correct: number, total: number, wrong: number) =>
    `${correct} / ${total} küsimust viimati õigesti · ${wrong} vajab kordamist`,
  continuePractice: 'Jätka harjutamist',
  countdownLabel: (date: string) => `Testi tähtaeg: ${date}`,
  countdownIn: 'Tähtajani',
  countdownDays: (n: number) => `${n} p`,
  countdownEnded: 'Tähtaeg möödas',

  // vastuste otsing
  searchPlaceholder: 'Otsi küsimust, vastust või märksõna (nt exp, 401, Bearer)…',
  searchAria: 'Otsi küsimusi',
  allTopics: 'Kõik teemad',
  found: (n: number, total: number) => `Leitud ${n} / ${total} küsimust`,
  clearSearch: 'Tühjenda otsing',
  lastRight: 'Viimati õige',
  lastWrong: 'Viimati vale',
  noResults: 'Ühtegi küsimust ei leitud. Proovi teist otsingusõna.',
  answersDescription: 'Kõik testi küsimused koos õigete vastustega.',
  missingNote:
    'Ekraanipiltidel ei olnud küsimusi **1, 9 ja 30**. Küsimuse 15 rippmenüü valikud olid pildil peidus – kasutatud on vastuskoode 200 / 401 / 403.',

  // tagasiside
  resultCorrect: 'Õige!',
  resultPartial: 'Osaliselt õige',
  resultWrong: 'Vale vastus',
  resultUnanswered: 'Vastamata',
  resultSelf: 'Hinda oma vastust ise',
  compareWithModel: 'Võrdle oma vastust näidisvastusega.',
  iWasRight: 'Vastasin õigesti',
  needMorePractice: 'Pean veel harjutama',
  gradeSaved: 'Hinnang salvestatud:',
  gradeRight: 'õige',
  gradeNeedsPractice: 'vajab harjutamist',

  // eksam
  formatDuration: (seconds: number) => {
    const { m, s } = clock(seconds);
    return `${m} min ${s} s`;
  },
  scoreMessages: [
    'Suurepärane! Oled testiks valmis.',
    'Hästi tehtud! Vaata üle need, mis läksid valesti.',
    'Päris hea algus – korda valesti vastatud küsimusi.',
    'Harjuta veel: vaata õigeid vastuseid ja proovi uuesti.',
  ],
  examScore: (correct: number, total: number) => `Õigesti ${correct} / ${total} automaatselt hinnatud küsimust`,
  timedOut: 'Aeg sai otsa',
  essaysToGrade: (n: number) => `${n} vabavastust hinda allpool ise`,
  retryWrongN: (n: number) => `Korda valesid (${n})`,
  newExam: 'Uus eksam',
  toPracticeHome: 'Testi avalehele',
  reviewHeading: 'Vastuste ülevaade',
  finishExam: 'Lõpeta eksam',
  next: 'Järgmine',
  previous: 'Eelmine',
  examMode: 'Eksamirežiim',
  examSubtitle: (n: number) => `${n} küsimust juhuslikus järjekorras`,
  timeLeft: 'Aega jäänud',
  confirmAbortExam: 'Kas katkestada eksam? Vastuseid ei salvestata.',
  abort: 'Katkesta',
  examNote:
    'Tagasisidet näed alles lõpus. Vastata saab ka hiljem – liigu küsimuste vahel nuppudega „Eelmine” ja „Järgmine”.',

  // harjutus
  answerFirst: 'Vali või kirjuta enne kontrollimist vastus.',
  check: 'Kontrolli',
  practiceDone: 'Harjutus lõpetatud!',
  practiceScore: (label: string, correct: number, answered: number) =>
    `${label}: õigesti ${correct} / ${answered} küsimust`,
  backToPracticeHome: 'Tagasi testi avalehele',
  abortPractice: 'Katkesta harjutus',
  seeSummary: 'Vaata kokkuvõtet',
  nextQuestion: 'Järgmine küsimus',
  tryAgain: 'Proovi uuesti',
  skip: 'Jäta vahele',
  correctThisSession: (n: number) => `${n} õiget sellel harjutusel`,
  autoSaved: 'Progress salvestub automaatselt brauserisse.',
  retryLabel: 'Valede kordamine',

  // harjutustesti avaleht
  hubIntro:
    'Harjuta JWT testi küsimusi kohese tagasisidega või tee proovieksam, kus tulemus selgub lõpus. Progress salvestub sinu brauserisse.',
  unfinishedPractice: (label: string) => `Pooleli harjutus: ${label}`,
  questionOf: (i: number, n: number) => `Küsimus ${i} / ${n}`,
  resume: 'Jätka',
  discard: 'Loobu',
  practiceMode: 'Harjutusrežiim',
  practiceModeDesc: 'Õige vastus kohe pärast iga küsimust.',
  all: 'Kõik',
  shuffleOrder: 'Sega järjekord',
  startPracticeN: (n: number) => `Alusta harjutust (${n})`,
  examModeDesc: 'Juhuslikud küsimused ja vastusevariandid, tulemus selgub lõpus.',
  allN: (n: number) => `Kõik (${n})`,
  timerMinutes: (n: number) => `Taimer (${n} min)`,
  startExam: 'Alusta eksamit',
  needsReview: (n: number) => `${n} küsimust vajab kordamist`,
  examHistory: 'Eksamite ajalugu',
  confirmDelete: 'Kinnita kustutamine',
  cancel: 'Tühista',
  resetProgress: 'Lähtesta progress',
};

export type Messages = typeof et;

const en: Messages = {
  appName: 'JWT Practice',
  siteDescription: 'Prepare for the JWT test: a practice quiz and the correct answers.',
  dateLocale: 'en-GB',
  surveyLocale: 'en',
  rights: 'All rights reserved.',

  practice: 'Practice test',
  answers: 'Answers',
  allAnswers: 'All answers',
  practiceDescription: 'Practice and exam mode for the JWT test with instant feedback.',

  typeLabels: {
    single: 'Single choice',
    multiple: 'Multiple choice',
    truefalse: 'True / false',
    text: 'Short answer',
    matching: 'Matching',
    essay: 'Essay',
  },
  questionN: (n) => `Question ${n}`,
  correctAnswer: 'Correct answer:',
  yourAnswer: 'Your answer',
  unanswered: 'unanswered',
  yourChoice: 'your choice',
  statement: 'Statement',
  correctMatch: 'Correct match',
  modelAnswer: 'Model answer',
  practiceThis: 'Practice this question',

  secretKey: 'secret key',
  useThisToken: 'Use the following token',
  copy: 'Copy',
  copied: 'Copied',
  copyToken: 'Copy token',

  textPlaceholder: 'Your answer…',
  matchColumn: 'Match',
  choosePlaceholder: 'Choose…',
  essayPlaceholder: 'Write your answer here…',

  heroTitle: 'Prepare for the JWT test',
  heroHighlight: 'with confidence',
  startPracticeTest: 'Start the practice test',
  viewAnswers: 'View answers',
  nQuestions: (n) => `${n} ${enPlural(n, 'question', 'questions')}`,
  topicsHeading: 'Topics',
  topicsText: 'The questions are grouped by JWT topic.',
  yourProgress: 'Your progress',
  progressText: (correct, total, wrong) =>
    `${correct} / ${total} questions correct last time · ${wrong} need review`,
  continuePractice: 'Continue practising',
  countdownLabel: (date) => `Test deadline: ${date}`,
  countdownIn: 'Deadline in',
  countdownDays: (n) => `${n}d`,
  countdownEnded: 'Deadline passed',

  searchPlaceholder: 'Search for a question, answer or keyword (e.g. exp, 401, Bearer)…',
  searchAria: 'Search questions',
  allTopics: 'All topics',
  found: (n, total) => `Found ${n} / ${total} questions`,
  clearSearch: 'Clear search',
  lastRight: 'Right last time',
  lastWrong: 'Wrong last time',
  noResults: 'No questions found. Try another search term.',
  answersDescription: 'All test questions with their correct answers.',
  missingNote:
    'Questions **1, 9 and 30** were not in the screenshots. The dropdown options of question 15 were hidden in the screenshot – response codes 200 / 401 / 403 are used.',

  resultCorrect: 'Correct!',
  resultPartial: 'Partially correct',
  resultWrong: 'Wrong answer',
  resultUnanswered: 'Unanswered',
  resultSelf: 'Grade your answer yourself',
  compareWithModel: 'Compare your answer with the model answer.',
  iWasRight: 'I got it right',
  needMorePractice: 'I need more practice',
  gradeSaved: 'Grade saved:',
  gradeRight: 'correct',
  gradeNeedsPractice: 'needs practice',

  formatDuration: (seconds) => {
    const { m, s } = clock(seconds);
    return `${m} min ${s} s`;
  },
  scoreMessages: [
    'Excellent! You are ready for the test.',
    'Well done! Review the ones you got wrong.',
    'A good start – go over the questions you got wrong.',
    'Keep practising: review the correct answers and try again.',
  ],
  examScore: (correct, total) => `${correct} / ${total} auto-graded questions correct`,
  timedOut: 'Time ran out',
  essaysToGrade: (n) => `Grade ${n} ${enPlural(n, 'essay', 'essays')} yourself below`,
  retryWrongN: (n) => `Retry wrong ones (${n})`,
  newExam: 'New exam',
  toPracticeHome: 'Back to practice home',
  reviewHeading: 'Answer review',
  finishExam: 'Finish exam',
  next: 'Next',
  previous: 'Previous',
  examMode: 'Exam mode',
  examSubtitle: (n) => `${n} ${enPlural(n, 'question', 'questions')} in random order`,
  timeLeft: 'Time left',
  confirmAbortExam: 'Abort the exam? Your answers will not be saved.',
  abort: 'Abort',
  examNote:
    'You will only see feedback at the end. You can answer later too – move between questions with the “Previous” and “Next” buttons.',

  answerFirst: 'Choose or type an answer before checking.',
  check: 'Check',
  practiceDone: 'Practice finished!',
  practiceScore: (label, correct, answered) => `${label}: ${correct} / ${answered} correct`,
  backToPracticeHome: 'Back to practice home',
  abortPractice: 'Abort practice',
  seeSummary: 'See summary',
  nextQuestion: 'Next question',
  tryAgain: 'Try again',
  skip: 'Skip',
  correctThisSession: (n) => `${n} correct in this practice`,
  autoSaved: 'Progress is saved in your browser automatically.',
  retryLabel: 'Retrying wrong answers',

  hubIntro:
    'Practise the JWT test questions with instant feedback, or take a mock exam where you see the result at the end. Progress is saved in your browser.',
  unfinishedPractice: (label) => `Unfinished practice: ${label}`,
  questionOf: (i, n) => `Question ${i} / ${n}`,
  resume: 'Resume',
  discard: 'Discard',
  practiceMode: 'Practice mode',
  practiceModeDesc: 'See the correct answer right after each question.',
  all: 'All',
  shuffleOrder: 'Shuffle order',
  startPracticeN: (n) => `Start practice (${n})`,
  examModeDesc: 'Random questions and answer options; see the result at the end.',
  allN: (n) => `All (${n})`,
  timerMinutes: (n) => `Timer (${n} min)`,
  startExam: 'Start exam',
  needsReview: (n) => `${n} ${enPlural(n, 'question needs', 'questions need')} review`,
  examHistory: 'Exam history',
  confirmDelete: 'Confirm reset',
  cancel: 'Cancel',
  resetProgress: 'Reset progress',
};

const ru: Messages = {
  appName: 'JWT-практикум',
  siteDescription: 'Подготовка к тесту по JWT: тренировочный тест и правильные ответы.',
  dateLocale: 'ru-RU',
  surveyLocale: 'ru',
  rights: 'Все права защищены.',

  practice: 'Практика',
  answers: 'Ответы',
  allAnswers: 'Все ответы',
  practiceDescription: 'Режим практики и экзамена по тесту JWT с мгновенной обратной связью.',

  typeLabels: {
    single: 'Один вариант',
    multiple: 'Несколько вариантов',
    truefalse: 'Верно / неверно',
    text: 'Короткий ответ',
    matching: 'Соответствие',
    essay: 'Развёрнутый ответ',
  },
  questionN: (n) => `Вопрос ${n}`,
  correctAnswer: 'Правильный ответ:',
  yourAnswer: 'Ваш ответ',
  unanswered: 'нет ответа',
  yourChoice: 'ваш выбор',
  statement: 'Утверждение',
  correctMatch: 'Правильное соответствие',
  modelAnswer: 'Образец ответа',
  practiceThis: 'Потренировать этот вопрос',

  secretKey: 'секретный ключ',
  useThisToken: 'Используйте следующий токен',
  copy: 'Копировать',
  copied: 'Скопировано',
  copyToken: 'Копировать токен',

  textPlaceholder: 'Ваш ответ…',
  matchColumn: 'Соответствие',
  choosePlaceholder: 'Выберите…',
  essayPlaceholder: 'Напишите ответ здесь…',

  heroTitle: 'Подготовьтесь к тесту по JWT',
  heroHighlight: 'уверенно',
  startPracticeTest: 'Начать практику',
  viewAnswers: 'Смотреть ответы',
  nQuestions: (n) => `${n} ${ruPlural(n, 'вопрос', 'вопроса', 'вопросов')}`,
  topicsHeading: 'Темы',
  topicsText: 'Вопросы сгруппированы по темам JWT.',
  yourProgress: 'Ваш прогресс',
  progressText: (correct, total, wrong) =>
    `${correct} / ${total} ${ruPlural(total, 'вопрос', 'вопроса', 'вопросов')} в последний раз верно · ${wrong} нужно повторить`,
  continuePractice: 'Продолжить практику',
  countdownLabel: (date) => `Срок сдачи теста: ${date}`,
  countdownIn: 'До срока',
  countdownDays: (n) => `${n} д`,
  countdownEnded: 'Срок прошёл',

  searchPlaceholder: 'Найти вопрос, ответ или ключевое слово (например exp, 401, Bearer)…',
  searchAria: 'Поиск по вопросам',
  allTopics: 'Все темы',
  found: (n, total) => `Найдено ${n} / ${total} ${ruPlural(total, 'вопроса', 'вопросов', 'вопросов')}`,
  clearSearch: 'Очистить поиск',
  lastRight: 'В последний раз верно',
  lastWrong: 'В последний раз неверно',
  noResults: 'Вопросы не найдены. Попробуйте другой запрос.',
  answersDescription: 'Все вопросы теста с правильными ответами.',
  missingNote:
    'На скриншотах не было вопросов **1, 9 и 30**. Варианты выпадающего списка вопроса 15 на скриншоте были скрыты – использованы коды ответа 200 / 401 / 403.',

  resultCorrect: 'Верно!',
  resultPartial: 'Частично верно',
  resultWrong: 'Неверный ответ',
  resultUnanswered: 'Нет ответа',
  resultSelf: 'Оцените свой ответ сами',
  compareWithModel: 'Сравните свой ответ с образцом.',
  iWasRight: 'Я ответил(а) верно',
  needMorePractice: 'Нужно ещё потренироваться',
  gradeSaved: 'Оценка сохранена:',
  gradeRight: 'верно',
  gradeNeedsPractice: 'нужно повторить',

  formatDuration: (seconds) => {
    const { m, s } = clock(seconds);
    return `${m} мин ${s} с`;
  },
  scoreMessages: [
    'Отлично! Вы готовы к тесту.',
    'Хорошая работа! Просмотрите вопросы, где были ошибки.',
    'Неплохое начало – повторите вопросы с ошибками.',
    'Нужно ещё потренироваться: посмотрите правильные ответы и попробуйте снова.',
  ],
  examScore: (correct, total) =>
    `Верно ${correct} / ${total} ${ruPlural(total, 'автоматически проверенного вопроса', 'автоматически проверенных вопросов', 'автоматически проверенных вопросов')}`,
  timedOut: 'Время вышло',
  essaysToGrade: (n) =>
    `${n} ${ruPlural(n, 'развёрнутый ответ', 'развёрнутых ответа', 'развёрнутых ответов')} оцените ниже сами`,
  retryWrongN: (n) => `Повторить ошибки (${n})`,
  newExam: 'Новый экзамен',
  toPracticeHome: 'К началу теста',
  reviewHeading: 'Разбор ответов',
  finishExam: 'Завершить экзамен',
  next: 'Далее',
  previous: 'Назад',
  examMode: 'Режим экзамена',
  examSubtitle: (n) => `${n} ${ruPlural(n, 'вопрос', 'вопроса', 'вопросов')} в случайном порядке`,
  timeLeft: 'Осталось времени',
  confirmAbortExam: 'Прервать экзамен? Ответы не будут сохранены.',
  abort: 'Прервать',
  examNote:
    'Обратную связь вы увидите только в конце. Ответить можно и позже – переходите между вопросами кнопками «Назад» и «Далее».',

  answerFirst: 'Выберите или введите ответ перед проверкой.',
  check: 'Проверить',
  practiceDone: 'Практика завершена!',
  practiceScore: (label, correct, answered) =>
    `${label}: верно ${correct} / ${answered} ${ruPlural(answered, 'вопроса', 'вопросов', 'вопросов')}`,
  backToPracticeHome: 'Вернуться к началу теста',
  abortPractice: 'Прервать практику',
  seeSummary: 'Посмотреть итоги',
  nextQuestion: 'Следующий вопрос',
  tryAgain: 'Попробовать снова',
  skip: 'Пропустить',
  correctThisSession: (n) => `${n} ${ruPlural(n, 'верный', 'верных', 'верных')} в этой сессии`,
  autoSaved: 'Прогресс автоматически сохраняется в браузере.',
  retryLabel: 'Повторение ошибок',

  hubIntro:
    'Тренируйтесь на вопросах теста по JWT с мгновенной обратной связью или пройдите пробный экзамен, результат которого будет виден в конце. Прогресс сохраняется в вашем браузере.',
  unfinishedPractice: (label) => `Незавершённая практика: ${label}`,
  questionOf: (i, n) => `Вопрос ${i} / ${n}`,
  resume: 'Продолжить',
  discard: 'Отменить',
  practiceMode: 'Режим практики',
  practiceModeDesc: 'Правильный ответ сразу после каждого вопроса.',
  all: 'Все',
  shuffleOrder: 'Перемешать',
  startPracticeN: (n) => `Начать практику (${n})`,
  examModeDesc: 'Случайные вопросы и варианты ответов, результат – в конце.',
  allN: (n) => `Все (${n})`,
  timerMinutes: (n) => `Таймер (${n} мин)`,
  startExam: 'Начать экзамен',
  needsReview: (n) => `${n} ${ruPlural(n, 'вопрос нужно', 'вопроса нужно', 'вопросов нужно')} повторить`,
  examHistory: 'История экзаменов',
  confirmDelete: 'Подтвердить сброс',
  cancel: 'Отмена',
  resetProgress: 'Сбросить прогресс',
};

const messages: Record<Lang, Messages> = { et, en, ru };

export function getMessages(lang: Lang): Messages {
  return messages[lang];
}
