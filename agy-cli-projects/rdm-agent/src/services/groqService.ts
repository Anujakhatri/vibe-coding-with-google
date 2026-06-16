import Groq from 'groq-sdk';
import { useStore } from '../store/useStore';

const MODEL = 'llama-3.3-70b-versatile';

const getGroqClient = () => {
  const apiKey = useStore.getState().apiKey;
  if (!apiKey) throw new Error('Groq API key is not set');
  
  return new Groq({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

const SYSTEM_PROMPT = `You are a highly skilled Relational Database Management (RDM) Agent. 
You must provide your responses and explanations in BOTH Nepali and English.
Always format your response cleanly using Markdown.
If you output SQL, always wrap it in \`\`\`sql ... \`\`\` blocks.
If you output JSON, always wrap it in \`\`\`json ... \`\`\` blocks.`;

export const groqService = {
  async generateSchema(description: string) {
    const client = getGroqClient();
    
    // We request two things: Markdown explanation + JSON structure for ERD
    const prompt = `
    User description: ${description}
    
    Please design a relational database schema for this requirement.
    
    First, provide a detailed explanation of the tables, columns, primary keys, foreign keys, and relationships in BOTH Nepali and English.
    
    Then, provide the raw SQL for creating these tables.
    
    Finally, output a JSON block at the very end with this exact structure for rendering an ERD (wrap it in \`\`\`json ... \`\`\`):
    {
      "tables": [
        {
          "name": "table_name",
          "columns": [
            { "name": "id", "type": "int", "isPrimary": true },
            { "name": "user_id", "type": "int", "isForeign": true, "references": "users.id" }
          ]
        }
      ]
    }`;

    const completion = await client.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      model: MODEL,
      temperature: 0.1,
    });

    return completion.choices[0]?.message?.content || '';
  },

  async generateQuery(description: string) {
    const client = getGroqClient();
    const prompt = `Write a SQL query for the following requirement: ${description}\n\nProvide the SQL query wrapped in \`\`\`sql ... \`\`\` and explain how it works in BOTH Nepali and English.`;
    
    const completion = await client.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      model: MODEL,
      temperature: 0.1,
    });

    return completion.choices[0]?.message?.content || '';
  },

  async debugQuery(brokenQuery: string, schemaContext?: string) {
    const client = getGroqClient();
    const prompt = `Debug the following SQL query:\n\n\`\`\`sql\n${brokenQuery}\n\`\`\`\n\n${schemaContext ? `Context Schema:\n${schemaContext}\n\n` : ''}Find the bug, provide the corrected SQL query wrapped in \`\`\`sql ... \`\`\`, and explain what was wrong and how you fixed it in BOTH Nepali and English.`;
    
    const completion = await client.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      model: MODEL,
      temperature: 0.1,
    });

    return completion.choices[0]?.message?.content || '';
  },

  async generateDummyData(schema: string) {
    const client = getGroqClient();
    const prompt = `Given the following database schema, generate realistic seed data using SQL INSERT statements.\n\nSchema:\n${schema}\n\nProvide the INSERT statements wrapped in \`\`\`sql ... \`\`\` and provide a brief explanation in BOTH Nepali and English.`;
    
    const completion = await client.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      model: MODEL,
      temperature: 0.7, // slightly higher temp for varied dummy data
    });

    return completion.choices[0]?.message?.content || '';
  }
};
