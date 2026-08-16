import { memo } from 'react'
import { Badge } from '@/components/ui/badge'

function getStatusInfo(status: number) {
  switch (status) {
    case 0:
      return { text: 'Pending', className: 'bg-[#f8f4f4] text-[#444141]', dot: '#7d7979' }
    case 1:
      return { text: 'In Progress', className: 'bg-[#fff2ef] text-[#7c1405]', dot: '#ae1800' }
    case 2:
      return { text: 'Completed', className: 'bg-success text-success-foreground', dot: '#2f7d47' }
    default:
      return { text: 'Unknown', className: 'bg-muted text-muted-foreground', dot: '#9b9797' }
  }
}

function OrderStatusBadge({ status }: { status: number }) {
  const info = getStatusInfo(status)
  return (
    <Badge className={info.className}>
      <span className="size-1.5 rounded-full" style={{ backgroundColor: info.dot }} />
      {info.text}
    </Badge>
  )
}

export default memo(OrderStatusBadge)
