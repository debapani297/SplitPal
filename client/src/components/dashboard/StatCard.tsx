import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  description?: string;
  iconColor?: string;
}

export default function StatCard({ title, value, icon, description, iconColor = "primary" }: StatCardProps) {
  const iconColorClass = `text-${iconColor}`;
  const bgColorClass = `bg-${iconColor}/10`;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-secondary mt-2">{value}</p>
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
          <div className={`${bgColorClass} ${iconColorClass} p-3 rounded-full`}>
            <Icon name={icon} className="text-xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
