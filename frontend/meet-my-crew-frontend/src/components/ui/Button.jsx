const VARIANT_STYLES = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-teal-500 hover:bg-teal-600 text-white",
  neutral:
    "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100",
};

export default function Button({
  variant = "primary",
  className = "",
  type = "button",
  as: Tag = "button",
  children,
  ...props
}) {
  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;

  return (
    <Tag
      type={Tag === "button" ? type : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
}
