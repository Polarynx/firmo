import { useState, useEffect, useRef } from 'react'

const API = import.meta.env.VITE_API_URL || ''
import SearchBar from './components/SearchBar'
import SourceCard from './components/SourceCard'
import ThemeToggle from './components/ThemeToggle'
import EssayChecker from './components/EssayChecker'
import Walkthrough from './components/Walkthrough'
import TopicSearch from './components/TopicSearch'
import Changelog from './components/Changelog'


function saveToHistory(claim, response) {
  try {
    const history = JSON.parse(localStorage.getItem('firmo_history') || '[]')
    const entry = { claim, response, timestamp: Date.now() }
    const deduped = history.filter(h => h.claim.toLowerCase() !== claim.toLowerCase())
    const updated = [entry, ...deduped].slice(0, 20)
    localStorage.setItem('firmo_history', JSON.stringify(updated))
  } catch {}
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem('firmo_history') || '[]')
  } catch {
    return []
  }
}

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem('firmo_saved') || '[]')
  } catch {
    return []
  }
}

function getPaperId(paper) {
  return paper.doi || paper.url || (paper.title || '').slice(0, 60)
}

function SkeletonCard() {
  return (
    <div className="source-card opacity-60">
      <div className="flex items-start justify-between gap-3">
        <div className="skeleton h-4 flex-1" />
        <div className="skeleton h-4 w-10" />
      </div>
      <div className="skeleton h-3 w-36" />
      <div className="flex flex-col gap-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
        <div className="skeleton h-3 w-4/6" />
      </div>
    </div>
  )
}


function StressTestPanel({ claim }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function run() {
    if (result) { setOpen(o => !o); return }
    setLoading(true)
    setOpen(true)
    try {
      const res = await fetch(`${API}/api/stresstest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim }),
      })
      if (res.status === 400) {
        setResult({ response: 'Invalid claim — enter a real factual statement first.', results: [] })
        return
      }
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ response: 'Could not generate counterargument.', results: [] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={run}
        className="self-start text-xs text-gray-400 dark:text-gray-600 hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-medium flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {result ? (open ? 'Hide counterargument' : 'Show counterargument') : 'What argues against this?'}
      </button>

      {open && (
        <div className="card border-orange-200 dark:border-orange-800/40 bg-orange-50/40 dark:bg-orange-950/10 p-4 flex flex-col gap-3 animate-fadeInUp">
          <span className="text-xs font-semibold text-orange-500 dark:text-orange-400">Counterargument — strongest academic case against this</span>
          {loading ? (
            <div className="flex flex-col gap-2">
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-5/6" />
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result?.response}</p>
              {result?.results?.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-1 border-t border-orange-100 dark:border-orange-800/30">
                  <span className="text-xs text-gray-400 dark:text-gray-600">Sources that challenge this</span>
                  {result.results.slice(0, 3).map((p, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs font-mono text-gray-400 shrink-0 mt-0.5">{i + 1}.</span>
                      <div className="flex flex-col gap-0.5">
                        <a
                          href={p.url || (p.doi ? `https://doi.org/${p.doi}` : undefined)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors leading-snug"
                        >
                          {p.title}
                        </a>
                        {p.year && <span className="text-xs font-mono text-gray-400 dark:text-gray-600">{p.year}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function SynthesisPanel({ claim, papers }) {
  const [result, setResult] = useState(null) // { summary, synthesis }
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function run() {
    if (result) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/synthesize-sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim, papers }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ summary: 'Could not synthesize sources.', synthesis: '' })
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="card bg-brand-50/40 dark:bg-brand-950/10 border-brand-200 dark:border-brand-800/40 p-4 flex flex-col gap-1.5 animate-fadeInUp">
        <span className="text-xs font-semibold text-brand-500 dark:text-brand-400">Evidence synthesis</span>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {expanded ? result.synthesis || result.summary : result.summary}
          {result.synthesis && result.synthesis !== result.summary && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="ml-1.5 text-brand-500 hover:text-brand-600 dark:hover:text-brand-300 text-xs font-medium transition-colors"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>
      </div>
    )
  }

  return (
    <button
      onClick={run}
      disabled={loading}
      className="btn-secondary text-xs self-start disabled:opacity-40"
    >
      {loading ? 'Synthesizing…' : `Synthesize ${papers.length} sources`}
    </button>
  )
}

export default function App() {
  const [dark, setDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  const [inputMode, setInputMode] = useState('claim') // 'claim' | 'essay'
  const [claim, setClaim] = useState('')
  const [searchedClaim, setSearchedClaim] = useState('')
  const [style, setStyle] = useState('apa')
  const [yearFrom, setYearFrom] = useState(null)
  const [mode, setMode] = useState('support')
  const [allResults, setAllResults] = useState([])
  const [allPerspectivesResults, setAllPerspectivesResults] = useState([])
  const [response, setResponse] = useState('')
  const [perspectivesResponse, setPerspectivesResponse] = useState(null)
  const [confidence, setConfidence] = useState(null)
  const [relatedClaims, setRelatedClaims] = useState([])
  const [isDebatable, setIsDebatable] = useState(false)
  const [moreLoading, setMoreLoading] = useState(false)
  const [askQuestion, setAskQuestion] = useState('')
  const [askAnswer, setAskAnswer] = useState(null)
  const [asking, setAsking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState(loadHistory)
  const [savedPapers, setSavedPapers] = useState(loadSaved)
  const [showSaved, setShowSaved] = useState(false)
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  const [topicQuery, setTopicQuery] = useState('')
  const [hiddenSources, setHiddenSources] = useState(new Set())
  const abortRef = useRef(null)

  // Essay check state — lifted so results survive mode switches
  const [chainResults, setChainResults] = useState(null)
  const [chainLoading, setChainLoading] = useState(false)
  const [chainError, setChainError] = useState('')
  const chainAbortRef = useRef(null)
  const [fromEssay, setFromEssay] = useState(false)
  const [essayText, setEssayText] = useState('')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q) {
      setClaim(q)
      handleSearch(q)
    }
    window.history.replaceState({}, '', window.location.pathname)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSearch(overrideClaim) {
    const activeClaim = overrideClaim ?? claim
    if (!activeClaim.trim()) return

    setLoading(true)
    setError('')
    setAllResults([])
    setAllPerspectivesResults([])
    setResponse('')
    setPerspectivesResponse(null)
    setConfidence(null)
    setRelatedClaims([])
    setIsDebatable(false)
    setAskAnswer(null)
    setAskQuestion('')
    setSearched(true)
    setShowHistory(false)
    setMode('support')
    setSearchedClaim(activeClaim)
    setHiddenSources(new Set())

    window.history.pushState({}, '', '?q=' + encodeURIComponent(activeClaim))

    abortRef.current = new AbortController()

    try {
      const res = await fetch(`${API}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: activeClaim, year_from: yearFrom }),
        signal: abortRef.current.signal,
      })
      if (res.status === 429) {
        const data = await res.json()
        setError(data.detail || 'Daily search limit reached. Come back tomorrow!')
        return
      }
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()

      if (data.invalid) {
        setError('invalid_claim')
        return
      }

      const finalClaim = data.corrected_claim || activeClaim
      if (finalClaim !== activeClaim) {
        setClaim(finalClaim)
        window.history.replaceState({}, '', '?q=' + encodeURIComponent(finalClaim))
      }
      setSearchedClaim(finalClaim)
      setResponse(data.response)
      setPerspectivesResponse(data.perspectives_response)
      setConfidence(data.confidence ?? null)
      setIsDebatable(data.is_debatable)
      setAllResults(data.results || [])
      setAllPerspectivesResults(data.perspectives_results || [])
      setRelatedClaims(data.related_claims || [])
      saveToHistory(finalClaim, data.response)
      setHistory(loadHistory())
    } catch (e) {
      if (e.name !== 'AbortError') {
        setError(e.message || 'Something went wrong. Is the backend running?')
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  async function handleTopicSearch(overrideTopic) {
    const activeTopic = overrideTopic ?? topicQuery
    if (!activeTopic.trim()) return

    setLoading(true)
    setError('')
    setAllResults([])
    setAllPerspectivesResults([])
    setResponse('')
    setPerspectivesResponse(null)
    setConfidence(null)
    setRelatedClaims([])
    setIsDebatable(false)
    setAskAnswer(null)
    setAskQuestion('')
    setSearched(true)
    setShowHistory(false)
    setMode('support')
    setSearchedClaim(activeTopic)
    setHiddenSources(new Set())

    abortRef.current = new AbortController()

    try {
      const res = await fetch(`${API}/api/topic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: activeTopic, year_from: yearFrom }),
        signal: abortRef.current.signal,
      })
      if (res.status === 429) {
        const data = await res.json()
        setError(data.detail || 'Daily search limit reached. Come back tomorrow!')
        return
      }
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      setResponse(data.overview)
      setAllResults(data.results || [])
      setRelatedClaims(data.related_topics || [])
      saveToHistory(activeTopic, data.overview)
      setHistory(loadHistory())
    } catch (e) {
      if (e.name !== 'AbortError') {
        setError(e.message || 'Something went wrong. Is the backend running?')
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  function handleCancel() {
    abortRef.current?.abort()
    setLoading(false)
    setSearched(false)
  }

  function handleModeSwitch(newMode) {
    setMode(newMode)
  }

  function handleHistoryClick(entry) {
    setClaim(entry.claim)
    handleSearch(entry.claim)
  }

  function clearHistory() {
    localStorage.removeItem('firmo_history')
    setHistory([])
  }

  function handleToggleSave(paper) {
    setSavedPapers(prev => {
      const id = getPaperId(paper)
      const exists = prev.some(p => getPaperId(p) === id)
      const updated = exists
        ? prev.filter(p => getPaperId(p) !== id)
        : [{ ...paper, savedAt: Date.now(), savedClaim: claim }, ...prev]
      localStorage.setItem('firmo_saved', JSON.stringify(updated))
      return updated
    })
  }

  function isSaved(paper) {
    const id = getPaperId(paper)
    return savedPapers.some(p => getPaperId(p) === id)
  }

  function clearSaved() {
    localStorage.removeItem('firmo_saved')
    setSavedPapers([])
  }

  async function handleFindMore() {
    setMoreLoading(true)
    const seenIds = allResults.map(p => p.doi || p.url || (p.title || '').slice(0, 60)).filter(Boolean)
    try {
      const res = await fetch(`${API}/api/more-sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: searchedClaim, year_from: yearFrom, seen_ids: seenIds }),
      })
      const data = await res.json()
      setAllResults(prev => [...prev, ...(data.results || [])])
    } catch {}
    finally { setMoreLoading(false) }
  }

  async function handleAsk() {
    if (!askQuestion.trim() || asking) return
    setAsking(true)
    setAskAnswer(null)
    try {
      const res = await fetch(`${API}/api/ask-sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: askQuestion, claim: searchedClaim, papers: allResults }),
      })
      const data = await res.json()
      setAskAnswer(data.answer)
    } catch {
      setAskAnswer('Could not answer.')
    } finally { setAsking(false) }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
  }

  async function handleEssayCheck(text) {
    if (!text.trim()) return
    setChainLoading(true)
    setChainError('')
    setChainResults(null)
    chainAbortRef.current = new AbortController()
    try {
      const res = await fetch(`${API}/api/claimchain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: chainAbortRef.current.signal,
      })
      if (res.status === 429) {
        const data = await res.json()
        setChainError(data.detail || 'Daily search limit reached. Come back tomorrow!')
        return
      }
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      if (data.corrected_text && data.corrected_text !== text) {
        setEssayText(data.corrected_text)
      }
      setChainResults(data.claims)
    } catch (e) {
      if (e.name !== 'AbortError') setChainError(e.message || 'Something went wrong.')
    } finally {
      setChainLoading(false)
      chainAbortRef.current = null
    }
  }

  function handleCancelEssay() {
    chainAbortRef.current?.abort()
    setChainLoading(false)
  }

  function handleEssayClaim(claimText) {
    setClaim(claimText)
    setFromEssay(true)
    setInputMode('claim')
    handleSearch(claimText)
  }

  function handleBackToEssay() {
    setFromEssay(false)
    setSearched(false)
    setInputMode('essay')
  }

  const SOURCE_LABELS = {
    semantic_scholar: 'Semantic Scholar', crossref: 'CrossRef', pubmed: 'PubMed',
    openalex: 'OpenAlex', europe_pmc: 'Europe PMC', base: 'BASE', arxiv: 'arXiv',
    doaj: 'DOAJ', eric: 'ERIC', zenodo: 'Zenodo', plos: 'PLOS', hal: 'HAL',
    inspire_hep: 'INSPIRE-HEP', fatcat: 'Internet Archive Scholar',
  }

  const activeResults = mode === 'perspectives' ? allPerspectivesResults : allResults
  const activeResponse = mode === 'perspectives' && perspectivesResponse ? perspectivesResponse : response

  const filteredResults = hiddenSources.size === 0
    ? activeResults
    : activeResults.filter(p => !hiddenSources.has(p.source))

  const sourceCounts = activeResults.reduce((acc, p) => {
    if (p.source) acc[p.source] = (acc[p.source] || 0) + 1
    return acc
  }, {})

  function toggleSource(src) {
    setHiddenSources(prev => {
      const next = new Set(prev)
      next.has(src) ? next.delete(src) : next.add(src)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">

      {/* Navbar */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-400 bg-clip-text text-transparent">
              Firmo
            </span>
            <button
              onClick={() => setShowChangelog(true)}
              className="text-xs font-mono text-gray-400 dark:text-gray-600 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
              title="View project progress"
            >v1.3</button>
          </div>
          <div className="flex items-center gap-1">
            {/* Saved papers */}
            <button
              onClick={() => { setShowSaved(s => !s); setShowHistory(false) }}
              className="p-2 rounded-lg text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              aria-label="Saved sources"
              title="Saved sources"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {savedPapers.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
              )}
            </button>

            {searched && !loading && (
              <button
                onClick={handleShare}
                className="p-2 rounded-lg text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Copy share link"
                title="Copy share link"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => { setShowHistory(h => !h); setShowSaved(false) }}
              className="p-2 rounded-lg text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              aria-label="Search history"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {history.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setShowWalkthrough(true)}
              className="p-2 rounded-lg text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="How to use Firmo"
              title="How to use Firmo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </button>
            <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
          </div>
        </div>

        {showHistory && (
          <div className="max-w-3xl mx-auto px-4 pb-3 animate-fadeInUp">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-400 dark:text-gray-500">Recent searches</span>
                {history.length > 0 && (
                  <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-500 transition-colors">Clear</button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400">No history yet.</p>
              ) : (
                <ul>
                  {history.map((entry, i) => (
                    <li key={i}>
                      <button
                        onClick={() => handleHistoryClick(entry)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors flex flex-col gap-0.5"
                      >
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{entry.claim}</span>
                        <span className="text-xs text-gray-400 truncate">{entry.response?.slice(0, 80)}…</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Saved sources panel */}
        {showSaved && (
          <div className="max-w-3xl mx-auto px-4 pb-3 animate-fadeInUp">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Saved sources {savedPapers.length > 0 && `· ${savedPapers.length}`}
                </span>
                {savedPapers.length > 0 && (
                  <button onClick={clearSaved} className="text-xs text-red-400 hover:text-red-500 transition-colors">Clear all</button>
                )}
              </div>
              {savedPapers.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400">No saved sources yet. Click the bookmark on any source to save it.</p>
              ) : (
                <div className="p-3 flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
                  {savedPapers.map((paper, i) => (
                    <div key={getPaperId(paper) || i}>
                      {paper.savedClaim && (
                        <p className="text-xs text-gray-400 dark:text-gray-600 mb-1 px-1 truncate">
                          Saved from: <span className="italic">{paper.savedClaim}</span>
                        </p>
                      )}
                      <SourceCard
                        paper={paper}
                        citationStyle={style}
                        claim={paper.savedClaim || ''}
                        isSaved={true}
                        onToggleSave={handleToggleSave}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-14 pb-20 flex flex-col gap-10">

        {/* Hero */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Is your{' '}
            <span className="bg-gradient-to-r from-brand-600 to-indigo-400 bg-clip-text text-transparent">claim</span>{' '}
            backed by science?
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Paste a claim, essay, or topic — Firmo evaluates it and finds real academic sources.
          </p>
        </div>

        {/* Input mode toggle + search */}
        <div className="flex flex-col gap-3">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 self-start text-xs font-medium">
            <button
              onClick={() => setInputMode('claim')}
              className={`px-3 py-1.5 transition-colors ${inputMode === 'claim' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              Single claim
            </button>
            <button
              onClick={() => setInputMode('essay')}
              className={`px-3 py-1.5 transition-colors ${inputMode === 'essay' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              Essay check
            </button>
            <button
              onClick={() => setInputMode('topic')}
              className={`px-3 py-1.5 transition-colors ${inputMode === 'topic' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              Topic explorer
            </button>
          </div>

          {inputMode === 'claim' ? (
            <SearchBar
              claim={claim}
              onClaimChange={setClaim}
              style={style}
              onStyleChange={setStyle}
              yearFrom={yearFrom}
              onYearFromChange={setYearFrom}
              onSearch={() => handleSearch()}
              onCancel={handleCancel}
              loading={loading}
            />
          ) : inputMode === 'essay' ? (
            <EssayChecker
              text={essayText}
              onTextChange={setEssayText}
              results={chainResults}
              loading={chainLoading}
              error={chainError}
              onCheck={handleEssayCheck}
              onCancel={handleCancelEssay}
              onSearchClaim={handleEssayClaim}
            />
          ) : (
            <TopicSearch
              topic={topicQuery}
              onTopicChange={setTopicQuery}
              style={style}
              onStyleChange={setStyle}
              yearFrom={yearFrom}
              onYearFromChange={setYearFrom}
              onSearch={() => handleTopicSearch()}
              onCancel={handleCancel}
              loading={loading}
            />
          )}
        </div>

        {/* Results — claim and topic modes */}
        {searched && (inputMode === 'claim' || inputMode === 'topic') && (
          <div className="flex flex-col gap-5">

            {/* Back to essay breadcrumb */}
            {fromEssay && chainResults?.length > 0 && (
              <button
                onClick={handleBackToEssay}
                className="self-start flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-600 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to essay results ({chainResults.length} claims)
              </button>
            )}

            {error === 'invalid_claim' ? (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-5 flex flex-col gap-1.5 animate-fadeInUp">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Invalid claim</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Please enter a factual statement or opinion that can be evaluated — not a command, question, or greeting.</p>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/30 p-4 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            ) : null}

            {/* Firmo response */}
            {loading ? (
              <div className="card p-5 flex gap-3">
                <div className="skeleton w-7 h-7 rounded-full shrink-0" />
                <div className="flex flex-col gap-2 flex-1 pt-0.5">
                  <div className="skeleton h-3 w-14" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-5/6" />
                  <div className="skeleton h-3 w-3/4" />
                </div>
              </div>
            ) : (response || perspectivesResponse) ? (
              <>
              <div className="flex flex-col gap-2 animate-fadeInUp">
                {isDebatable && (
                  <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 self-start text-xs font-medium">
                    <button
                      onClick={() => handleModeSwitch('support')}
                      className={`px-3 py-1.5 transition-colors ${mode === 'support' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      Main view
                    </button>
                    <button
                      onClick={() => handleModeSwitch('perspectives')}
                      className={`px-3 py-1.5 transition-colors ${mode === 'perspectives' ? 'bg-violet-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      Other perspectives
                    </button>
                  </div>
                )}

                <div className={`card p-5 flex gap-3 ${mode === 'perspectives' && isDebatable ? 'border-violet-200 dark:border-violet-800/40 bg-violet-50/40 dark:bg-violet-950/10' : ''}`}>
                  <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5 ${mode === 'perspectives' && isDebatable ? 'bg-violet-600' : 'bg-gradient-to-br from-brand-600 to-indigo-400'}`}>
                    F
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <span className={`text-xs font-semibold ${mode === 'perspectives' && isDebatable ? 'text-violet-600 dark:text-violet-400' : 'text-brand-500 dark:text-brand-400'}`}>
                      {inputMode === 'topic' ? 'Topic overview' : mode === 'perspectives' && isDebatable ? 'Other perspectives' : 'Firmo'}
                    </span>
                    <p className="text-gray-800 dark:text-gray-100 leading-relaxed text-sm">
                      {activeResponse}
                    </p>
                    {mode === 'support' && inputMode !== 'topic' && (
                      <StressTestPanel claim={searchedClaim} />
                    )}
                  </div>
                </div>
              </div>

              {/* Related claims / topics chips */}
              {mode === 'support' && relatedClaims.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-400 dark:text-gray-600">{inputMode === 'topic' ? 'Related topics' : 'Related claims'}</span>
                  <div className="flex flex-wrap gap-2">
                    {relatedClaims.map((rc, i) => (
                      <button
                        key={i}
                        onClick={() => inputMode === 'topic' ? (setTopicQuery(rc), handleTopicSearch(rc)) : (setClaim(rc), handleSearch(rc))}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-brand-400 dark:hover:border-brand-600 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      >
                        {rc}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              </>
            ) : null}

            {/* Sources */}
            {loading ? (
              <div className="flex flex-col gap-3">
                <div className="skeleton h-3 w-32" />
                {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <>
                {activeResults.length === 0 && response && (
                  <p className="text-gray-400 dark:text-gray-600 text-sm py-4">
                    No directly relevant sources found — the response above is based on Firmo's knowledge.
                  </p>
                )}

                {activeResults.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400 dark:text-gray-600">
                        {mode === 'perspectives' ? 'Sources exploring other angles' : 'Supporting sources'} · {activeResults.length} found
                        {hiddenSources.size > 0 && <span className="ml-1 text-brand-500">· {filteredResults.length} shown</span>}
                      </p>
                      {mode === 'support' && allResults.length >= 3 && (
                        <SynthesisPanel claim={searchedClaim} papers={allResults} />
                      )}
                    </div>

                    {/* Database filter */}
                    {Object.keys(sourceCounts).length > 1 && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium shrink-0">Filter:</span>
                        {Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).map(([src, count]) => {
                          const hidden = hiddenSources.has(src)
                          return (
                            <button
                              key={src}
                              onClick={() => toggleSource(src)}
                              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all ${
                                hidden
                                  ? 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-700 line-through'
                                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-brand-400 dark:hover:border-brand-600 hover:text-brand-600 dark:hover:text-brand-400'
                              }`}
                            >
                              {SOURCE_LABELS[src] || src}
                              <span className="opacity-60">{count}</span>
                            </button>
                          )
                        })}
                        {hiddenSources.size > 0 && (
                          <button
                            onClick={() => setHiddenSources(new Set())}
                            className="text-[10px] text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium"
                          >
                            Show all
                          </button>
                        )}
                      </div>
                    )}

                    {filteredResults.map((paper, i) => (
                      <SourceCard
                        key={paper.doi || paper.url || i}
                        paper={paper}
                        citationStyle={style}
                        index={i}
                        claim={searchedClaim}
                        isSaved={isSaved(paper)}
                        onToggleSave={handleToggleSave}
                      />
                    ))}

                    {/* Find more sources */}
                    {mode === 'support' && (
                      <button
                        onClick={handleFindMore}
                        disabled={moreLoading}
                        className="btn-secondary w-full py-2.5 text-sm disabled:opacity-40"
                      >
                        {moreLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Finding more sources…
                          </span>
                        ) : 'Find more sources'}
                      </button>
                    )}

                    {/* Ask about sources */}
                    {mode === 'support' && (
                      <div className="flex flex-col gap-2 pt-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={askQuestion}
                            onChange={e => setAskQuestion(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAsk()}
                            placeholder="Ask a question about these sources…"
                            className="flex-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-400 dark:focus:border-brand-600 transition-all"
                          />
                          <button
                            onClick={handleAsk}
                            disabled={!askQuestion.trim() || asking}
                            className="btn-primary text-sm disabled:opacity-40"
                          >
                            {asking ? '…' : 'Ask'}
                          </button>
                        </div>
                        {askAnswer && (
                          <div className="card bg-brand-50/40 dark:bg-brand-950/10 border-brand-200 dark:border-brand-800/40 p-4 flex flex-col gap-1.5 animate-fadeInUp">
                            <span className="text-xs font-semibold text-brand-500 dark:text-brand-400">Answer</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{askAnswer}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 dark:border-gray-800/60 py-6 text-center text-xs text-gray-400 dark:text-gray-600">
        Firmo · Mistral · Semantic Scholar · PubMed · OpenAlex
      </footer>

      {showWalkthrough && <Walkthrough onClose={() => setShowWalkthrough(false)} />}
      {showChangelog && <Changelog onClose={() => setShowChangelog(false)} />}
    </div>
  )
}
