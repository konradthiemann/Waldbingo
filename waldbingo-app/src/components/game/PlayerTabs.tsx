interface Props {
  count: number
  active: number
  onSelect: (i: number) => void
}

export function PlayerTabs({ count, active, onSelect }: Props) {
  if (count < 2) return null
  return (
    <div className="no-print mb-4 flex w-fit flex-wrap gap-1.5 rounded bg-line-2 p-[5px]">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          className={`focus-ring rounded-[10px] px-3.5 py-[7px] text-[13.5px] font-bold transition ${
            i === active ? 'bg-white text-forest-700 shadow-wb1' : 'bg-transparent text-muted'
          }`}
        >
          Spieler {i + 1}
        </button>
      ))}
    </div>
  )
}
