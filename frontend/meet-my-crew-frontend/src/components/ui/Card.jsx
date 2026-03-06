export default function Card({ className = "", children, as: Tag = "div" }) {
  return (
    <Tag
      className={`rounded-xl bg-white border border-slate-200 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-700 ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
