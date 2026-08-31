export default function FurrowDivider({ className = "" }: { className?: string }) {
  return <div className={`furrow-divider ${className}`} aria-hidden="true" />;
}
