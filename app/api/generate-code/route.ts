import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({apiKey: process.env.GROQ_API_KEY})
export async function POST(req: NextRequest) {
  try {
    const { prompt, language } = await req.json();

    if (!prompt || !language) {
      return NextResponse.json({ error: 'Prompt and language are required' }, { status: 400 });
    }

    const codeCompletion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: `You are a helpful assistant that generates ${language} code snippets. Only give code, no introduction and conclusion` },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const generatedCode = codeCompletion.choices[0]?.message?.content?.replace(/```/g, '')
    .trim()
    .split('\n')
    .slice(1)
    .join('\n') || 'Unable to generate code';

    const expCompletion = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a helpful assistant that explains code snippets. Provide a concise explanation of the following code." },
          { role: "user", content: `Explain this ${language} code:\n\n${generatedCode}` }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });
      const explanation = expCompletion.choices[0]?.message?.content || 'Unable to generate explanation';

      return NextResponse.json({ code: generatedCode, explanation: explanation });
  } catch (error) {
    console.error('Error in generate-code route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}