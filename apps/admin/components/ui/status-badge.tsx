import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone =
  | "success"
  | "warning"
  | "destructive"
  | "neutral"
  | "info";

const TONE_CLASSES: Record<StatusTone, string> = {
  success: "bg-success/10 text-success dark:bg-success/20",
  warning: "bg-warning-muted text-warning dark:text-warning",
  destructive: "bg-destructive-muted text-destructive-strong",
  neutral: "bg-muted text-muted-foreground",
  info: "bg-secondary text-secondary-foreground",
};

export function StatusBadge({
  tone,
  className,
  ...props
}: React.ComponentProps<typeof Badge> & { tone: StatusTone }) {
  return <Badge className={cn(TONE_CLASSES[tone], className)} {...props} />;
}
