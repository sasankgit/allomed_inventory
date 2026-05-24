import { Badge } from '@/components/ui/badge'

export default function StockBadge({ available }: { available: number }) {
  if (available === 0)
    return <Badge variant="destructive">Out of stock</Badge>
  if (available <= 3)
    return <Badge variant="outline" className="text-orange-500 border-orange-500">Only {available} left</Badge>
  return <Badge variant="secondary">{available} available</Badge>
}
