"use client";

import { useEffect, useState, useTransition } from "react";
import { useTimerStore } from "@timebeat/core";
import { useTimerTick } from "@timebeat/hooks";
import { TimerState, SessionType, type Project } from "@timebeat/types";
import {
  TimerDisplay,
  TimerControls,
  ProjectSelector,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@timebeat/ui";
import { saveSession } from "@/app/actions/sessions";

interface TimerViewProps {
  projects: Project[];
}

export function TimerView({ projects }: TimerViewProps) {
  const state = useTimerStore((s) => s.state);
  const elapsed = useTimerStore((s) => s.elapsed);
  const planned = useTimerStore((s) => s.planned);
  const mode = useTimerStore((s) => s.mode);
  const currentProject = useTimerStore((s) => s.currentProject);

  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const stopTimer = useTimerStore((s) => s.stop);
  const startBreak = useTimerStore((s) => s.startBreak);
  const endBreak = useTimerStore((s) => s.endBreak);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    currentProject?.id ?? null,
  );
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // Start the tick interval when running
  useTimerTick();

  // Track session start time
  useEffect(() => {
    if (state === TimerState.RUNNING && !sessionStartTime) {
      setSessionStartTime(new Date());
    }
  }, [state, sessionStartTime]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleProjectSelect = (project: Project | null) => {
    setSelectedProjectId(project?.id ?? null);
  };

  const handleStart = () => {
    setSaveError(null);
    setSessionStartTime(new Date());
    start(selectedProject ?? undefined);
  };

  const handleStop = () => {
    const session = stopTimer();

    if (session && selectedProjectId && sessionStartTime) {
      startTransition(async () => {
        const result = await saveSession({
          projectId: selectedProjectId,
          type: mode === "TIMED" ? SessionType.TIMED : SessionType.FREE,
          plannedMinutes: planned ? Math.ceil(planned / 60) : null,
          startedAt: sessionStartTime.toISOString(),
          endedAt: new Date().toISOString(),
          totalSeconds: elapsed,
          pausedSeconds: 0,
        });

        if (!result.success) {
          setSaveError(result.error ?? "Failed to save session");
        }
      });
    }

    setSessionStartTime(null);
  };

  const handlePause = () => pause();
  const handleResume = () => resume();
  const handleStartBreak = () => startBreak();
  const handleEndBreak = () => endBreak();

  return (
    <div className="space-y-6">
      {/* Timer display */}
      <Card>
        <CardContent className="py-8">
          <TimerDisplay
            elapsed={elapsed}
            planned={planned}
            state={state}
            project={selectedProject ?? null}
            mode={mode}
            variant="full"
          />
        </CardContent>
      </Card>

      {/* Controls */}
      <TimerControls
        state={state}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
        onStartBreak={handleStartBreak}
        onEndBreak={handleEndBreak}
        disabled={isPending}
        className="justify-center"
      />

      {/* Error message */}
      {saveError && (
        <div className="rounded-lg border border-[var(--color-danger-200)] bg-[var(--color-danger-50)] p-3 text-center">
          <p className="text-sm text-[var(--color-danger-700)]">{saveError}</p>
        </div>
      )}

      {/* Project selector */}
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length > 0 ? (
            <ProjectSelector
              projects={projects}
              selectedId={selectedProjectId}
              onSelect={handleProjectSelect}
              disabled={state !== TimerState.IDLE}
              placeholder="Select a project (optional)"
            />
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--color-border)] p-4 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">
                Create a project to categorize your sessions
              </p>
              <a
                href="/projects"
                className="mt-2 inline-block text-sm font-medium text-[var(--color-primary-500)] hover:underline"
              >
                Go to Projects →
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session info when running */}
      {state !== TimerState.IDLE && sessionStartTime && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Started at</span>
              <span className="font-medium">
                {sessionStartTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {selectedProject && (
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Project</span>
                <span className="font-medium">{selectedProject.name}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
