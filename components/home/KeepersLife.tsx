const apps = [
  { name: 'Waypoint', what: 'Personal goals, tracked with intention.' },
  { name: 'Purse', what: 'Simple budgets, shared with the people who matter.' },
  { name: 'Hearth', what: 'Household calendar, tasks, groceries and recipes.' },
]

export default function KeepersLife() {
  return (
    <section className="border-t border-plum-line">
      <div className="mx-auto max-w-[1180px] px-6 py-14 md:px-10">
        <div className="grid gap-8 md:grid-cols-[14rem_1fr] md:gap-16">
          <div>
            <h2 className="font-cinzel text-[1.2rem] font-bold text-vellum">The Keeper’s Life</h2>
            <p className="mt-2 text-[0.92rem] leading-snug text-mist">Free apps for the life behind the lore.</p>
          </div>
          <ul className="grid gap-6 sm:grid-cols-3">
            {apps.map((a) => (
              <li key={a.name}>
                <p className="font-cinzel text-[0.98rem] font-bold text-vellum">
                  {a.name} <span className="ml-1 align-middle font-text text-[0.75rem] font-normal text-mist/80">coming soon</span>
                </p>
                <p className="mt-1 text-[0.92rem] leading-snug text-mist">{a.what}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
