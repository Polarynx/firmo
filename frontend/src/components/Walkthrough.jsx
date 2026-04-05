import { useState } from 'react'

const STEPS = [
  {
    icon: '🎓',
    title: 'Welcome to Firmo',
    body: 'Firmo checks if your claims are backed by real academic research. It searches 6 databases simultaneously — Semantic Scholar, PubMed, CrossRef, OpenAlex, Europe PMC, and BASE — and uses AI to evaluate what the science actually says.',
    tip: 'Think of it as a fact-checker powered by millions of academic papers.',
  },
  {
    icon: '🔍',
    title: 'Single Claim Search',
    body: 'Type any factual statement or opinion into the search bar and hit Enter or Search. Firmo works best with specific, testable claims — not vague questions or commands.',
    tip: 'Best use: Write it like you\'re making a point in an essay. "Coffee improves short-term memory" works great. "Tell me about coffee" does not.',
  },
  {
    icon: '📄',
    title: 'Essay Check Mode',
    body: 'Switch to "Essay check" and paste a full paragraph or essay. Firmo automatically extracts up to 8 distinct factual claims from your text and evaluates each one individually with a confidence score.',
    tip: 'Best use: Paste a draft of something you\'re writing. Each claim gets its own color-coded confidence bar — green means well-supported, red means questionable.',
  },
  {
    icon: '🗂️',
    title: 'Topic Explorer',
    body: 'Switch to "Topic explorer" and type a single keyword or topic area — like "CRISPR", "sleep deprivation", or "microplastics". Firmo returns an overview of the research landscape, related topics to explore, and the most important papers on that subject.',
    tip: 'Best use: Use this at the start of a research project when you don\'t yet have a specific claim in mind — it maps out the field and suggests adjacent topics worth diving into.',
  },
  {
    icon: '🤖',
    title: 'Firmo\'s AI Response',
    body: 'After every search, Firmo gives you an AI evaluation of the claim — explaining what the evidence says, where there\'s consensus, and where it\'s complicated. The confidence score (0–100%) tells you how strongly the literature supports or refutes the claim.',
    tip: 'Best use: Read this first before diving into sources. Low confidence (under 40%) often means the claim is contested or lacks strong evidence.',
  },
  {
    icon: '⚖️',
    title: 'Debatable Claims',
    body: 'When a claim is genuinely contested in the literature, you\'ll see two tabs appear: "Main view" (the dominant position) and "Other perspectives" (alternative angles). Each tab shows its own set of sources.',
    tip: 'Best use: Toggle between both views when writing balanced arguments. The "Other perspectives" tab is gold for finding counterarguments before your reader does.',
  },
  {
    icon: '⚡',
    title: 'Stress Test',
    body: 'Click "What argues against this?" under Firmo\'s response to run a Stress Test. It finds the strongest academic case against your claim and surfaces the top papers that challenge or complicate it.',
    tip: 'Best use: Run this before finalizing any argument. If the counterargument is strong, you\'ll want to address it — or rethink your claim entirely.',
  },
  {
    icon: '🔗',
    title: 'Related Claims',
    body: 'Below Firmo\'s response, you\'ll see 3 related claims as clickable chips. These are adjacent ideas worth exploring that connect to your original claim.',
    tip: 'Best use: Use these to build a fuller picture of a topic. Great for finding the next claim to check when building a larger argument.',
  },
  {
    icon: '📚',
    title: 'Source Cards',
    body: 'Each paper found appears as a source card showing the title, authors, year, abstract preview, and which database it came from. Click the title to open the full paper. Click the abstract to expand it.',
    tip: 'Best use: Check the year and citation count to gauge how established the research is. Older papers with high citation counts are usually foundational work.',
  },
  {
    icon: '🔬',
    title: 'Summarize & Dig Deep',
    body: '"Summarize" generates a one-sentence plain-English summary of the abstract. "Dig Deep" gives you a 3–4 sentence analysis of exactly what the paper studied and how it relates to your specific claim.',
    tip: 'Best use: Use Summarize for a quick read. Use Dig Deep when a paper looks relevant but you\'re not sure — it connects the dots between the paper\'s findings and your claim.',
  },
  {
    icon: '📝',
    title: 'Citation Generator',
    body: 'Click the cite button on any source card to instantly generate a formatted citation. Choose APA, MLA, or Chicago from the selector at the top. Each citation includes both a full reference and an in-text version — both are copy-to-clipboard.',
    tip: 'Best use: Set your preferred citation style once at the top and it applies to all cards. The in-text version is especially handy for dropping directly into your writing.',
  },
  {
    icon: '🧩',
    title: 'Synthesize Sources',
    body: 'Once you have 3 or more sources, a "Synthesize N sources" button appears. Click it to get an AI-generated synthesis of all papers — a one-sentence verdict plus a detailed breakdown of what the literature collectively says.',
    tip: 'Best use: Run this after finding 8–12 sources for the richest synthesis. It\'s the fastest way to write a literature review paragraph.',
  },
  {
    icon: '➕',
    title: 'Find More Sources',
    body: 'Click "Find more sources" to generate 5 alternative search queries from different angles. Firmo searches again using those queries and adds new papers to your results — with no duplicates.',
    tip: 'Best use: Run this when your initial results feel too narrow or all come from the same field. The alternative queries often uncover papers from unexpected disciplines.',
  },
  {
    icon: '💬',
    title: 'Ask Sources',
    body: 'At the bottom of your results, type any question into the "Ask a question about these sources…" box. Firmo answers based strictly on what the papers you found actually say.',
    tip: 'Best use: Ask specific methodological questions like "What populations were studied?" or "Do any of these papers mention long-term effects?" — it\'s grounded in your actual sources, not general AI knowledge.',
  },
  {
    icon: '🔖',
    title: 'Save & History',
    body: 'Bookmark any paper using the bookmark icon on its card — it\'s saved to your browser with the original claim context. Access saved papers from the bookmark icon in the navbar. Your last 20 searches are in the history panel (clock icon).',
    tip: 'Best use: Save papers as you go, then open the saved panel at the end of a research session to build your reference list all at once.',
  },
  {
    icon: '🔗',
    title: 'Share Results',
    body: 'The share icon appears in the navbar after a search. Clicking it copies a direct URL to your clipboard — anyone with the link opens the same search automatically.',
    tip: 'Best use: Share a specific claim search with a collaborator or teacher so they can see exactly what sources you found and what Firmo said about it.',
  },
]

export default function Walkthrough({ onClose }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeInUp"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-lg flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-1.5 rounded-full transition-all duration-200 ${i === step ? 'w-6 bg-brand-500' : 'w-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
            aria-label="Close walkthrough"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-4 flex flex-col gap-4 flex-1">
          <div className="flex flex-col gap-2">
            <span className="text-3xl">{current.icon}</span>
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{current.title}</h2>
              <span className="text-xs font-mono text-gray-400 dark:text-gray-600">{step + 1} / {STEPS.length}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{current.body}</p>
          </div>

          <div className="rounded-xl bg-brand-50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/40 px-4 py-3">
            <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1">Pro tip</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{current.tip}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {isLast ? (
            <button
              onClick={onClose}
              className="btn-primary text-sm px-5"
            >
              Start using Firmo
            </button>
          ) : (
            <button
              onClick={() => setStep(s => s + 1)}
              className="btn-primary text-sm px-5 flex items-center gap-1"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
