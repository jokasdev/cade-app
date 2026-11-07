import {
  Box,
  Briefcase,
  Calculator,
  CreditCard,
  Ellipsis,
  House,
  Landmark,
  Laptop,
  Layers,
  Package,
  Scissors,
  Shirt,
  Store,
  Truck,
  Users,
  UtensilsCrossed,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { CostKey, Segment } from '../../types/finance';

const COST_ICONS: Record<CostKey, LucideIcon> = {
  goods: Package,
  packaging: Box,
  delivery: Truck,
  paymentFees: CreditCard,
  salesTaxes: Landmark,
  otherVariable: Ellipsis,
  rent: House,
  utilities: Zap,
  internetPhone: Wifi,
  payroll: Users,
  software: Laptop,
  accounting: Calculator,
  otherFixed: Layers,
};

const SEGMENT_ICONS: Record<Segment, LucideIcon> = {
  alimentacao: UtensilsCrossed,
  comercio: Store,
  beleza: Scissors,
  servicos: Briefcase,
  vestuario: Shirt,
  outros: Ellipsis,
};

export function CategoryIcon({ category, size = 18 }: { category: CostKey; size?: number }) {
  const Icon = COST_ICONS[category];
  return <Icon width={size} height={size} aria-hidden="true" />;
}

export function SegmentIcon({ segment, size = 22 }: { segment: Segment; size?: number }) {
  const Icon = SEGMENT_ICONS[segment];
  return <Icon width={size} height={size} aria-hidden="true" />;
}
