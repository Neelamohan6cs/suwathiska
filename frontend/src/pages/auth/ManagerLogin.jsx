import PortalLoginForm from "./PortalLoginForm";

export default function ManagerLogin() {
  return (
    <PortalLoginForm
      expectedRole="manager"
      title="Manager Portal"
      subtitle="Sign in to manage products and inventory"
      redirectPath="/manager"
    />
  );
}
