import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  rightContent?: ReactNode;
}

export default function PageHeader({ title, description, rightContent }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-secondary">{title}</h1>
        {description && <p className="text-gray-600">{description}</p>}
      </div>
      {rightContent && <div className="mt-4 md:mt-0">{rightContent}</div>}
    </div>
  );
}
