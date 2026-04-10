type PageHeaderProps = {
  title: string;
  subtitle: string;
};

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="finance-panel px-5 py-6 md:px-7">
      <p className="finance-kicker">
        Borç Takip
      </p>
      <h1 className="finance-title mt-3 text-3xl md:text-4xl">
        {title}
      </h1>
      <p className="finance-copy mt-3 max-w-3xl text-sm">{subtitle}</p>
    </div>
  );
}
