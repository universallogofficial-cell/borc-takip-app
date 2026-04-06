type PageHeaderProps = {
  title: string;
  subtitle: string;
};

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="rounded-[28px] border border-gray-200 bg-white px-5 py-5 shadow-sm md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
        Borç Takip
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">{subtitle}</p>
    </div>
  );
}
