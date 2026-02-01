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
    <div className="space-y-4">
      {/* Add Note Button/Form */}
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
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
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

      {/* Notes List */}
      {notes.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">
          No notes yet
        </p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-slate-50 rounded-lg border border-slate-100"
            >
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {note.content}
              </p>
              <p className="text-xs text-slate-400 mt-2">
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
