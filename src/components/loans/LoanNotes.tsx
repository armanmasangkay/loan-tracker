"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Textarea, Button } from "@/components/ui";
import { addLoanNote } from "@/lib/actions/loans";

interface Note {
  id: number;
  content: string;
  createdAt: Date;
  createdBy: {
    id: number;
    displayName: string;
  };
}

interface LoanNotesProps {
  loanId: number;
  notes: Note[];
}

export function LoanNotes({ loanId, notes }: LoanNotesProps) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setError(null);
    startTransition(async () => {
      const result = await addLoanNote(loanId, content);
      if (result?.error) {
        setError(result.error);
      } else {
        setContent("");
        setShowForm(false);
      }
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Add Note Button/Form */}
      <div>
        {!showForm ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Note
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="p-3 bg-[var(--status-danger)] border border-red-200 rounded-lg text-[var(--status-danger-text)] text-sm">
                {error}
              </div>
            )}

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your note..."
              disabled={isPending}
              className="min-h-[80px]"
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setContent("");
                  setError(null);
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isPending}
                loadingText="Saving..."
                disabled={!content.trim()}
              >
                Save Note
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
          No notes yet
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-5 bg-[var(--muted)] rounded-lg border border-[var(--border)]"
            >
              <p className="text-sm text-[var(--secondary-foreground)] whitespace-pre-wrap">
                {note.content}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-4">
                {note.createdBy.displayName} •{" "}
                {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
