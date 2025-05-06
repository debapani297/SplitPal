import PageHeader from "@/components/layout/PageHeader";
import CreateOrderForm from "@/components/forms/CreateOrderForm";

export default function CreateOrder() {
  return (
    <>
      <PageHeader 
        title="Create Order" 
        description="Split rent payments with your roommates"
      />
      <CreateOrderForm />
    </>
  );
}
