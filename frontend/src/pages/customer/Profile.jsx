import { useRef, useState } from "react";
import { HiOutlineCamera } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { updateProfile, changePassword, uploadProfileImage } from "../../api/userApi";
import { fileUrl } from "../../api/axios";

export default function Profile() {
  const { user, updateStoredUser } = useAuth();
  const toast = useToast();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
    landmark: user?.address?.landmark || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateProfile({
        name: form.name,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          landmark: form.landmark,
        },
      });
      updateStoredUser(res.data.user);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.message || "Could not update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(passwordForm);
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.message || "Could not change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await uploadProfileImage(file);
      updateStoredUser({ ...user, profileImage: res.data.profileImage });
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err.message || "Could not upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <h1 className="mb-6 text-2xl sm:text-3xl">My Profile</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <div className="card flex flex-col items-center p-6">
          <div className="relative">
            {user?.profileImage ? (
              <img src={fileUrl(user.profileImage)} alt={user.name} className="h-28 w-28 rounded-full object-cover" />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-dairy-100 font-display text-3xl text-dairy-700">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingImage}
              className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-dairy-600 text-white shadow-soft hover:bg-dairy-700"
              aria-label="Change photo"
            >
              <HiOutlineCamera className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>
          <p className="mt-4 font-display text-lg text-dairy-900">{user?.name}</p>
          <p className="text-sm text-ink/55">{user?.email}</p>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleProfileSubmit} className="card space-y-4 p-5">
            <h2 className="font-display text-base text-dairy-900">Edit Profile</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Name</label>
                <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Street address</label>
              <input className="input" value={form.street} onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="label">City / Village</label>
                <input className="input" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
              </div>
              <div>
                <label className="label">State</label>
                <input className="input" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
              </div>
              <div>
                <label className="label">Pincode</label>
                <input className="input" value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} />
              </div>
            </div>
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? "Saving…" : "Save Changes"}
            </button>
          </form>

          <form onSubmit={handlePasswordSubmit} className="card space-y-4 p-5">
            <h2 className="font-display text-base text-dairy-900">Change Password</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Current password</label>
                <input
                  type="password"
                  className="input"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">New password</label>
                <input
                  type="password"
                  className="input"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                />
              </div>
            </div>
            <button type="submit" disabled={savingPassword} className="btn-primary">
              {savingPassword ? "Updating…" : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
