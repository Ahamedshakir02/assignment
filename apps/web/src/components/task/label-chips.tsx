import { Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Label } from '@/lib/types';

export function LabelChips({ labels, max }: { labels: Label[]; max?: number }) {
  if (labels.length === 0) return null;

  const shown = max ? labels.slice(0, max) : labels;
  const overflow = labels.length - shown.length;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {shown.map((label) => (
        <Badge key={label.id}>
          <Tag className="size-3" />
          {label.name}
        </Badge>
      ))}
      {overflow > 0 && <Badge variant="default">+{overflow}</Badge>}
    </div>
  );
}
