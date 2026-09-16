import { useState } from "react";
import { HiOutlineMapPin, HiOutlinePhone, HiOutlineEnvelope } from "react-icons/hi2";
import { useToast } from "../../context/ToastContext";

export default function Contact() {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Thanks! Our team will call you back shortly.");
    setForm({ name: "", phone: "", message: "" });
  };

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-wheat-500">Get in touch</span>
          <h1 className="mt-2 text-3xl sm:text-4xl">We're here to help</h1>
          <p className="mt-4 max-w-md text-base text-ink/65">
            Questions about which feed suits your herd, bulk orders, or an existing delivery?
            Reach out and our team will get back to you.
          </p>

          <div className="mt-8 space-y-4 text-sm text-ink/70">
            <div className="flex items-center gap-3">
              <HiOutlineMapPin className="h-5 w-5 text-dairy-500" />
              Suwasthika Village Road, Tiruvannamalai District, Tamil Nadu
            </div>
            <div className="flex items-center gap-3">
              <HiOutlinePhone className="h-5 w-5 text-dairy-500" />
              +91 98765 43210
            </div>
            <div className="flex items-center gap-3">
              <HiOutlineEnvelope className="h-5 w-5 text-dairy-500" />
              hello@Suwasthikadairy.in
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          <div>
            <label className="label">Name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input required className="input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea required rows={4} className="input" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary w-full">Send Message</button>
        </form>
      </div>
    </div>
  );
}
