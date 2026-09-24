import { storage } from "@/core/storage/localStorage";
import type { Task, TaskFormValues } from "../types";

const STORAGE_KEY = "construction_tasks";

let tasks: Task[] = storage.get<Task[]>(
  STORAGE_KEY,
  [],
);

export const taskService = {
  async getAll(): Promise<Task[]> {
    return [...tasks];
  },

  async getById(id: string): Promise<Task | undefined> {
    return tasks.find((item) => item.id === id);
  },

  async create(data: TaskFormValues): Promise<Task> {
    const nextTask: Task = {
      id: `task-${Date.now()}`,
      name: data.name,
    };

    tasks = [nextTask, ...tasks];
    storage.set(STORAGE_KEY, tasks);
    return nextTask;
  },

  async update(id: string, data: TaskFormValues): Promise<Task | undefined> {
    tasks = tasks.map((item) => {
      if (item.id !== id) {
        return item;
      }

      return {
        ...item,
        name: data.name,
      };
    });

    storage.set(STORAGE_KEY, tasks);
    return tasks.find((item) => item.id === id);
  },

  async delete(id: string): Promise<void> {
    tasks = tasks.filter((item) => item.id !== id);
    storage.set(STORAGE_KEY, tasks);
  },
};

