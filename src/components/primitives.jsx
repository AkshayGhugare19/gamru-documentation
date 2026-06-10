import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { AUTH } from '../data/endpoints'

const METHOD_STYLES = {
  GET: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  POST: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  PATCH: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  DELETE: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
}

export function MethodBadge({ method, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-bold tracking-wide ${
        METHOD_STYLES[method] || 'bg-slate-100 text-slate-700'
      } ${className}`}
    >
      {method}
    </span>
  )
}

const AUTH_STYLES = {
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
}

export function AuthBadge({ auth }) {
  const a = AUTH[auth] || AUTH.none
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${AUTH_STYLES[a.color]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {a.label}
    </span>
  )
}

export function CodeBlock({ code, label }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
      {label && (
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
          <span className="font-mono text-xs uppercase tracking-wider text-slate-400">{label}</span>
        </div>
      )}
      <button
        onClick={copy}
        className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800/80 px-2 py-1 text-xs text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-slate-700"
        style={label ? { top: '0.65rem' } : {}}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-slate-200">{code}</code>
      </pre>
    </div>
  )
}

export function FieldTable({ title, fields }) {
  if (!fields || !fields.length) return null
  return (
    <div className="mt-4">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</h4>
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {fields.map((f) => (
              <tr key={f.name} className="align-top">
                <td className="w-1/3 whitespace-nowrap px-3 py-2 font-mono text-[13px] text-brand-700 dark:text-brand-300">
                  {f.name}
                  {f.required && <span className="ml-1 text-rose-500" title="required">*</span>}
                </td>
                <td className="w-1/4 px-3 py-2 font-mono text-xs text-slate-500 dark:text-slate-400">{f.type}</td>
                <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{f.desc || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Pill({ children, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>
}
