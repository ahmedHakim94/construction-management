export interface Project {
  id: string;
  name: string;
  address: string;
}

export interface ProjectFormValues {
  name: string;
  address: string;
}

export type ProjectsResponse = {
  success: boolean;
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ProjectResponse = {
  success: boolean;
  message?: string;
  data: Project;
};

export type DeleteProjectResponse = {
  success: boolean;
  message: string;
};

export type ProjectsResult = {
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};