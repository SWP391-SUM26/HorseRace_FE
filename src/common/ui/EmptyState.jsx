function EmptyState({ title, description, action }) {
  return <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
      <p className="font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>;
}
export {
  EmptyState
};
