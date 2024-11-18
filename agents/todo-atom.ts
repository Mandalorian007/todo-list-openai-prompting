import {
  api,
  atom,
  AtomInstanceType,
  injectStore,
  Store,
} from "@zedux/atoms";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { FunctionToolDef } from "@/lib/zod-function-tool-def";

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const addTodosSchema = z.object({
  todos: z
    .array(
      z.object({
        title: z.string().describe("Title of an item in a todo list"),
        description: z.string().describe("Content of an item in a todo list"),
        completed: z.boolean().describe("Completion status of an item in a todo list generally false when not specified"),
      }).describe('A uuid will be generated')
    ).describe("A list of todos to add. It can do 5 at a time. Submit multiple requests for more."),
  // TODO consider this trick for batching, but noting validation breaks serialization when using something like max(5)
}).describe("A tool used for adding multiple items to a todo list");
type AddTodosParams = z.infer<typeof addTodosSchema>;

const toggleTodosCompleteSchema = z.object({
  ids: z.array(z.string().describe("ID of an item in a todo list")),
}).describe("Toggle the completion status of multiple items in a todo list");
type ToggleTodosCompleteParams = z.infer<typeof toggleTodosCompleteSchema>;

const removeTodosSchema = z.object({
  ids: z.array(z.string().describe("ID of an item in a todo list")),
}).describe("Remove multiple items from a todo list");
type RemoveTodosParams = z.infer<typeof removeTodosSchema>;

export const todoAtom = atom("todo", () => {
  const store: Store<Todo[]> = injectStore([] as Todo[]);

  return api(store).setExports({
    addTodos: ({ todos }: AddTodosParams) => {
      store.setState((state) => [
        ...state,
        ...todos.map(({ title, description, completed }) => ({
          id: uuidv4(),
          title,
          description,
          completed: completed,
        })),
      ]);
    },
    toggleTodos: ({ ids }: ToggleTodosCompleteParams) => {
      store.setStateDeep((state) =>
        state.map((todo) =>
          ids.includes(todo.id)
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      );
    },
    removeTodos: ({ ids }: RemoveTodosParams) => {
      store.setStateDeep((state) =>
        state.filter((todo) => !ids.includes(todo.id))
      );
    },
  });
});

export const todoAgentTools = (todoAtomInstance: AtomInstanceType<typeof todoAtom>) => {
  const todoFunctions = todoAtomInstance.exports;
  const tools: FunctionToolDef<any>[] = [
    {
      name: "add_todo_list_items",
      parameters: addTodosSchema,
      function: todoFunctions.addTodos,
    },
    {
      name: "toggle_todo_completed_statuses",
      parameters: toggleTodosCompleteSchema,
      function: todoFunctions.toggleTodos,
    },
    {
      name: "remove_todo_list_items",
      parameters: removeTodosSchema,
      function: todoFunctions.removeTodos,
    },
  ];
  return tools;
};
