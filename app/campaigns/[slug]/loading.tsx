/** Shown inside the campaign site (header and tabs stay put) while a section loads. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="animate-pulse space-y-6">
      <div className="h-9 w-56 rounded-lg bg-plum" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-2xl bg-plum/70" />
        ))}
      </div>
      <div className="h-40 rounded-2xl bg-plum/50" />
    </div>
  )
}
