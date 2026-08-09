'use client';

import { useState } from 'react';
import { Send, Paperclip, Smile, MoreHorizontal, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { formatRelative } from '@/lib/format';
import type { Comment } from '@/lib/types';

interface TaskCommentsProps {
  comments: Comment[];
  currentUserId?: string;
  onAdd: (body: string, parentId?: string) => void;
  onDelete: (id: string) => void;
  pending?: boolean;
}

/**
 * DEVIATION: this section is labelled "Subtasks" in the Figma file, directly
 * below the actual subtasks table. Relabelled to "Comments" — see README.
 */
export function TaskComments({
  comments, currentUserId, onAdd, onDelete, pending,
}: TaskCommentsProps) {
  const [replyTo, setReplyTo] = useState<string | null>(null);

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium">Comments</h2>

      {comments.map((comment) => (
        <article key={comment.id} className="rounded-lg border bg-card">
          <div className="flex items-start gap-2 p-3">
            <Avatar user={comment.author} />

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm">
                <span className="font-medium">
                  {comment.author.fullName ?? comment.author.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRelative(comment.createdAt)}
                </span>
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm">{comment.body}</p>

              {comment.replies?.map((reply) => (
                <div key={reply.id} className="mt-3 flex items-start gap-2 border-l pl-3">
                  <Avatar user={reply.author} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        {reply.author.fullName ?? reply.author.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelative(reply.createdAt)}
                      </span>
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap break-words text-sm">{reply.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <Smile className="size-4 text-muted-foreground" />
              {comment.authorId === currentUserId && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="Comment actions"
                    className="rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() => onDelete(comment.id)}
                      className="text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="border-t p-2">
            <CommentComposer
              placeholder="Leave a reply..."
              disabled={pending}
              onSubmit={(body) => {
                onAdd(body, comment.id);
                setReplyTo(null);
              }}
              autoFocus={replyTo === comment.id}
            />
          </div>
        </article>
      ))}

      <div className="rounded-lg border bg-card p-2">
        <CommentComposer
          placeholder="Add a comment..."
          disabled={pending}
          onSubmit={(body) => onAdd(body)}
        />
      </div>
    </section>
  );
}

function CommentComposer({
  placeholder, onSubmit, disabled, autoFocus,
}: {
  placeholder: string;
  onSubmit: (body: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState('');

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue('');
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
        // Enter sends, Shift+Enter is left free for a future multiline field.
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        disabled={disabled}
        className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
      />
      <Paperclip className="size-4 shrink-0 text-muted-foreground" />
      <button
        type="button"
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Send comment"
        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
      >
        <Send className="size-4" />
      </button>
    </div>
  );
}
