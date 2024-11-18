'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2 } from 'lucide-react'
import { useAtomInstance, useAtomValue } from "@zedux/react"
import {todoAgentTools, todoAtom} from "@/agents/todo-atom";
import OpenAI from "openai";
import {toTool} from "@/lib/zod-function-tool-def";

export function TodoListComponent() {
  const todoInstance = useAtomInstance(todoAtom);
  const { addTodos, toggleTodos, removeTodos } = todoInstance.exports
  const todoList = useAtomValue(todoAtom)

  const [newTodo, setNewTodo] = useState('')
  const [inputDisabled, setInputDisabled] = useState(false)

  const tools = [
    ...todoAgentTools(todoInstance)
  ]

  const submitPrompt = async() => {
    if (newTodo.trim() !== '') {
      setInputDisabled(true)
      await executeToolCalls(newTodo)
      setNewTodo('')
      setInputDisabled(false)
    }
  }

  const executeToolCalls = async (prompt: string) => {
    const completion: OpenAI.Chat.Completions.ChatCompletion =
      await fetch('/api/tool-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: JSON.stringify(todoList),
          prompt: prompt,
          functions: tools.map(toTool)
        })
      }).then(res => res.json())
    const { message } = completion.choices[0]
    const toolCalls = message.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const foundTool = tools.find(tool => tool.name === toolCall.function.name)
        if (foundTool) {
          try {
            const args = foundTool.parameters.parse(JSON.parse(toolCall.function.arguments))
            console.log(`Executing tool ${toolCall.function.name} with arguments: ${JSON.stringify(args)}`)
            await foundTool.function(args)
          } catch (e) {
            console.log(`Error executing tool ${toolCall.function.name} result was: ${e}`)
          }
        } else {
          console.log(`Tool ${toolCall.function.name} not found`)
        }
      }
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Todo List</h1>
      <div className="flex mb-4">
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add, change status, or delete your todo list items"
          className="flex-grow mr-2"
        />
        <Button disabled={inputDisabled} onClick={submitPrompt}>→</Button>
      </div>
      <ul className="space-y-2">
        {todoList.map(todo => (
          <li key={todo.id} className="flex items-center justify-between bg-gray-100 p-3 rounded">
            <div className="flex-grow">
              <div className="flex items-center">
                <Checkbox
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodos({ ids: [todo.id] })}
                  className="mr-2"
                />
                <div>
                  <label
                    htmlFor={`todo-${todo.id}`}
                    className={`${todo.completed ? 'line-through text-gray-500' : ''}`}
                  >
                    {todo.title}
                  </label>
                  <p className="text-sm text-gray-500">{todo.description}</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeTodos({ ids: [todo.id] })}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
