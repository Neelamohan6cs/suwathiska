import { Link } from "react-router-dom";
import { HiOutlineMapPin, HiOutlinePhone, HiOutlineEnvelope } from "react-icons/hi2";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-dairy-100 bg-dairy-900 text-dairy-100">
      <div className="container-page grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm text-dairy-200/80">
            Balanced, farm-tested nutrition for healthier cattle, calves and livestock —
            milled fresh and delivered to your doorstep.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold text-white">Shop</h4>
          <ul className="space-y-2.5 text-sm text-dairy-200/80">
            <li><Link to="/products" className="hover:text-white">All Products</Link></li>
            <li><Link to="/products?category=cattle_feed" className="hover:text-white">Cattle Feed</Link></li>
            <li><Link to="/products?category=calf_feed" className="hover:text-white">Calf Feed</Link></li>
            <li><Link to="/products?category=mineral_mixture" className="hover:text-white">Mineral Mixture</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold text-white">Account</h4>
          <ul className="space-y-2.5 text-sm text-dairy-200/80">
            <li><Link to="/my-orders" className="hover:text-white">Track Order</Link></li>
            <li><Link to="/profile" className="hover:text-white">My Profile</Link></li>
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold text-white">Get in touch</h4>
          <ul className="space-y-3 text-sm text-dairy-200/80">
            <li className="flex items-start gap-2">
              <HiOutlineMapPin className="mt-0.5 h-4 w-4 shrink-0" /> Suwasthika Village Road, Tiruvannamalai District, Tamil Nadu
            </li>
            <li className="flex items-center gap-2">
              <HiOutlinePhone className="h-4 w-4 shrink-0" /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <HiOutlineEnvelope className="h-4 w-4 shrink-0" /> hello@Suwasthikadairy.in
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-dairy-200/60">
        © {new Date().getFullYear()} Suwasthika Dairy Feeds. All rights reserved.
      </div>
    </footer>
  );
}
