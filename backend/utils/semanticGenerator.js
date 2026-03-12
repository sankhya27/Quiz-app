/**
 * Semantic Template Generator
 * Provides an "AI-like" experience for quiz generation without external API calls.
 */

const KNOWLEDGE_BASE = {
    'javascript': {
        concepts: ['Variables', 'Promises', 'Closures', 'Classes', 'DOM Manipulation'],
        facts: [
            { question: 'What keyword is used for constant variables?', answer: 'const', options: ['let', 'var', 'const'] },
            { question: 'Which method adds an element to the end of an array?', answer: 'push()', options: ['pop()', 'push()', 'shift()'] },
            { question: 'What does DOM stand for?', answer: 'Document Object Model', options: ['Data Object Mode', 'Document Object Model', 'Digital Online Method'] }
        ]
    },
    'react': {
        concepts: ['Hooks', 'Components', 'Props', 'State', 'Virtual DOM'],
        facts: [
            { question: 'Which hook is used for side effects?', answer: 'useEffect', options: ['useState', 'useMemo', 'useEffect'] },
            { question: 'How do you pass data between components?', answer: 'Props', options: ['State', 'Props', 'Context'] },
            { question: 'What is the Virtual DOM used for?', answer: 'Improving Performance', options: ['Storing Secrets', 'Improving Performance', 'Routing'] }
        ]
    },
    'science': {
        concepts: ['Gravity', 'Photosynthesis', 'Atoms', 'DNA', 'The Solar System'],
        facts: [
            { question: 'What is the center of an atom called?', answer: 'Nucleus', options: ['Electron', 'Nucleus', 'Proton'] },
            { question: 'What planet is known as the Red Planet?', answer: 'Mars', options: ['Venus', 'Mars', 'Jupiter'] },
            { question: 'Which gas do plants absorb during photosynthesis?', answer: 'Carbon Dioxide', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide'] }
        ]
    },
    'general': {
        concepts: ['Logic', 'Trivia', 'Strategy'],
        facts: [
            { question: 'Which of these is a primary color?', answer: 'Blue', options: ['Green', 'Orange', 'Blue'] },
            { question: 'How many continents are there?', answer: '7', options: ['5', '6', '7'] },
            { question: 'What is the largest ocean?', answer: 'Pacific', options: ['Atlantic', 'Indian', 'Pacific'] }
        ]
    }
};

const GENERIC_TEMPLATES = [
    { q: "What is the primary focus of {{topic}}?", a: "Core Fundamentals", o: ["Advanced UI", "Core Fundamentals", "Backend Logic"] },
    { q: "Which of the following is an essential concept in {{topic}}?", a: "Architecture", o: ["Legacy Support", "Architecture", "Design Patterns"] },
    { q: "In the context of {{topic}}, what is a common best practice?", a: "Documentation", o: ["Documentation", "Rapid Prototyping", "Testing"] },
    { q: "What is a main advantage of mastering {{topic}}?", a: "Efficiency", o: ["Efficiency", "Cost reduction", "Legacy maintenance"] },
    { q: "Which tool is most commonly associated with {{topic}}?", a: "Development IDE", o: ["Development IDE", "Spreadsheets", "Note taking app"] }
];

/**
 * Generates a quiz based on semantic patterns
 * @param {string} topic 
 * @param {number} count 
 */
function generateSemanticQuiz(topic, count) {
    const normalizedTopic = topic.toLowerCase().trim();
    let questions = [];
    
    // Find matching knowledge or use general
    const kbEntry = KNOWLEDGE_BASE[normalizedTopic] || KNOWLEDGE_BASE.general;
    
    // 1. Fill with specific facts if available
    const facts = [...kbEntry.facts];
    while (questions.length < count && facts.length > 0) {
        const randomIndex = Math.floor(Math.random() * facts.length);
        questions.push(facts.splice(randomIndex, 1)[0]);
    }
    
    // 2. Use generic templates if we need more questions
    let templatePool = [...GENERIC_TEMPLATES];
    while (questions.length < count) {
        if (templatePool.length === 0) templatePool = [...GENERIC_TEMPLATES]; // Refill if exhausted
        
        const randomIndex = Math.floor(Math.random() * templatePool.length);
        const template = templatePool.splice(randomIndex, 1)[0];
        
        // Inject topic into template
        questions.push({
            question: template.q.replace('{{topic}}', topic),
            answer: template.a,
            options: [...template.o]
        });
    }
    
    // Shuffle the final questions strictly to the count
    return questions.slice(0, count);
}

module.exports = { generateSemanticQuiz };
