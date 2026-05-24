import { ProductWithStock } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StockBadge from './StockBadge'

type Props = {
  product: ProductWithStock
  onReserve: (stockId: string) => void
  loading: string | null
}

export default function ProductCard({ product, onReserve, loading }: Props) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
        <p className="text-2xl font-bold">₹{product.price.toLocaleString('en-IN')}</p>
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        {product.stock.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium">{s.warehouse.name}</p>
              <p className="text-xs text-muted-foreground">{s.warehouse.city}</p>
              <div className="mt-1">
                <StockBadge available={s.available} />
              </div>
            </div>
            <Button
              size="sm"
              disabled={s.available === 0 || loading === s.id}
              onClick={() => onReserve(s.id)}
            >
              {loading === s.id ? 'Reserving...' : s.available === 0 ? 'Sold Out' : 'Reserve'}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
