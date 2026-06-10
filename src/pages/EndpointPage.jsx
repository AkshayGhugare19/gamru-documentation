import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react'
import { ENDPOINTS, endpointById } from '../data/endpoints'
import { PLATFORM_META } from './ApiPage'
import EndpointCard from '../components/EndpointCard'

export default function EndpointPage() {
  const { platform, id } = useParams()
  const ep = endpointById(id)

  // Guard against bad links / mismatched platform.
  if (!ep || ep.platform !== platform) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Endpoint not found</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">This endpoint doesn’t exist or has moved.</p>
        <Link to={`/api/${platform || 'gamru'}`} className="mt-6 inline-flex items-center gap-1.5 text-brand-600 hover:underline dark:text-brand-400">
          <ArrowLeft size={15} /> Back to API reference
        </Link>
      </div>
    )
  }

  const meta = PLATFORM_META[platform]
  const siblings = ENDPOINTS.filter((e) => e.platform === platform)
  const idx = siblings.findIndex((e) => e.id === id)
  const prev = siblings[idx - 1]
  const next = siblings[idx + 1]

  return (
    <div>
      {/* breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        <Link to={`/api/${platform}`} className="transition hover:text-brand-600 dark:hover:text-brand-400">
          {meta.title}
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <span>{ep.group}</span>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="font-medium text-slate-700 dark:text-slate-200">{ep.title}</span>
      </nav>

      <EndpointCard ep={ep} />

      {/* prev / next navigation within the same platform */}
      <div className="mt-12 grid gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:grid-cols-2">
        {prev ? (
          <Link
            to={`/api/${platform}/${prev.id}`}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-brand-300 hover:shadow-sm dark:border-slate-800 dark:hover:border-brand-500/40"
          >
            <ArrowLeft size={18} className="shrink-0 text-slate-400 transition group-hover:-translate-x-0.5 group-hover:text-brand-600" />
            <span className="min-w-0">
              <span className="block text-xs uppercase tracking-wider text-slate-400">Previous</span>
              <span className="truncate font-medium text-slate-800 dark:text-slate-100">{prev.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/api/${platform}/${next.id}`}
            className="group flex items-center justify-end gap-3 rounded-xl border border-slate-200 p-4 text-right transition hover:border-brand-300 hover:shadow-sm dark:border-slate-800 dark:hover:border-brand-500/40"
          >
            <span className="min-w-0">
              <span className="block text-xs uppercase tracking-wider text-slate-400">Next</span>
              <span className="truncate font-medium text-slate-800 dark:text-slate-100">{next.title}</span>
            </span>
            <ArrowRight size={18} className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  )
}
