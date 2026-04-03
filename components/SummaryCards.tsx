import type { SummaryCard } from "@/types/finance";

type Props = {
  cards: SummaryCard[];
};

export default function SummaryCards({ cards }: Props) {
  return (
    <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
        >
          <p className="text-sm text-gray-500">{card.title}</p>
          <h2 className="mt-2 break-words text-2xl font-semibold text-gray-900">
            {card.value}
          </h2>
        </div>
      ))}
    </section>
  );
}
