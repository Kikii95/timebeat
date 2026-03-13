/**
 * @package @timebeat/ui
 * Shared UI components for Timebeat
 */

// Re-export everything from components
export * from "./components";

// Direct exports for common use cases
export { Button, type ButtonProps } from "./primitives/Button";
export {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  type CardProps,
} from "./primitives/Card";
export { Badge, type BadgeProps } from "./primitives/Badge";
export { Input, type InputProps } from "./primitives/Input";
export { Label, type LabelProps } from "./primitives/Label";
export { Spinner, type SpinnerProps } from "./primitives/Spinner";
export { Skeleton, type SkeletonProps } from "./primitives/Skeleton";
export {
  Dialog,
  DialogClose,
  DialogFooter,
  type DialogProps,
} from "./primitives/Dialog";

export {
  TimerDisplay,
  type TimerDisplayProps,
} from "./composite/Timer/TimerDisplay";
export {
  TimerControls,
  type TimerControlsProps,
} from "./composite/Timer/TimerControls";
export {
  TimerProgress,
  type TimerProgressProps,
} from "./composite/Timer/TimerProgress";

export {
  StatsCard,
  type StatsCardProps,
} from "./composite/Dashboard/StatsCard";

export {
  ProjectCard,
  type ProjectCardProps,
} from "./composite/Project/ProjectCard";
export {
  ProjectSelector,
  type ProjectSelectorProps,
} from "./composite/Project/ProjectSelector";
export {
  ProjectForm,
  type ProjectFormProps,
} from "./composite/Project/ProjectForm";
export {
  ProjectList,
  type ProjectListProps,
} from "./composite/Project/ProjectList";

// Utils
export { cn } from "./utils/cn";
