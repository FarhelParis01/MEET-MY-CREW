import { Briefcase, Network, Sparkles, Target, UserRound, Users } from "lucide-react";

const howItWorks = [
  {
    title: "Create a Profile",
    description:
      "Build your professional profile showcasing your skills, portfolio, and location so others can discover your work.",
    icon: UserRound,
  },
  {
    title: "Find & Connect",
    description:
      "Search for local creatives using smart filters and connect with professionals that match your project needs.",
    icon: Network,
  },
  {
    title: "Collaborate & Create",
    description:
      "Start projects, invite collaborators, exchange ideas, and bring your creative vision to life.",
    icon: Sparkles,
  },
];

const stats = [
  "1,200+ Creative Professionals",
  "900+ Successful Projects",
  "250+ Communities Supported",
  "98% Positive Feedback",
];

const team = [
  {
    name: "Andrew Roberts",
    role: "CEO",
    bio: "Founder with a vision to connect creative communities.",
  },
  {
    name: "Rachel Kim",
    role: "Community Manager",
    bio: "Passionate about building and supporting creative networks.",
  },
  {
    name: "David Mensah",
    role: "Lead Developer",
    bio: "Building the technology that powers creative collaboration.",
  },
];

function TeamAvatar({ name }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-200 text-sm font-semibold text-slate-800 ring-1 ring-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700">
      {initials}
    </div>
  );
}

export default function AboutSection() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
          <Briefcase size={14} />
          About Platform
        </div>
        <p className="max-w-2xl text-sm leading-7 text-slate-700 dark:text-slate-300">
          Meet My Crew is a platform designed to connect creative professionals such as
          filmmakers, videographers, photographers, editors, and other media creatives. It helps
          creators discover talent near them, collaborate on projects, and build strong production
          teams.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700">
            <Target size={18} />
          </div>
          <h2 className="text-xl font-semibold">Our Mission</h2>
        </div>
        <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
          At Meet My Crew, our mission is to empower creative professionals by providing a
          platform where they can find, connect, and collaborate with like-minded individuals.
          Whether you're a filmmaker looking for the perfect crew or a photographer seeking a
          skilled editor, Meet My Crew helps you build the right team.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">How It Works</h2>
        <div className="grid grid-cols-1 gap-3">
          {howItWorks.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
            >
              <p className="text-sm font-semibold leading-6 text-slate-800 dark:text-slate-100">{stat}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700">
            <Users size={18} />
          </div>
          <h2 className="text-xl font-semibold">Meet Our Team</h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {team.map((member) => (
            <div
              key={member.name}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
            >
              <div className="flex items-start gap-3">
                <TeamAvatar name={member.name} />
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">{member.role}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {member.bio}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Join Meet My Crew and connect with creatives near you.
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Start building your dream production team today.
        </p>
      </section>
    </div>
  );
}
