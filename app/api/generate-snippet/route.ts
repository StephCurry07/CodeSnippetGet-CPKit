import {
    CopilotRuntime,
    GroqAdapter,
    OpenAIAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
  } from '@copilotkit/runtime';
  import OpenAI from 'openai';
  import Groq from 'groq-sdk'
  import { NextRequest, NextResponse } from 'next/server';
   
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//   const groqApiKey = process.env.GROQ_API_KEY; 
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY});
  // const serviceAdapter = new OpenAIAdapter({ openai, model:'gpt-3.5-turbo' });

  const serviceAdapter = new GroqAdapter({ model: "llama3-8b-8192" }); 
  const runtime = new CopilotRuntime();
export const POST = async (req: Request) => {
  try {
      const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
        runtime,
        serviceAdapter,
        endpoint: '/api/generate-snippet',
      });
  
      return handleRequest(req);
    } catch (error) {
      console.error('Error in generate-snippet route:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  };