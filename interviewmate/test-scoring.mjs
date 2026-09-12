import assert from 'assert';

// Mock session and questions similar to what is in the app
const questions = [
  { id: 'q1', type: 'mcq', correctAnswerIndex: 0 },
  { id: 'q2', type: 'mcq', correctAnswerIndex: 1 },
  { id: 'q3', type: 'mcq', correctAnswerIndex: 2 },
  { id: 'q4', type: 'coding' },
  { id: 'q5', type: 'coding' },
];

const session = {
  mcqAnswers: {
    'q1': 1, // Wrong
    'q2': 0, // Wrong
    'q3': 1, // Wrong
  },
  codingScores: {
    3: 0, // Unattempted (0 assigned by handleNextQuestion)
    4: 0, // Unattempted
  }
};

console.log("Running scoring logic test with all-wrong MCQs and unattempted coding...");

// 1. Test MCQ Score Logic
const mcqQuestions = questions.filter(q => q.type === "mcq");
const totalMcq = mcqQuestions.length;
let actualMcqCorrect = 0;
mcqQuestions.forEach((q) => {
  if (session.mcqAnswers && session.mcqAnswers[q.id] === q.correctAnswerIndex) {
    actualMcqCorrect++;
  }
});
const mcqPercentage = Math.min(100, Math.round((actualMcqCorrect / totalMcq) * 100));

assert.strictEqual(actualMcqCorrect, 0, "Actual MCQ correct should be 0");
assert.strictEqual(mcqPercentage, 0, "MCQ percentage should be 0");
console.log(`✅ MCQ Score correctly calculated: ${actualMcqCorrect}/${totalMcq} (${mcqPercentage}%)`);

// 2. Test Coding Score Logic
const codingQuestions = questions.map((q, idx) => ({ q, idx })).filter(x => x.q.type === "coding" || x.q.type === "theory");
const totalCoding = codingQuestions.length;
let totalCodingScore = 0;
let evaluatedCount = 0;

codingQuestions.forEach(({ idx }) => {
  if (session.codingScores && session.codingScores[idx] !== undefined) {
      if (session.codingScores[idx] > 0) {
          evaluatedCount++;
      }
      totalCodingScore += session.codingScores[idx];
  }
});

const codingScoreVal = Math.round(totalCodingScore / totalCoding);
const isUnattempted = evaluatedCount === 0 && codingScoreVal === 0;

assert.strictEqual(codingScoreVal, 0, "Coding score should be 0 for unattempted questions");
assert.strictEqual(isUnattempted, true, "isUnattempted should be true");
console.log(`✅ Coding Score correctly calculated: ${codingScoreVal}/100. Status: ${isUnattempted ? 'Not Attempted' : 'Evaluated'}`);
