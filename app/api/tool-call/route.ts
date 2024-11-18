import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { context, prompt, functions} = await request.json();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Your role is one of a specialized user assistant focused on understanding intent of ' +
          'user requests and mapping them to the right tool call(s). Take special care when identifying multiple requests.'},
      { role: 'system', content: 'Context from the user environment: ' + context},
      { role: 'user', content: prompt }
    ],
    tools: functions,
    tool_choice: 'required',
  });
  return Response.json(completion)
}