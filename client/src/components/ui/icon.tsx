import React from "react";
import { cn } from "@/lib/utils";

interface IconProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  className?: string;
}

export function Icon({ name, className, ...props }: IconProps) {
  const getIconClass = () => {
    // Font Awesome icons mapping
    switch (name) {
      case "home":
        return "fas fa-home";
      case "plus-circle":
        return "fas fa-plus-circle";
      case "list-alt":
        return "fas fa-list-alt";
      case "credit-card":
        return "fas fa-credit-card";
      case "dollar-sign":
        return "fas fa-dollar-sign";
      case "user":
        return "fas fa-user";
      case "sign-out-alt":
        return "fas fa-sign-out-alt";
      case "bars":
        return "fas fa-bars";
      case "times":
        return "fas fa-times";
      case "check-circle":
        return "fas fa-check-circle";
      case "info-circle":
        return "fas fa-info-circle";
      case "trash":
        return "fas fa-trash";
      case "plus":
        return "fas fa-plus";
      case "paypal":
        return "fab fa-paypal";
      case "list":
        return "fas fa-list";
      case "calendar":
        return "fas fa-calendar";
      case "clipboard-list":
        return "fas fa-clipboard-list";
      default:
        return `fas fa-${name}`;
    }
  };

  return (
    <i className={cn(getIconClass(), className)} {...props} />
  );
}
