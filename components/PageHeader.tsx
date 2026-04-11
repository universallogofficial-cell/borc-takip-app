type PageHeaderProps = {
  title: string;
  subtitle: string;
};

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="px-1 py-2">
      <p className="finance-kicker">AKÇA</p>
      <h1 className="finance-title mt-3 text-4xl md:text-5xl">{title}</h1>
      <p className="finance-copy mt-3 max-w-2xl text-sm md:text-base">{subtitle}</p>
    </div>
  );
}
