import { tasksMockData } from "../mock/tasks";
import type { Task, TaskFormValues } from "../types";

let tasks: Task[] = [...tasksMockData];

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
      nameAr: data.nameAr,
      nameEn: data.nameEn,
    };

    tasks = [nextTask, ...tasks];
    return nextTask;
  },

  async update(id: string, data: TaskFormValues): Promise<Task | undefined> {
    tasks = tasks.map((item) => {
      if (item.id !== id) {
        return item;
      }

      return {
        ...item,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
      };
    });

    return tasks.find((item) => item.id === id);
  },

  async delete(id: string): Promise<void> {
    tasks = tasks.filter((item) => item.id !== id);
  },
};

export const getAll = taskService.getAll;
export const create = taskService.create;
export const update = taskService.update;
export const deleteTask = taskService.delete;
