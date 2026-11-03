#!/usr/bin/env node
/**
 * Validator for the CET-4 practice content file.
 *
 *   node plugin/cet4-study/content/validate.mjs
 *
 * Checks the structured exam against its contract and against a hardcoded
 * copy of the KEYS page (page 8 of 2025-12-1/2025-12-1.pdf):
 *
 *   Listening   1-25   B A B D C A C A D B / D C A B A C D B C B / D D A C B
 *   Word bank   26-35  C N D H J E I O G K
 *   Matching    36-45  E K C O G D L J A H
 *   Reading     46-55  A C A B C A C D B D
 *
 * Prints PASS lines and exits 0 when everything checks out, otherwise prints
 * FAIL lines and exits 1.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const EXAM_PATH = join(HERE, "exams", "2025-12-1.json");

// Hardcoded copy of the KEYS page, question number -> answer letter.
const KEYS = {
  1: "B", 2: "A", 3: "B", 4: "D", 5: "C",
  6: "A", 7: "C", 8: "A", 9: "D", 10: "B",
  11: "D", 12: "C", 13: "A", 14: "B", 15: "A",
  16: "C", 17: "D", 18: "B", 19: "C", 20: "B",
  21: "D", 22: "D", 23: "A", 24: "C", 25: "B",
  26: "C", 27: "N", 28: "D", 29: "H", 30: "J",
  31: "E", 32: "I", 33: "O", 34: "G", 35: "K",
  36: "E", 37: "K", 38: "C", 39: "O", 40: "G",
  41: "D", 42: "L", 43: "J", 44: "A", 45: "H",
  46: "A", 47: "C", 48: "A", 49: "B", 50: "C",
  51: "A", 52: "C", 53: "D", 54: "B", 55: "D",
};

const errors = [];
const passed = [];

function fail(message) {
  errors.push(message);
}

function expect(condition, message) {
  if (!condition) fail(message);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/** Run one validation group; record PASS only if it added no errors. */
function group(label, fn) {
  const before = errors.length;
  try {
    fn();
  } catch (error) {
    fail(`${label}: unexpected error: ${error.message}`);
  }
  if (errors.length === before) passed.push(label);
}

function checkOptionsABCD(question, where) {
  expect(isObject(question.options), `${where}: missing options object`);
  if (!isObject(question.options)) return;
  const keys = Object.keys(question.options);
  expect(
    keys.length === 4 && ["A", "B", "C", "D"].every((letter) => Object.hasOwn(question.options, letter)),
    `${where}: options must be exactly A, B, C, D`,
  );
  for (const letter of ["A", "B", "C", "D"]) {
    expect(nonEmptyString(question.options[letter]), `${where}: empty or missing option ${letter}`);
    expect(!/\n/.test(question.options[letter] ?? ""), `${where}: option ${letter} contains a line break`);
  }
}

function checkAnswer(question, where) {
  expect(KEYS[question.no] !== undefined, `${where}: question number not in KEYS`);
  expect(
    question.answer === KEYS[question.no],
    `${where}: answer ${question.answer} != KEYS ${KEYS[question.no]}`,
  );
}

// ---------------------------------------------------------------- load
group("JSON file loads and parses", () => {
  // readFileSync throws on a missing file; JSON.parse throws on malformed JSON.
  expect(readFileSync(EXAM_PATH, "utf8").length > 0, `${EXAM_PATH} is empty`);
});

let exam;
try {
  exam = JSON.parse(readFileSync(EXAM_PATH, "utf8"));
} catch (error) {
  console.error(`FAIL cannot load ${EXAM_PATH}: ${error.message}`);
  process.exit(1);
}

const parts = Array.isArray(exam.parts) ? exam.parts : [];
const findPart = (id) => parts.find((part) => part && part.id === id);

// ---------------------------------------------------------------- top level
group("top-level id, title, source and part list", () => {
  expect(exam.id === "2025-12-1", `id must be "2025-12-1", got ${JSON.stringify(exam.id)}`);
  expect(
    exam.title === "大学英语四级考试 2025 年 12 月真题（第一套）",
    `unexpected title: ${JSON.stringify(exam.title)}`,
  );
  expect(exam.source === "2025-12-1/2025-12-1.pdf", `unexpected source: ${JSON.stringify(exam.source)}`);
  expect(Array.isArray(exam.parts), "parts must be an array");
  expect(
    parts.map((part) => part.id).join(",") === "writing,listening,reading,translation",
    `parts must be writing,listening,reading,translation; got ${parts.map((part) => part.id).join(",")}`,
  );
});

// ---------------------------------------------------------------- writing
group("writing part: directions, prompt, 120-180 word limit", () => {
  const writing = findPart("writing");
  expect(writing !== undefined, "missing writing part");
  if (!writing) return;
  expect(writing.label === "Part I · Writing", `writing label: ${writing.label}`);
  expect(writing.minutes === 30, `writing minutes: ${writing.minutes}`);
  expect(writing.kind === "writing", `writing kind: ${writing.kind}`);
  expect(nonEmptyString(writing.directions), "writing directions empty");
  expect(nonEmptyString(writing.prompt), "writing prompt empty");
  expect(writing.directions.includes("at least 120 words but no more than 180 words"), "writing directions lost the word limit");
  expect(isObject(writing.wordLimit), "writing wordLimit missing");
  expect(writing.wordLimit?.min === 120 && writing.wordLimit?.max === 180, "writing wordLimit must be 120/180");
});

// ---------------------------------------------------------------- listening
const listening = findPart("listening");
const listeningNumbers = [];

group("listening part: three sections A-C with directions and groups", () => {
  expect(listening !== undefined, "missing listening part");
  if (!listening) return;
  expect(listening.label === "Part II · Listening Comprehension", `listening label: ${listening.label}`);
  expect(listening.minutes === 25 && listening.kind === "mcq", "listening minutes/kind must be 25/mcq");
  expect(Array.isArray(listening.sections) && listening.sections.length === 3, "listening must have 3 sections");
  const expected = [
    ["A", "Section A"],
    ["B", "Section B"],
    ["C", "Section C"],
  ];
  listening.sections.forEach((section, index) => {
    const [id, label] = expected[index] ?? [undefined, undefined];
    expect(section.id === id, `listening section ${index} id: ${section.id} != ${id}`);
    expect(section.label === label, `listening section ${index} label: ${section.label} != ${label}`);
    expect(nonEmptyString(section.directions), `listening section ${section.id}: empty directions`);
    expect(Array.isArray(section.groups) && section.groups.length > 0, `listening section ${section.id}: no groups`);
    let groupQuestionTotal = 0;
    for (const g of section.groups ?? []) {
      expect(/^q\d+-\d+$/.test(g.id ?? ""), `listening section ${section.id}: bad group id ${g.id}`);
      expect(nonEmptyString(g.intro), `listening group ${g.id}: empty intro`);
      expect(/^Questions \d+/.test(g.intro ?? ""), `listening group ${g.id}: intro must start with "Questions "`);
      expect(Array.isArray(g.questions) && g.questions.length > 0, `listening group ${g.id}: no questions`);
      groupQuestionTotal += (g.questions ?? []).length;
    }
    expect(groupQuestionTotal > 0, `listening section ${section.id}: no questions`);
  });
});

group("listening Q1-25: each has A-D options and the KEYS answer", () => {
  expect(listening !== undefined, "missing listening part");
  if (!listening) return;
  for (const section of listening.sections ?? []) {
    for (const g of section.groups ?? []) {
      for (const question of g.questions ?? []) {
        const where = `listening Q${question.no}`;
        expect(Number.isInteger(question.no) && question.no >= 1 && question.no <= 25, `${where}: number out of 1-25`);
        expect(!listeningNumbers.includes(question.no), `${where}: duplicate question number`);
        listeningNumbers.push(question.no);
        checkOptionsABCD(question, where);
        expect(["A", "B", "C", "D"].includes(question.answer), `${where}: answer ${question.answer} is not A-D`);
        checkAnswer(question, where);
        expect(!("stem" in question), `${where}: listening questions carry no printed stem`);
      }
    }
  }
  const missing = [];
  for (let n = 1; n <= 25; n += 1) if (!listeningNumbers.includes(n)) missing.push(n);
  expect(missing.length === 0, `listening: missing questions ${missing.join(",")}`);
});

// ---------------------------------------------------------------- reading
const reading = findPart("reading");
const readingA = reading?.sections?.[0];
const readingB = reading?.sections?.[1];
const readingC = reading?.sections?.[2];
const readingNumbers = [];

group("reading part: three sections with the expected labels", () => {
  expect(reading !== undefined, "missing reading part");
  if (!reading) return;
  expect(reading.label === "Part III · Reading Comprehension", `reading label: ${reading.label}`);
  expect(reading.minutes === 40 && reading.kind === "reading", "reading minutes/kind must be 40/reading");
  expect(Array.isArray(reading.sections) && reading.sections.length === 3, "reading must have 3 sections");
  const labels = ["Section A · 选词填空", "Section B · 段落匹配", "Section C · 仔细阅读"];
  reading.sections.forEach((section, index) => {
    expect(section.id === ["A", "B", "C"][index], `reading section ${index} id: ${section.id}`);
    expect(section.label === labels[index], `reading section ${index} label: ${section.label} != ${labels[index]}`);
    expect(nonEmptyString(section.directions), `reading section ${section.id}: empty directions`);
  });
});

group("reading Section A: word bank A-O, ten blanks, answers 26-35", () => {
  expect(readingA !== undefined, "missing reading section A");
  if (!readingA) return;
  expect(nonEmptyString(readingA.passage), "reading A passage empty");
  const bank = Array.isArray(readingA.wordBank) ? readingA.wordBank : [];
  expect(bank.length === 15, `word bank must have 15 entries, got ${bank.length}`);
  const letters = bank.map((entry) => entry.letter).join("");
  expect(letters === "ABCDEFGHIJKLMNO", `word bank letters must be A-O in order, got ${letters}`);
  for (const entry of bank) {
    expect(nonEmptyString(entry.word), `word bank entry ${entry.letter} has an empty word`);
    expect(!/\s/.test(entry.word ?? ""), `word bank entry ${entry.letter} must be a single word`);
  }
  for (let n = 26; n <= 35; n += 1) {
    expect(readingA.passage.includes(`___${n}___`), `reading A passage lost blank ${n}`);
  }
  const questions = Array.isArray(readingA.questions) ? readingA.questions : [];
  expect(questions.length === 10, `reading A must have 10 questions, got ${questions.length}`);
  for (const question of questions) {
    const where = `reading A Q${question.no}`;
    expect(question.no >= 26 && question.no <= 35, `${where}: number out of 26-35`);
    expect(!readingNumbers.includes(question.no), `${where}: duplicate question number`);
    readingNumbers.push(question.no);
    expect(!("options" in question), `${where}: word-bank questions have no options`);
    expect(nonEmptyString(question.answer) && question.answer.length === 1, `${where}: answer missing`);
    expect(bank.some((entry) => entry.letter === question.answer), `${where}: answer ${question.answer} not in word bank`);
    checkAnswer(question, where);
  }
});

group("reading Section B: paragraphs A-O, statements 36-45 with answers", () => {
  expect(readingB !== undefined, "missing reading section B");
  if (!readingB) return;
  expect(
    readingB.passageTitle === "The battle over bike lanes needs a mindset shift",
    `reading B passageTitle: ${readingB.passageTitle}`,
  );
  const paragraphs = Array.isArray(readingB.paragraphs) ? readingB.paragraphs : [];
  expect(paragraphs.length === 15, `reading B must have 15 paragraphs, got ${paragraphs.length}`);
  expect(
    paragraphs.map((paragraph) => paragraph.letter).join("") === "ABCDEFGHIJKLMNO",
    `reading B paragraph letters must be A-O in order, got ${paragraphs.map((p) => p.letter).join("")}`,
  );
  for (const paragraph of paragraphs) {
    expect(nonEmptyString(paragraph.text), `reading B paragraph ${paragraph.letter} is empty`);
    expect((paragraph.text ?? "").length > 80, `reading B paragraph ${paragraph.letter} looks truncated`);
  }
  const questions = Array.isArray(readingB.questions) ? readingB.questions : [];
  expect(questions.length === 10, `reading B must have 10 statements, got ${questions.length}`);
  for (const question of questions) {
    const where = `reading B Q${question.no}`;
    expect(question.no >= 36 && question.no <= 45, `${where}: number out of 36-45`);
    expect(!readingNumbers.includes(question.no), `${where}: duplicate question number`);
    readingNumbers.push(question.no);
    expect(nonEmptyString(question.stem), `${where}: empty stem`);
    expect(!("options" in question), `${where}: paragraph-matching statements have no options`);
    expect(paragraphs.some((paragraph) => paragraph.letter === question.answer), `${where}: answer not an existing paragraph`);
    checkAnswer(question, where);
  }
});

group("reading Section C: Passage One 46-50 and Passage Two 51-55, four options each", () => {
  expect(readingC !== undefined, "missing reading section C");
  if (!readingC) return;
  const passages = Array.isArray(readingC.passages) ? readingC.passages : [];
  expect(passages.length === 2, `reading C must have 2 passages, got ${passages.length}`);
  expect(
    passages.map((passage) => passage.title).join(",") === "Passage One,Passage Two",
    `reading C titles must be Passage One, Passage Two; got ${passages.map((p) => p.title).join(",")}`,
  );
  for (const passage of passages) {
    expect(nonEmptyString(passage.text), `reading C ${passage.title}: empty passage text`);
    expect((passage.text ?? "").length > 500, `reading C ${passage.title}: passage looks truncated`);
    const questions = Array.isArray(passage.questions) ? passage.questions : [];
    expect(questions.length === 5, `reading C ${passage.title}: expected 5 questions, got ${questions.length}`);
    for (const question of questions) {
      const where = `reading C Q${question.no}`;
      expect(question.no >= 46 && question.no <= 55, `${where}: number out of 46-55`);
      expect(!readingNumbers.includes(question.no), `${where}: duplicate question number`);
      readingNumbers.push(question.no);
      expect(nonEmptyString(question.stem), `${where}: empty stem`);
      checkOptionsABCD(question, where);
      checkAnswer(question, where);
    }
  }
});

// ---------------------------------------------------------------- translation
group("translation part: directions, Chinese passage, empty reference", () => {
  const translation = findPart("translation");
  expect(translation !== undefined, "missing translation part");
  if (!translation) return;
  expect(translation.label === "Part IV · Translation", `translation label: ${translation.label}`);
  expect(translation.minutes === 30 && translation.kind === "translation", "translation minutes/kind must be 30/translation");
  expect(nonEmptyString(translation.directions), "translation directions empty");
  expect(nonEmptyString(translation.chinese), "translation Chinese passage empty");
  expect((translation.chinese ?? "").length > 100, "translation Chinese passage looks truncated");
  expect(translation.chinese.includes("民营经济"), "translation Chinese passage is not the expected text");
  expect(translation.reference === "", `translation.reference must be an empty string, got ${JSON.stringify(translation.reference)}`);
});

// ---------------------------------------------------------------- global
group("questions 1-55 appear exactly once", () => {
  const all = [...listeningNumbers, ...readingNumbers].sort((a, b) => a - b);
  expect(all.length === 55, `expected 55 questions, got ${all.length}`);
  expect(
    all.every((number, index) => number === index + 1),
    `question numbers must be exactly 1-55 once; got ${all.join(",")}`,
  );
  expect(listeningNumbers.length === 25, `expected 25 listening questions, got ${listeningNumbers.length}`);
  expect(readingNumbers.length === 30, `expected 30 reading questions, got ${readingNumbers.length}`);
  expect(Object.keys(KEYS).length === 55, "hardcoded KEYS must cover 1-55");
});

group("no empty strings anywhere except translation.reference", () => {
  const scan = JSON.parse(JSON.stringify(exam));
  const translation = Array.isArray(scan.parts) ? scan.parts.find((part) => part.id === "translation") : undefined;
  if (translation) delete translation.reference;
  const walk = (value, path) => {
    if (typeof value === "string") {
      if (value.trim() === "") fail(`empty string at ${path}`);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${path}[${index}]`));
      return;
    }
    if (isObject(value)) {
      for (const [key, child] of Object.entries(value)) walk(child, `${path}.${key}`);
    }
  };
  walk(scan, "$");
});

// ---------------------------------------------------------------- report
if (errors.length > 0) {
  console.error(`FAIL ${exam.id}: ${errors.length} problem(s) found`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`PASS exam id/title/source: ${exam.id} — ${exam.title}`);
for (const label of passed) console.log(`PASS ${label}`);
console.log("PASS all 55 answers equal the hardcoded KEYS copy (Listening 1-25, word bank 26-35, matching 36-45, reading 46-55)");
console.log("PASS question numbers 1-55 present exactly once; 25 listening + 30 reading");
console.log("PASS word bank letters A-O and paragraph letters A-O complete; no empty strings");
console.log(`PASS ${passed.length} validation groups, 0 failures`);
process.exit(0);
