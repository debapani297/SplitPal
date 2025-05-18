import { Suborder } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/sessionStorage";
import { Icon } from "@/components/ui/icon";

interface SubordersListProps {
  suborders: Suborder[];
  onPayClick: (suborder: Suborder) => void;
}

export default function SubordersList({ suborders, onPayClick }: SubordersListProps) {
  const currentUser = getCurrentUser();

  return (
    <div className="divide-y divide-gray-200">
      {suborders.map((suborder) => {
        const isCurrentUser = suborder.payee.email === currentUser;
        const isPaid = suborder.status === "APPROVED";
        const isPending = !isPaid;
        const showPayButton = isCurrentUser && isPending;

        return (
          <div key={suborder.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-3 sm:mb-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-secondary">
                  <Icon name="user" />
                </div>
                <div>
                  <p className="font-medium text-secondary">{suborder.payee.name}</p>
                  <p className="text-sm text-gray-500">{suborder.payee.email}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between sm:w-auto w-full">
              <div className="mr-6">
                <p className="font-medium text-secondary">{formatCurrency(suborder.amount)}</p>
                <div className="flex items-center text-sm">
  <span
    className={`status-indicator ${
      suborder.status === "APPROVED"
        ? "status-indicator-completed"
        : "status-indicator-pending"
    }`}
  ></span>
  <span
    className={
      suborder.status === "APPROVED" ? "text-success" : "text-warning"
    }
  >
    {suborder.status === "APPROVED"
      ? "Paid"
      : suborder.status === "PAYER_ACTION_REQUIRED"
      ? "Action Required"
      : "Pending"}
  </span>
</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
