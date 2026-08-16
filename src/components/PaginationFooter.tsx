import { memo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationFooterProps {
  page: number
  totalPages: number
  totalCount: number
  itemLabel: string
  onPrev: () => void
  onNext: () => void
}

function PaginationFooter({
  page,
  totalPages,
  totalCount,
  itemLabel,
  onPrev,
  onNext,
}: PaginationFooterProps) {
  return (
    <div className="flex items-center justify-between border-t border-border px-3 py-2">
      <span className="text-xs text-muted-foreground">
        Page {page} of {totalPages} · {totalCount} {itemLabel}
      </span>
      <div className="flex gap-1">
        <Button type="button" size="icon-sm" variant="outline" disabled={page <= 1} onClick={onPrev}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          disabled={page >= totalPages}
          onClick={onNext}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export default memo(PaginationFooter)
