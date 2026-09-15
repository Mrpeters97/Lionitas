export default function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-page px-6 sm:px-10 lg:px-16 xl:px-20 ${className}`}>{children}</div>
  );
}
