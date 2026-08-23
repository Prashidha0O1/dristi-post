import React from 'react'

const supporting = [
  { kicker: 'खेलकुद', title: 'नेपाली क्रिकेट टोलीले ऐतिहासिक जित हात पार्‍यो', meta: '६ दिन अगाडि' },
  { kicker: 'व्यापार र अर्थ', title: 'पोखरामा पर्यटन क्षेत्रमा उल्लेख्य वृद्धि', meta: 'Aug 16' },
  { kicker: 'प्रविधि', title: 'डिजिटल भुक्तानी प्रणालीमा नयाँ नियम लागू', meta: 'Aug 14' },
]

export function PagePreview() {
  return (
    <main id="main" className="mx-auto max-w-[1400px] px-4 pb-32 pt-10 sm:px-6 lg:px-10">
      <div className="flex items-end justify-between border-b-2 border-crimson pb-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">Top stories</p>
          <h1 className="font-np text-3xl font-extrabold text-ink dark:text-white">मुख्य समाचार</h1>
        </div>
        <a href="#all" className="font-np text-sm font-semibold text-crimson hover:underline">
          सबै हेर्नुहोस् →
        </a>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <article>
          <div className="aspect-[16/9] w-full rounded-lg bg-ink-700" aria-hidden="true" />
          <p className="mt-4 flex items-center gap-3 text-xs">
            <span className="font-np font-bold uppercase tracking-wide text-crimson">राजनीति</span>
            <span className="font-np text-ink-400">६ दिन अगाडि</span>
          </p>
          <h2 className="font-np mt-2 text-4xl font-extrabold leading-tight text-ink dark:text-white">
            सरकारले नयाँ बजेट घोषणा गर्‍यो, शिक्षा र स्वास्थ्यमा ठूलो लगानी
          </h2>
          <p className="font-np mt-3 max-w-2xl text-ink-500 dark:text-ink-400">
            अर्थमन्त्रीले आज संसदमा नयाँ आर्थिक वर्षको बजेट प्रस्तुत गरे। शिक्षा र स्वास्थ्य क्षेत्रमा
            विशेष जोड दिइएको छ।
          </p>
        </article>

        <aside>
          <p className="border-b border-paper-200 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400 dark:border-ink-700">
            Supporting desk
          </p>
          <ul className="divide-y divide-paper-200 dark:divide-ink-700">
            {supporting.map((s) => (
              <li key={s.title} className="py-5">
                <p className="font-np text-xs font-bold uppercase tracking-wide text-crimson">{s.kicker}</p>
                <h3 className="font-np mt-1 text-lg font-bold leading-snug text-ink dark:text-white">
                  {s.title}
                </h3>
                <p className="font-np mt-1 text-xs text-ink-400">{s.meta}</p>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className="mt-16 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-lg border border-paper-200 bg-paper-50 dark:border-ink-700 dark:bg-ink-800"
            aria-hidden="true"
          />
        ))}
      </div>
    </main>
  )
}
