import Card from "../components/ui/Card";

export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Users</h2>
      <Card>
        <p className="text-sm text-slate-500 dark:text-slate-400">Admin users table will render here.</p>
      </Card>
    </div>
  );
}
