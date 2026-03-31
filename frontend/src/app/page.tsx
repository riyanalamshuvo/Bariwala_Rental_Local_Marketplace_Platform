import Link from 'next/link';

const FEATURE_ITEMS = [
  {
    icon: '🏠',
    title: 'Property Rentals',
    desc: 'Browse apartments, rooms, and offices. Send rental applications directly to landlords.',
  },
  {
    icon: '💬',
    title: 'Direct Communication',
    desc: 'Chat instantly with landlords and sellers using built-in messaging.',
  },
  {
    icon: '🛒',
    title: 'Local Marketplace',
    desc: 'Buy and sell electronics, furniture, vehicles, and daily essentials in your city.',
  },
  {
    icon: '💳',
    title: 'Payment Simulation',
    desc: 'Track and simulate rent payments via bank transfer, bKash, Nagad, Rocket, and more.',
  },
  {
    icon: '⭐',
    title: 'Reviews & Ratings',
    desc: 'Read trusted reviews and build credibility with transparent ratings.',
  },
  {
    icon: '📱',
    title: 'Responsive Experience',
    desc: 'Enjoy smooth performance across desktop, tablet, and mobile devices.',
  },
];

const STATS = [
  { label: 'User Roles', value: '4+' },
  { label: 'Core Modules', value: '10+' },
  { label: 'Messaging', value: 'Real-time' },
  { label: 'Coverage', value: 'Local-first' },
];

export default function Home() {
  return (
    <div className="fade-in">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-800 to-cyan-700 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_85%_25%,rgba(110,231,183,0.22),transparent_26%)]" />
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-24 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-emerald-50 backdrop-blur">
              Rental + Marketplace in one seamless platform
            </span>
            <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Find Your Perfect <span className="text-yellow-300">Bari</span> <br className="hidden md:block" /> and Sell with Confidence
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg md:text-2xl text-emerald-100 leading-relaxed">
              Discover rentals, connect with verified people, and buy or sell local items — faster and smoother.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/properties" className="btn-secondary border-white/70 bg-white text-emerald-700 px-8 py-3 text-base">
                Browse Properties
              </Link>
              <Link href="/marketplace" className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-8 py-3 text-base font-bold text-gray-900 transition duration-200 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-300/30">
                Visit Marketplace
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
              {STATS.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xl font-extrabold text-white">{stat.value}</p>
                  <p className="text-xs text-emerald-100">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 bg-gradient-to-b from-slate-50 via-indigo-50/60 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(99,102,241,0.12),transparent_35%),radial-gradient(circle_at_82%_20%,rgba(6,182,212,0.10),transparent_32%)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 rounded-2xl border border-indigo-100/80 bg-white/80 px-6 py-8 shadow-sm backdrop-blur md:px-10">
            <p className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              Why Bariwala Works
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950">One trusted platform for homes and local trade</h2>
            <p className="mt-3 text-slate-700 max-w-3xl mx-auto">Rent confidently, buy and sell faster, and manage everything in one reliable ecosystem built for transparency, speed, and peace of mind.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURE_ITEMS.map((feature) => (
              <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} desc={feature.desc} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 pt-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="surface-card px-6 py-10 md:px-10 text-center md:text-left md:flex md:items-center md:justify-between md:gap-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Ready to get started?</h2>
              <p className="text-gray-700 mt-3 text-lg">Join Bariwala as a Landlord, Tenant, Buyer, or Seller — and start exploring instantly.</p>
            </div>
            <div className="mt-6 md:mt-0 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="btn-primary px-8 py-3 text-base">
                Create Free Account
              </Link>
              <Link href="/login" className="btn-secondary px-8 py-3 text-base">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="surface-card p-6 text-center group hover:-translate-y-0.5 transition duration-200">
      <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-4xl transition duration-200 group-hover:scale-105">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-700 leading-relaxed">{desc}</p>
    </div>
  );
}
