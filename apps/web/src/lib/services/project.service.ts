/**
 * Project Service Layer
 * Handles all project-related database operations
 */

import { createClient } from "../supabase/server";
import type { Project, ProjectType, ProjectStatus } from "@timebeat/types";

// === INPUT TYPES ===

export interface CreateProjectInput {
  name: string;
  description?: string | null;
  type?: ProjectType;
  color?: string;
  icon?: string | null;
  stack?: string[];
  platform?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  type?: ProjectType;
  status?: ProjectStatus;
  color?: string;
  icon?: string | null;
  stack?: string[];
  platform?: string[];
}

export interface ProjectFilters {
  status?: ProjectStatus;
  type?: ProjectType;
  search?: string;
}

export interface ProjectStats {
  totalTimeSeconds: number;
  sessionCount: number;
  taskCount: number;
  completedTasks: number;
  lastSessionAt: Date | null;
}

// === SERVICE ===

export const projectService = {
  /**
   * Create a new project
   */
  async create(data: CreateProjectInput): Promise<Project> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const projectData = {
      id: crypto.randomUUID(),
      user_id: user.id,
      name: data.name,
      description: data.description ?? null,
      type: data.type ?? "PERSONAL",
      status: "ACTIVE",
      color: data.color ?? "#4ECDC4",
      icon: data.icon ?? null,
      stack: data.stack ?? [],
      platform: data.platform ?? [],
      total_time_seconds: 0,
      session_count: 0,
      task_count: 0,
      completed_tasks: 0,
    };

    const { data: project, error } = await supabase
      .from("projects")
      .insert(projectData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return mapProjectFromDb(project);
  },

  /**
   * Update an existing project
   */
  async update(id: string, data: UpdateProjectInput): Promise<Project> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.stack !== undefined) updateData.stack = data.stack;
    if (data.platform !== undefined) updateData.platform = data.platform;

    const { data: project, error } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }

    return mapProjectFromDb(project);
  },

  /**
   * Delete a project
   */
  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  },

  /**
   * Archive a project (soft delete)
   */
  async archive(id: string): Promise<Project> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: project, error } = await supabase
      .from("projects")
      .update({
        status: "ARCHIVED",
        archived_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to archive project: ${error.message}`);
    }

    return mapProjectFromDb(project);
  },

  /**
   * Restore an archived project
   */
  async restore(id: string): Promise<Project> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: project, error } = await supabase
      .from("projects")
      .update({
        status: "ACTIVE",
        archived_at: null,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to restore project: ${error.message}`);
    }

    return mapProjectFromDb(project);
  },

  /**
   * Get a single project by ID
   */
  async getById(id: string): Promise<Project | null> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: project, error } = await supabase
      .from("projects")
      .select()
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to get project: ${error.message}`);
    }

    return mapProjectFromDb(project);
  },

  /**
   * Get all projects for the current user
   */
  async getAll(filters?: ProjectFilters): Promise<Project[]> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    let query = supabase
      .from("projects")
      .select()
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.type) {
      query = query.eq("type", filters.type);
    }

    if (filters?.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    const { data: projects, error } = await query;

    if (error) {
      throw new Error(`Failed to get projects: ${error.message}`);
    }

    return projects.map(mapProjectFromDb);
  },

  /**
   * Get active projects (non-archived)
   */
  async getActive(): Promise<Project[]> {
    return this.getAll({ status: "ACTIVE" as ProjectStatus });
  },

  /**
   * Get project stats
   */
  async getStats(id: string): Promise<ProjectStats> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: project, error } = await supabase
      .from("projects")
      .select("total_time_seconds, session_count, task_count, completed_tasks, last_session_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      throw new Error(`Failed to get project stats: ${error.message}`);
    }

    return {
      totalTimeSeconds: project.total_time_seconds,
      sessionCount: project.session_count,
      taskCount: project.task_count,
      completedTasks: project.completed_tasks,
      lastSessionAt: project.last_session_at ? new Date(project.last_session_at) : null,
    };
  },
};

// === HELPERS ===

interface DbProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  color: string;
  icon: string | null;
  stack: string[];
  platform: string[];
  total_time_seconds: number;
  session_count: number;
  task_count: number;
  completed_tasks: number;
  created_at: string;
  updated_at: string;
  last_session_at: string | null;
  archived_at: string | null;
}

function mapProjectFromDb(dbProject: DbProject): Project {
  return {
    id: dbProject.id,
    userId: dbProject.user_id,
    name: dbProject.name,
    description: dbProject.description,
    type: dbProject.type as ProjectType,
    status: dbProject.status as ProjectStatus,
    color: dbProject.color,
    icon: dbProject.icon,
    stack: dbProject.stack,
    platform: dbProject.platform,
    totalTimeSeconds: dbProject.total_time_seconds,
    sessionCount: dbProject.session_count,
    lastSessionAt: dbProject.last_session_at
      ? new Date(dbProject.last_session_at)
      : null,
    createdAt: new Date(dbProject.created_at),
    updatedAt: new Date(dbProject.updated_at),
  };
}
