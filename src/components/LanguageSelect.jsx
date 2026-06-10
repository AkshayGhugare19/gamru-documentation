import { useEffect, useState } from 'react'
import { Languages } from 'lucide-react'

// Languages offered in the dropdown. `code` must match a Google Translate code.
const LANGUAGES = [
  { code: 'en', label: 'English' },
  // { code: 'hi', label: 'हिन्दी (Hindi)' },
  // { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'es', label: 'Español (Spanish)' },
  { code: 'pt', label: 'Português (Portuguese)' },
  { code: 'zh-CN', label: '中文 (Chinese)' },
  { code: 'ko', label: '한국어 (Korean)' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'ar', label: 'العربية (Arabic)' },
]

const INCLUDED = LANGUAGES.map((l) => l.code).join(',')

// Read the language currently set in the googtrans cookie (form: "/en/hi").
function currentLang() {
  const m = typeof document !== 'undefined' && document.cookie.match(/googtrans=\/[^/]*\/([^;]+)/)
  return (m && m[1]) || 'en'
}

// Load the Google Translate widget once and mount it on a hidden host element.
function useGoogleTranslate() {
  useEffect(() => {
    if (window.__gtLoaded) return
    window.__gtLoaded = true
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', includedLanguages: INCLUDED, autoDisplay: false },
        'google_translate_host',
      )
    }
    const s = document.createElement('script')
    s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    document.body.appendChild(s)
  }, [])
}

export default function LanguageSelect() {
  useGoogleTranslate()
  const [lang, setLang] = useState(currentLang)

  function change(code) {
    setLang(code)
    // Set the cookie Google Translate reads, then reload so the whole page re-translates.
    const host = window.location.hostname
    const value = `/en/${code}`
    document.cookie = `googtrans=${value};path=/`
    if (host) {
      document.cookie = `googtrans=${value};path=/;domain=${host}`
      document.cookie = `googtrans=${value};path=/;domain=.${host}`
    }
    window.location.reload()
  }

  return (
    <div className="relative inline-flex items-center">
      <Languages
        size={15}
        className="pointer-events-none absolute left-2.5 text-slate-500 dark:text-slate-400"
      />
      <select
        value={lang}
        onChange={(e) => change(e.target.value)}
        aria-label="Select language"
        className="appearance-none rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      {/* Hidden host that Google Translate mounts into. */}
      <div id="google_translate_host" className="hidden" />
    </div>
  )
}
