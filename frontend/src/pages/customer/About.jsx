import { HiOutlineBeaker, HiOutlineTruck, HiOutlineUserGroup } from "react-icons/hi2";

const points = [
  {
    icon: HiOutlineBeaker,
    title: "Formulated with care",
    text: "Every recipe is balanced for protein, fibre and minerals by agricultural nutritionists, then tested on local farms before it reaches you.",
  },
  {
    icon: HiOutlineTruck,
    title: "Fresh, local delivery",
    text: "We mill in small batches and deliver directly to farms, so your feed stays fresh — no long warehouse storage.",
  },
  {
    icon: HiOutlineUserGroup,
    title: "Built with farmers",
    text: "Our team visits dairy farms across the district regularly to understand what herds actually need.",
  },
];

export default function About() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-wide text-wheat-500">Our story</span>
        <h1 className="mt-2 text-3xl sm:text-4xl">Feed that farmers actually trust</h1>
        <p className="mt-4 text-base text-ink/65">
          Suwasthika Dairy Feeds started as a small family mill supplying a handful of nearby dairy
          farms. Today we serve hundreds of farmers with the same promise: honest ingredients,
          consistent quality, and feed that helps your herd thrive.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {points.map((p) => (
          <div key={p.title} className="card p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-dairy-50 text-dairy-600">
              <p.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-base text-dairy-900">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">{p.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
