import PortalLoginForm from "./PortalLoginForm";

export default function DeliveryLogin() {
  return (
    <PortalLoginForm
      expectedRole="delivery"
      title="Delivery Portal"
      subtitle="Sign in to view your assigned deliveries"
      redirectPath="/delivery"
    />
  );
}
