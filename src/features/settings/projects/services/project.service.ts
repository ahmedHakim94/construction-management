import { projectsMockData } from "../mock/projects";
import type { Project, ProjectFormValues } from "../types";

let projects: Project[] = [...projectsMockData];

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

    return projects.find((item) => item.id === id);
  },

  async delete(id: string): Promise<void> {
    projects = projects.filter((item) => item.id !== id);
  },
};
