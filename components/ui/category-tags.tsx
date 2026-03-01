export interface CategoryTagsProps {
  tags: string[]
}

export function CategoryTags({ tags }: CategoryTagsProps) {
  return (
    <div className="flex items-center gap-2">
      {tags.map((tag, i) => (
        <span key={tag}>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-faint)]">
            {tag}
          </span>
          {i < tags.length - 1 && (
            <span className="mx-2 text-[var(--text-faint)]">·</span>
          )}
        </span>
      ))}
    </div>
  )
}
