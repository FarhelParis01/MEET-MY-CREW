import AuthShell from "../components/AuthShell";
import AboutSection from "../components/AboutSection";

export default function About() {
  return (
    <AuthShell
      title="About Meet My Crew"
      subtitle="Connecting creatives, building productions."
      layout="single"
    >
      <AboutSection />
    </AuthShell>
  );
}
