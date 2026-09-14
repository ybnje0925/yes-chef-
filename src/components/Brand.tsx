import { UtensilsCrossed } from "lucide-react";
export default function Brand() {
  return (
    <span className="brand">
      <UtensilsCrossed size={21} strokeWidth={2.5} /> YES CHEF
      <span className="brand-dot">®</span>
    </span>
  );
}
