import PortalLoginForm from "./PortalLoginForm";

export default function AdminLogin() {
  return (
    <PortalLoginForm
      expectedRole="admin"
      title="Admin Portal"
      subtitle="Sign in to manage the Suwasthika Dairy storefront"
      redirectPath="/admin"
    />
  );
}
