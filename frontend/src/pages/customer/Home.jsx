import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  GiCow,
  GiWheat,
  GiChemicalDrop,
  GiMedicinePills,
  GiFarmTractor,
} from "react-icons/gi";
import {
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiChevronLeft,
  HiChevronRight,
  HiArrowRight,
} from "react-icons/hi2";
import { FaStar } from "react-icons/fa";
import { getProducts } from "../../api/productApi";
import { useLanguage } from "../../context/LanguageContext";
import ProductCard from "../../components/customer/ProductCard";
import { ProductCardSkeleton } from "../../components/common/Skeleton";
import { CATEGORY_LABELS } from "../../utils/constants";

const categoryIcons = {
  cattle_feed: GiCow,
  calf_feed: GiFarmTractor,
  mineral_mixture: GiChemicalDrop,
  silage: GiWheat,
  fodder: GiWheat,
  feed_supplement: GiMedicinePills,
};

const trustPoints = [
  {
    icon: HiOutlineShieldCheck,
    title: "Lab-tested nutrition",
    text: "Every batch is checked for protein, fibre and mineral balance before it leaves the mill.",
  },
  {
    icon: HiOutlineTruck,
    title: "Delivered to your farm",
    text: "Free delivery on orders above ₹500, straight to your cattle shed.",
  },
  {
    icon: HiOutlineSparkles,
    title: "Trusted by local farmers",
    text: "Formulated with agricultural experts for real herds, not just lab cattle.",
  },
];

const journeySlides = [
  {
    step: "Step 1 of 4 - Mill Fresh",
    badge: "Direct Purchase",
    dotColor: "bg-emerald-400",
    title: "Step 1: Direct from Mill",
    tag: "Fresh Grains",
    tagClass: "bg-dairy-100 text-dairy-800",
    description:
      "Farmer purchasing fresh Cholam, Kambu and Kadalai Punnakku feed directly from counter.",
    flow: "Customer to Company to Quality Feed",
    flowNote: "100% Native",
    flowNoteClass: "text-wheat-600",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAuP4dd5pptLLwT99aBAy2G1YnC5MR7gdaeZiHWCunp-4r9FT1tIDXrGDxiizDiNn9lFLOYKbnJrlD8gYW-BlrAK9nLJ8PUVxsiiyHLLzrviwAjQvjZUtSUn-gajJiosFsThrrcRvU0TVBBNnsY_yO4u4b4LXpbgeRXbZwhEgagKPsDKDlk9aore0e1U72NgOY2cCLnRsC_SDxT27Ldv17-XXZsG20I6mXBYBxx5pN1EEEmT6JVwUo2Pw",
    alt: "Farmer purchasing fresh Cholam, Kambu and Kadalai Punnakku feed direct at counter",
  },
  {
    step: "Step 2 of 4 - Digital Order",
    badge: "Mobile App and Web",
    dotColor: "bg-wheat-400",
    title: "Step 2: Order via Mobile",
    tag: "1-Tap Booking",
    tagClass: "bg-wheat-100 text-wheat-700",
    description:
      "Easy farm-side ordering with live cart, clear weight options and regional language support.",
    flow: "Customer to Mobile Order to Instant Booking",
    flowNote: "Fast Support",
    flowNoteClass: "text-dairy-600",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDn51qyRag22RiHQa7hW3Rc_7Tc5kSPGt7MaxEEImM3OHhW8EKG79YyfJk8N8ki8cyxxIEDoaQh7Z-YqXiEqya17QmjMC3SPqqheH5Eaq88Rehl7l9DiqW2ndwfOwJtM_F_cDxrwlNGo26nV7e8yJOt15pJIh8DGoNUSFmNSlptP4FA4yHBNY2xxoQwSdOoXrx32b5Ezvj9xQKEMu46w5hBrYU12Gx-aB9yINYd1fjuH92ea2kGtRNXqw",
    alt: "Indian dairy farmer holding phone ordering cattle feed on mobile app",
  },
  {
    step: "Step 3 of 4 - Shed Delivery",
    badge: "Vehicle to Doorstep",
    dotColor: "bg-emerald-400",
    title: "Step 3: Direct-to-Farm Delivery",
    tag: "Prompt Agent",
    tagClass: "bg-emerald-100 text-emerald-800",
    description:
      "Freshly milled 50kg bags delivered by courteous, trained field agents right to your cattle shed.",
    flow: "Company to Delivery Agent to Customer Home",
    flowNote: "Free above 500",
    flowNoteClass: "text-dairy-600",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLVHmyaJrLjtEUOzhWuo-7FlPXUbPbdbBlcDfhuSq5QAV9vP6Q4cLQuijNU_2kzOL468IAH4gDjj43FdnMHwfUuPp_Y0aL5fgbR1YEzTBlSScXp3ks6HDxI7ZYxXCZ0BNn66-xDIuRHJA3gprELULc8ZsqXmWnigGRfmimVNqcO5nMseUKGtv-OGjYevborseaC_rlzJXCEEkj3vVv3Ypn8bnsywYajlegu8Gkhpf5HJRlFn7R60TY-A",
    alt: "Courteous uniform delivery agent delivering freshly packed 50kg cattle feed sack to farmer at shed",
  },
  {
    step: "Step 4 of 4 - Result",
    badge: "+22% Milk Yield",
    dotColor: "bg-amber-400",
    title: "Step 4: Farm-Fresh Cattle Nutrition",
    tag: "Healthy Cattle",
    tagClass: "bg-dairy-100 text-dairy-800",
    description:
      "Delivered bags fed straight to healthy, high-yield cows for better fat, SNF and higher milk profits.",
    flow: "Order to Delivery to Customer to Farm Shed",
    flowNote: "Thriving Herd",
    flowNoteClass: "text-wheat-600",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC9wi4fcMz9XI-tqa5BoIH2bU_FnYxbmYDARIRpmUtkhdk8PTNm05iBaP6a-dh5eJVN2IRlu9lTpJIGSdtD3SZhlAsB0hQ6OzG-0tZ7Jn1q5QRkuNlplh-QMfbYc4srW5st63yePAOjC1HlbNZq-ZjXshocnVgQty5wqz1VtOzUV5tVaqio4zbSMxXzIf17KbvHrPysgCzlSmstP7sUuwYNiNGEFJCc252LoP1fsItYnOXO9hNa3Wu_yg",
    alt: "Dairy farmer family receiving feed and nourishing healthy high-yield cows at shed",
  },
];

function JourneyCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % journeySlides.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const goTo = (index) => setActiveSlide(index);
  const goPrev = () =>
    setActiveSlide((prev) => (prev - 1 + journeySlides.length) % journeySlides.length);
  const goNext = () => setActiveSlide((prev) => (prev + 1) % journeySlides.length);

  return (
    <div className="lg:col-span-6 flex flex-col items-center lg:items-end w-full">
      <div className="relative w-full max-w-lg sm:max-w-md lg:max-w-[490px]">
        <div className="absolute -inset-1.5 bg-gradient-to-tr from-emerald-500/25 via-amber-300/30 to-dairy-600/25 rounded-3xl blur-2xl opacity-70 transition duration-700"></div>

        <div className="relative rounded-3xl overflow-hidden bg-white shadow-2xl border border-white/90 aspect-square w-full flex flex-col">
          <div className="relative w-full h-full overflow-hidden">
            {journeySlides.map((slide, index) => (
              <div
                key={slide.title}
                className={
                  "absolute inset-0 transition-opacity duration-700 ease-in-out " +
                  (index === activeSlide
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0 pointer-events-none")
                }
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none"></div>

                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-20">
                  <span className="inline-flex items-center gap-1.5 bg-dairy-900/85 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                    <span className={"w-2 h-2 rounded-full " + slide.dotColor + " animate-pulse"}></span>
                    {slide.step}
                  </span>
                  <span className="bg-white/90 backdrop-blur-md text-dairy-900 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/70 shadow-sm">
                    {slide.badge}
                  </span>
                </div>

                <div className="absolute bottom-3.5 left-3.5 right-3.5 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/90 shadow-xl z-20">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-display font-bold text-sm sm:text-base text-dairy-900">
                      {slide.title}
                    </h4>
                    <span className={"text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded " + slide.tagClass}>
                      {slide.tag}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {slide.description}
                  </p>
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-dairy-700">
                    <span className="flex items-center gap-1">
                      <HiArrowRight className="w-3.5 h-3.5 text-dairy-600" />
                      {slide.flow}
                    </span>
                    <span className={"font-bold " + slide.flowNoteClass}>{slide.flowNote}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            aria-label="Previous step"
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 hover:bg-white text-dairy-900 shadow-md backdrop-blur-sm flex items-center justify-center transition hover:scale-105 active:scale-95 focus:outline-none"
          >
            <HiChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Next step"
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 hover:bg-white text-dairy-900 shadow-md backdrop-blur-sm flex items-center justify-center transition hover:scale-105 active:scale-95 focus:outline-none"
          >
            <HiChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute top-12 right-4 z-30 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {journeySlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                aria-label={"Slide " + (index + 1)}
                onClick={() => goTo(index)}
                className={
                  "w-2 h-2 rounded-full transition-all duration-300 " +
                  (index === activeSlide ? "bg-white" : "bg-white/40 hover:bg-white/70")
                }
              ></button>
            ))}
          </div>
        </div>

        <div className="mt-3.5 grid grid-cols-4 gap-1.5 sm:gap-2 w-full">
          {journeySlides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => goTo(index)}
              className={
                "text-left p-1.5 sm:p-2 rounded-xl shadow-xs transition duration-200 " +
                (index === activeSlide
                  ? "bg-white border-2 border-dairy-600"
                  : "bg-white/80 border border-gray-200 hover:bg-white")
              }
            >
              <span
                className={
                  "block text-[9px] sm:text-[10px] font-extrabold uppercase " +
                  (index === activeSlide ? "text-dairy-700" : "text-gray-500")
                }
              >
                {index + 1}. {slide.badge.split(" ")[0]}
              </span>
              <span
                className={
                  "block text-[11px] font-bold truncate " +
                  (index === activeSlide ? "text-dairy-900" : "text-gray-700")
                }
              >
                {slide.tag}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { lang } = useLanguage();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getProducts({ lang, limit: 8, sort: "newest" })
      .then((res) => {
        if (active) setFeatured(res.data.products);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [lang]);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-dairy-50/90 via-dairy-50/40 to-[#fafbf9] border-b border-emerald-900/5">
        <div className="absolute inset-0 bg-[radial-gradient(#276749_0.75px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

        <div className="container-page grid grid-cols-1 items-center gap-8 py-8 sm:py-14 lg:grid-cols-12 lg:gap-8 lg:py-16">
          <div className="lg:col-span-6 z-10 animate-fadeIn">
            <span className="inline-flex items-center gap-2 pill bg-wheat-100 border border-wheat-200/80 text-wheat-600 shadow-sm">
              <HiOutlineSparkles className="w-4 h-4 text-wheat-600" />
              Milled fresh every week
            </span>

            <h1 className="mt-4 sm:mt-5 max-w-xl font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[3.15rem] leading-[1.12] text-dairy-900 tracking-tight">
              Fresh &amp; quality dairy cattle feed
            </h1>

            <p className="mt-3 sm:mt-5 max-w-lg text-sm sm:text-base text-ink/65 leading-relaxed">
              Nutritious, farm-tested feed formulated to help your cattle and calves grow
              stronger, produce more milk, and stay healthy through every season.
            </p>

            <div className="mt-4 sm:mt-5 flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-gray-200 text-dairy-800 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Pure Cholam (Sorghum)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-gray-200 text-dairy-800 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Kambu (Pearl Millet)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-gray-200 text-dairy-800 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-green-600"></span> Protein Pellets &amp; Minerals
              </span>
            </div>

            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                to="/products"
                className="btn-primary w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base shadow-lg shadow-dairy-700/20 hover:shadow-dairy-700/30"
              >
                Shop Products
                <HiArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <a
                href="#categories"
                className="btn-secondary w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base"
              >
                Explore Feed
              </a>
            </div>

            <div className="mt-6 sm:mt-8 pt-5 border-t border-dairy-200/70 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-ink/50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-dairy-900 font-display">15,000+</span>
                <span>Dairy Farmers Supplied</span>
              </div>
              <span className="hidden sm:inline text-gray-300">|</span>
              <div className="flex items-center gap-1.5 text-dairy-800 font-medium">
                <FaStar className="w-4 h-4 text-amber-500" />
                <span>4.9/5 Rating from Herds</span>
              </div>
            </div>
          </div>

          <JourneyCarousel />
        </div>
      </section>

      <section className="container-page mt-4 sm:-mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-3 sm:gap-6 relative z-20">
        {trustPoints.map((point) => (
          <div
            key={point.title}
            className="card flex items-start gap-3.5 p-4 sm:p-5 bg-white border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dairy-50 text-dairy-600 border border-dairy-100">
              <point.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display font-bold text-sm text-dairy-900">{point.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink/60">{point.text}</p>
            </div>
          </div>
        ))}
      </section>

      <section id="categories" className="container-page py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-wheat-500">Shop by need</span>
            <h2 className="mt-1 text-2xl sm:text-3xl">Feed for every stage of the herd</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => {
            const Icon = categoryIcons[value] || GiCow;
            return (
              <Link
                key={value}
                to={"/products?category=" + value}
                className="card group flex flex-col items-center gap-3 px-3 py-6 text-center transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-dairy-50 text-dairy-600 transition group-hover:bg-dairy-600 group-hover:text-white">
                  <Icon className="h-7 w-7" />
                </span>
                <span className="text-sm font-medium text-ink/80">{label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-milk-50 py-16">
        <div className="container-page">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-wheat-500">Fresh from the mill</span>
              <h2 className="mt-1 text-2xl sm:text-3xl">Featured products</h2>
            </div>
            <Link to="/products" className="text-sm font-semibold text-dairy-600 hover:text-dairy-700">
              View all products →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featured.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="card flex flex-col items-center gap-4 overflow-hidden bg-dairy-700 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-white sm:text-3xl">Not sure which feed suits your herd?</h2>
          <p className="max-w-lg text-dairy-100/90">
            Talk to our team about your cattle, calves or dairy goals and we'll help you pick
            the right mix and quantity.
          </p>
          <Link to="/contact" className="btn-outline mt-2">
            Contact our team
          </Link>
        </div>
      </section>
    </div>
  );
}