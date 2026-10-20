import Link from "next/link"
import { getTopics } from "@/lib/actions/placeholders"
import { StatusBadge } from "@/components/ui/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function PlaceholdersPage() {
  const { data: topics, error } = await getTopics()

  if (error || !topics) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Placeholders</h1>
        <p className="text-sm text-destructive">
          {error ?? "Failed to load topics."}
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Placeholders</h1>
      <div className="border-warning/40 bg-warning-muted mb-6 rounded-md border px-4 py-3 text-sm text-foreground">
        <strong>Dormant.</strong> Per-occasion placeholders are no longer used
        by the New Favpoll form — field prompts are now generated from the
        favpoll register. This data will be repurposed as exemplar favpoll
        content in a future release.
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Select a topic to view its stored placeholder text.
      </p>
      <div className="max-w-2xl rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Topic</TableHead>
              <TableHead>Occasions</TableHead>
              <TableHead className="text-right">List</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.map((topic) => {
              const count = Object.keys(topic.placeholders ?? {}).length
              return (
                <TableRow key={topic.id} className="relative">
                  <TableCell className="font-medium text-foreground">
                    <Link
                      href={`/placeholders/${topic.id}`}
                      className="after:absolute after:inset-0"
                    >
                      {topic.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {count} {count === 1 ? "occasion" : "occasions"}
                  </TableCell>
                  <TableCell className="text-right">
                    <StatusBadge tone={topic.is_finite ? "info" : "neutral"}>
                      {topic.is_finite ? "Finite" : "Infinite"}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
