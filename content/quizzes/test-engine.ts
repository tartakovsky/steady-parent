/**
 * Test that the generic quiz engine works with the JSON quiz data
 */

import { QuizEngine } from './quiz-engine';
import quizData from './potty-training-readiness.json';

const engine = new QuizEngine(quizData as any);

// Validate
console.log('VALIDATING QUIZ...');
const validation = engine.validate();
if (validation.valid) {
  console.log('✓ Quiz configuration is valid\n');
} else {
  console.log('✗ Validation errors:');
  validation.errors.forEach(e => console.log(`  - ${e}`));
  process.exit(1);
}

// Test with mixed answers
const mixedAnswers = {
  q1: 'q1a', q2: 'q2a', q3: 'q3a', q4: 'q4b',
  q5: 'q5a', q6: 'q6b', q7: 'q7b',
  q8: 'q8b', q9: 'q9a', q10: 'q10b',
};

console.log('ASSEMBLING RESULT...');
const result = engine.assembleResult(mixedAnswers);

console.log(`\nRESULT SUMMARY:`);
console.log(`  Quiz: ${engine.getMeta().title}`);
console.log(`  Score: ${result.totalScore}/${result.maxScore} (${result.percentage}%)`);
console.log(`  Result: ${result.headline} - ${result.subheadline}`);

console.log(`\nDOMAINS:`);
for (const d of result.domains) {
  console.log(`  ${d.name}: ${d.score}/${d.maxScore} (${d.level}) - ${d.headline}`);
}

console.log(`\nSTRENGTHS: ${result.strengths.length}`);
result.strengths.forEach(s => console.log(`  ✓ ${s}`));

console.log(`\nCONCERNS: ${result.concerns.length}`);
result.concerns.forEach(c => console.log(`  ⚠ ${c}`));

console.log(`\nNEXT STEPS: ${result.nextSteps.length}`);
result.nextSteps.forEach(s => console.log(`  • ${s}`));

const card = engine.generateShareableCard(result);
console.log(`\nSHAREABLE CARD URL: ${card.url}`);

console.log('\n✓ Generic engine works with JSON quiz data');
