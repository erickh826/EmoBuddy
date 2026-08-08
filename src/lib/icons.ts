import {
  Smile,
  Moon,
  Star,
  Heart,
  Pencil,
  Sparkles,
  Wind,
  Ear,
  MessageCircle,
  Utensils,
  HandHeart,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Smile,
  Moon,
  Star,
  Heart,
  Pencil,
  Sparkles,
  Wind,
  Ear,
  MessageCircle,
  Utensils,
  HandHeart,
};

export function getLucideIcon(name: string): LucideIcon | null {
  return iconMap[name] || null;
}
