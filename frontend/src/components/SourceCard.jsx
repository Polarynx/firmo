import { useState, useEffect, useRef } from 'react'

const API = import.meta.env.VITE_API_URL || ''

const ABSTRACT_LIMIT = 220

const SOURCE_LABELS = {
  semantic_scholar: 'Semantic Scholar',
  crossref: 'CrossRef',
  pubmed: 'PubMed',
  openalex: 'OpenAlex',
  europe_pmc: 'Europe PMC',
  base: 'BASE',
  arxiv: 'arXiv',
  doaj: 'DOAJ',
  eric: 'ERIC',
  zenodo: 'Zenodo',
  plos: 'PLOS',
  hal: 'HAL',
  inspire_hep: 'INSPIRE-HEP',
  fatcat: 'Internet Archive Scholar',
}

function copyToClipboard(text, onDone) {
  navigator.clipboard.writeText(text).then(onDone)
}

export default function SourceCard({ paper, citationStyle, index = 0, claim = '', isSaved = false, onToggleSave }) {
  const [citation, setCitation] = useState(null)
  const [intext, setIntext] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copiedCite, setCopiedCite] = useState(false)
  const [copiedIntext, setCopiedIntext] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [summary, setSummary] = useState(null)
  const [summarizing, setSummarizing] = useState(false)
  const [digDeep, setDigDeep] = useState(null)
  const [digging, setDigging] = useState(false)
  const hasGenerated = useRef(false)

  const delays = ['delay-0', 'delay-75', 'delay-150', 'delay-225', 'delay-300']
  const delayClass = delays[Math.min(index, delays.length - 1)]

  const authors = Array.isArray(paper.authors) ? paper.authors : []
  const abstract = paper.abstract || ''
  const shortAbstract = abstract.length > ABSTRACT_LIMIT
    ? abstract.slice(0, ABSTRACT_LIMIT) + '…'
    : abstract

  async function fetchCitation(style) {
    setLoading(true)
    setCitation(null)
    setIntext(null)
    try {
      const res = await fetch(`${API}/api/cite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...paper, style: style ?? citationStyle }),
      })
      const data = await res.json()
      setCitation(data.citation)
      setIntext(data.intext)
    } catch {
      setCitation('Error generating citation.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasGenerated.current) {
      fetchCitation(citationStyle)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citationStyle])

  async function handleSummarize() {
    if (summary || summarizing || !abstract) return
    setSummarizing(true)
    try {
      const res = await fetch(`${API}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abstract }),
      })
      const data = await res.json()
      setSummary(data.summary)
    } catch {
      setSummary('Could not summarize.')
    } finally {
      setSummarizing(false)
    }
  }

  async function handleDigDeep() {
    if (digDeep || digging || !abstract) return
    setDigging(true)
    try {
      const res = await fetch(`${API}/api/digdeep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim, title: paper.title, abstract }),
      })
      const data = await res.json()
      setDigDeep(data.analysis)
    } catch {
      setDigDeep('Could not analyze.')
    } finally {
      setDigging(false)
    }
  }

  function handleGenerate() {
    hasGenerated.current = true
    fetchCitation(citationStyle)
  }

  function handleCopyCite() {
    if (!citation) return
    copyToClipboard(citation, () => {
      setCopiedCite(true)
      setTimeout(() => setCopiedCite(false), 2000)
    })
  }

  function handleCopyIntext() {
    if (!intext) return
    copyToClipboard(intext, () => {
      setCopiedIntext(true)
      setTimeout(() => setCopiedIntext(false), 2000)
    })
  }

  return (
    <div className={`source-card animate-fadeInUp ${delayClass}`}>
      {/* Title + year + bookmark */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 leading-snug flex-1 text-sm">
          {paper.url ? (
            <a href={paper.url} target="_blank" rel="noopener noreferrer"
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              {paper.title}
            </a>
          ) : paper.title}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          {paper.year && (
            <span className="text-xs font-mono text-gray-400 dark:text-gray-600 tabular-nums">
              {paper.year}
            </span>
          )}
          {onToggleSave && (
            <button
              onClick={() => onToggleSave(paper)}
              title={isSaved ? 'Remove from saved' : 'Save for later'}
              className={`transition-colors ${isSaved ? 'text-brand-500 dark:text-brand-400' : 'text-gray-300 dark:text-gray-700 hover:text-brand-400 dark:hover:text-brand-500'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Authors */}
      {authors.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-600">
          {authors.slice(0, 4).join(', ')}{authors.length > 4 ? ' et al.' : ''}
        </p>
      )}

      {/* Source badge */}
      <div className="flex items-center flex-wrap gap-1.5">
        {paper.source && (
          <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            {SOURCE_LABELS[paper.source] || paper.source}
          </span>
        )}
        {paper.journal && (
          <span className="text-[10px] text-gray-400 dark:text-gray-600 truncate max-w-[240px]" title={paper.journal}>
            {paper.journal}
          </span>
        )}
        {paper.citationCount > 0 && (
          <span className="text-[10px] text-gray-400 dark:text-gray-600 font-mono">
            {paper.citationCount.toLocaleString()} citations
          </span>
        )}
      </div>

      {/* DOI */}
      {paper.doi && (
        <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer"
          className="self-start text-xs text-gray-400 dark:text-gray-600 hover:text-brand-500 dark:hover:text-brand-400 transition-colors font-mono">
          {paper.doi}
        </a>
      )}

      {/* Abstract */}
      {abstract && (
        <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {summary && (
            <p className="text-brand-600 dark:text-brand-400 italic text-xs mb-1.5">
              {summary}
            </p>
          )}
          {expanded ? abstract : shortAbstract}
          {abstract.length > ABSTRACT_LIMIT && (
            <button onClick={() => setExpanded(e => !e)}
              className="ml-1.5 text-brand-500 hover:text-brand-600 dark:hover:text-brand-300 text-xs font-medium transition-colors">
              {expanded ? 'less' : 'more'}
            </button>
          )}
        </div>
      )}

      {/* Dig Deeper panel */}
      {digDeep && (
        <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/40 rounded-lg p-3 text-sm text-violet-900 dark:text-violet-200 leading-relaxed">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-500 dark:text-violet-400 block mb-1">Dig deeper</span>
          {digDeep}
        </div>
      )}

      {/* Citation */}
      {(citation || loading) && (
        <div className="terminal-box">
          {loading
            ? <span className="text-gray-400 animate-pulse">Generating {citationStyle.toUpperCase()}…</span>
            : citation}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={handleGenerate} disabled={loading} className="btn-secondary text-xs disabled:opacity-40">
          {loading ? 'Loading…' : `${citationStyle.toUpperCase()}`}
        </button>
        {abstract && !summary && (
          <button onClick={handleSummarize} disabled={summarizing} className="btn-secondary text-xs disabled:opacity-40">
            {summarizing ? 'Summarizing…' : 'Summarize'}
          </button>
        )}
        {abstract && !digDeep && claim && (
          <button onClick={handleDigDeep} disabled={digging} className="btn-secondary text-xs disabled:opacity-40">
            {digging ? 'Analyzing…' : 'Dig deeper'}
          </button>
        )}
        {citation && !loading && (
          <>
            <button onClick={handleCopyCite} className="btn-primary text-xs">
              {copiedCite ? '✓ Copied' : 'Copy citation'}
            </button>
            <button onClick={handleCopyIntext} className="btn-secondary text-xs">
              {copiedIntext ? '✓ Copied' : 'In-text'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
