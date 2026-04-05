const STYLES = ['apa', 'mla', 'chicago']

const YEAR_OPTIONS = [
  { label: 'Any year', value: null },
  { label: 'After 1970', value: 1970 },
  { label: 'After 1980', value: 1980 },
  { label: 'After 1990', value: 1990 },
  { label: 'After 2000', value: 2000 },
  { label: 'After 2010', value: 2010 },
  { label: 'After 2015', value: 2015 },
  { label: 'After 2020', value: 2020 },
]

export default function TopicSearch({ topic, onTopicChange, style, onStyleChange, yearFrom, onYearFromChange, onSearch, onCancel, loading }) {
  function handleKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSearch()
    }
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {loading && (
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600 mb-1">
          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Searching across databases…
        </div>
      )}
      <input
        type="text"
        value={topic}
        onChange={e => onTopicChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder="e.g. 'CRISPR gene editing', 'sleep deprivation', 'microplastics'"
        className="w-full rounded-xl
          border border-gray-200 dark:border-gray-800
          bg-white dark:bg-gray-900
          text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600
          px-4 py-3 text-sm
          focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-400 dark:focus:border-brand-600
          transition-all duration-150"
      />

      <div className="flex items-center gap-2">
        {/* Citation style */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 text-xs font-medium">
          {STYLES.map(s => (
            <button
              key={s}
              onClick={() => onStyleChange(s)}
              className={`px-3 py-1.5 uppercase transition-colors ${
                style === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Year filter */}
        <select
          value={yearFrom ?? ''}
          onChange={e => onYearFromChange(e.target.value ? parseInt(e.target.value) : null)}
          className="text-xs font-medium px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800
            bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-500
            hover:text-gray-800 dark:hover:text-gray-200
            focus:outline-none focus:ring-2 focus:ring-brand-500/50
            transition-colors cursor-pointer"
        >
          {YEAR_OPTIONS.map(opt => (
            <option key={opt.value ?? 'any'} value={opt.value ?? ''}>
              {opt.label}
            </option>
          ))}
        </select>

        {loading ? (
          <button
            onClick={onCancel}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-red-300 hover:text-red-500 dark:hover:border-red-700 dark:hover:text-red-400 text-sm font-medium transition-all duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        ) : (
          <button
            onClick={onSearch}
            disabled={!topic.trim()}
            className="ml-auto btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            Explore Topic
          </button>
        )}
      </div>
    </div>
  )
}
