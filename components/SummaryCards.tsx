import type { SummaryCard } from "@/types/finance";

type Props = {
  cards: SummaryCard[];
};

export default function SummaryCards({ cards }: Props) {
  return (
    <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="group rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-md md:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              {card.title}
            </p>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
              0{index + 1}
            </span>
          </div>
          <h2 className="mt-5 break-words text-3xl font-semibold tracking-tight text-gray-900 md:text-[2rem]">
            {card.value}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Güncel görünüm hesabınızdaki verilerle otomatik yenilenir.
          </p>
        </div>
      ))}
    </section>
  );
}
