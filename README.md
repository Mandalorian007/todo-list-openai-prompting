## Getting Started

Sample project of using openai prompting combined with function/tool calls to change ui state components

to run the example first create a `.env` file in project root add add your openai api key under the variable name: `OPENAI_API_KEY=your_api_key_here`

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Understanding application architecture

This application is setup with the core idea of agents maintaining a particular set of state for the application. This state can be managed through functions called by clicking things on the UI or alternatively by using a prompt to trigger their calls.

The main components of the application are:
  - Generic todo list component initially made with V0.dev with public link [here](https://v0.dev/chat/ogIEOaVvmzn).
  - Global state is managed with [Zedux](https://omnistac.github.io/zedux/docs/walkthrough/atom-apis#exports) since it has a nice exports feature allowing for me to have edit functions baked into the atom.
  - UUID library was used for general uuid creation support
  - [ZOD](https://github.com/colinhacks/zod) was used for json schema support
  - OpenAI's [node library](https://github.com/openai/openai-node) was used for api calls and it's clean zod integration with structured outputs and tool calls
  - `lib/zod-function-tool-def.ts` is a helper file to ensure we have a very clean tool definition and a helper to provide it to openAI
  - Tool calls we are about I reference as `agents` these agents will implement the state management, api, and tool call mappings. This application only has one for TodoList management implemented, but could easily support more.
  - `components/todo-list.tsx` Is the main application file primarily generated by V0.dev, but we have imported the todoAtom with it's api for editing existing todos as well as added a new function for making the openai call from the prompt. It's worth noting we call the application's only api route to make sure the openAI call happens on the server and not the front end to keep the openai api key secure.

Hope this inspires you :)
