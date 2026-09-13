"use client";

import { useEffect, useState } from "react";
import type { Todo } from "@/app/types";

const STORAGE_KEY = "simple-todo-app:todos";

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        // 初回マウント時に一度だけlocalStorageの内容を読み込む
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTodos(JSON.parse(saved));
      }
    } catch {
      // localStorageが使えない環境では初期状態のまま表示する
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // 保存に失敗しても画面上の操作は継続できるようにする
    }
  }, [todos, isLoaded]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: value,
      completed: false,
    };
    setTodos((prev) => [...prev, newTodo]);
    setText("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const remainingCount = todos.filter((todo) => !todo.completed).length;

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-indigo-100 backdrop-blur-sm sm:p-8 dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-none">
        <header className="mb-6 text-center">
          <p className="text-sm font-medium tracking-wide text-indigo-500 dark:text-indigo-400">
            SIMPLE TODO
          </p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-800 dark:text-zinc-50">
            やることリスト
          </h1>
        </header>

        <form onSubmit={addTodo} className="mb-5 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="新しいタスクを入力..."
            className="flex-1 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-indigo-900"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 active:scale-95"
          >
            追加
          </button>
        </form>

        {todos.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-400 dark:text-zinc-500">
            タスクがありません。追加してみましょう！
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="group flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white px-4 py-3 transition hover:border-indigo-100 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-800/60"
              >
                <button
                  type="button"
                  onClick={() => toggleTodo(todo.id)}
                  aria-label={
                    todo.completed ? "未完了に戻す" : "完了にする"
                  }
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    todo.completed
                      ? "border-indigo-500 bg-indigo-500 text-white"
                      : "border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {todo.completed && (
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      className="h-3 w-3"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 6.5L4.5 9L10 3"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>

                <span
                  className={`flex-1 break-all text-sm ${
                    todo.completed
                      ? "text-zinc-400 line-through dark:text-zinc-500"
                      : "text-zinc-700 dark:text-zinc-100"
                  }`}
                >
                  {todo.text}
                </span>

                <button
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label="削除"
                  className="shrink-0 text-zinc-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100 dark:text-zinc-600"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 6l8 8M14 6l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {todos.length > 0 && (
          <p className="mt-5 text-center text-xs text-zinc-400 dark:text-zinc-500">
            残り {remainingCount} / {todos.length} 件
          </p>
        )}
      </div>
    </div>
  );
}
