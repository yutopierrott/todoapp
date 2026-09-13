import TodoApp from "@/components/TodoApp";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-rose-50 px-4 py-16 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <TodoApp />
    </div>
  );
}
