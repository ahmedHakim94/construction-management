import { storage } from "@/core/storage/localStorage";
import type { Project, ProjectFormValues } from "../types";

const STORAGE_KEY = "construction_projects";

let projects: Project[] = storage.get<Project[]>(
  STORAGE_KEY,
  [],
);

export const projectService = {
  async getAll(): Promise<Project[]> {
    return [...projects];
  },

  async getById(id: string): Promise<Project | undefined> {
    return projects.find((item) => item.id === id);
  },

  async create(data: ProjectFormValues): Promise<Project> {
    const nextProject: Project = {
      id: `project-${Date.now()}`,
      name: data.name,
      address: data.address,
    };

    projects = [nextProject, ...projects];
    storage.set(STORAGE_KEY, projects);
    return nextProject;
  },

  async update(id: string, data: ProjectFormValues): Promise<Project | undefined> {
    projects = projects.map((item) => {
      if (item.id !== id) {
        return item;
      }

      return {
        ...item,
        name: data.name,
        address: data.address,
      };
    });

    storage.set(STORAGE_KEY, projects);
    return projects.find((item) => item.id === id);
  },

  async delete(id: string): Promise<void> {
    projects = projects.filter((item) => item.id !== id);
    storage.set(STORAGE_KEY, projects);
  },
};

