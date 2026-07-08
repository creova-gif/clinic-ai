const fs = require('fs');

// 1. Update SymptomCheckerAI.tsx
let checker = fs.readFileSync('src/app/components/SymptomCheckerAI.tsx', 'utf8');
checker = checker.replace("import { getChatModel } from '../services/firebaseAI';", 
"import { performLocalTriage } from '../services/localTriageEngine';\nimport { createLocalChatSession } from '../services/localChatMock';");

checker = checker.replace("chatSessionRef.current = getChatModel().startChat({", 
"chatSessionRef.current = createLocalChatSession();\n    /*");

checker = checker.replace("] }\\n      ]\\n    });", "] }\n      ]\n    });*/");

// Replace generateTriage in finalizeAssessment
checker = checker.replace(/import \{ generateTriage \} from '\.\.\/services\/firebaseAI';/g, '');
checker = checker.replace(/const result = await generateTriage\\(\\{[^}]+\\}\\);/g, 'const result = await performLocalTriage(transcript);');
// Fix any other references to generateTriage if they exist in SymptomCheckerAI
if (checker.includes('generateTriage')) {
  checker = checker.replace(/generateTriage\\([^)]+\\)/g, 'performLocalTriage(transcript)');
}

fs.writeFileSync('src/app/components/SymptomCheckerAI.tsx', checker);

// 2. Create localChatMock.ts
fs.writeFileSync('src/app/services/localChatMock.ts', `
export function createLocalChatSession() {
  let turn = 0;
  return {
    sendMessage: async (msg: string) => {
      turn++;
      return {
        response: {
          text: () => {
            if (turn === 1) return "How long have you been experiencing these symptoms?";
            if (turn === 2) return "On a scale of 1-10, how severe is the pain or discomfort?";
            return "[ASSESSMENT_COMPLETE]";
          }
        }
      };
    }
  };
}
`);

// 3. Update AutonomousDispatchEngine.ts
let dispatch = fs.readFileSync('src/app/services/AutonomousDispatchEngine.ts', 'utf8');
dispatch = dispatch.replace("import { getDispatchModel } from './firebaseAI';", "import { performLocalTriage } from './localTriageEngine';");

// replace the getDispatchModel().generateContent(...)
dispatch = dispatch.replace(/const prompt = `[^`]+`;[^]*?const response = await model\\.generateContent\\(prompt\\);[^]*?const text = response\\.response\\.text\\(\\);[^]*?const result = JSON\\.parse\\(text\\);/g, 
`const result = await performLocalTriage(JSON.stringify(triageData));`);

fs.writeFileSync('src/app/services/AutonomousDispatchEngine.ts', dispatch);

console.log('Updated AI files');
