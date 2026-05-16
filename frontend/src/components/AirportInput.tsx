import { useState, useEffect, useRef } from 'react'
import client from '../api/client'

interface Airport {
  code: string
  city: string
  label: string
}

interface AirportInputProps {
  id: string
  value: string
  onChange: (code: string) => void
  placeholder: string
  excludeCode?: string
}

export default function AirportInput({ id, value, onChange, placeholder, excludeCode }: AirportInputProps) {
  const [allAirports, setAllAirports] = useState<Airport[]>([])
  const [filtered, setFiltered] = useState<Airport[]>([])
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [query, setQuery] = useState(value)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    client.get<Airport[]>('/airports')
      .then(res => setAllAirports(res.data))
      .catch(() => setAllAirports([]))
  }, [])

  useEffect(() => {
    const exclude = excludeCode || ''
    const list = exclude
      ? allAirports.filter(a => a.code !== exclude)
      : allAirports
    setFiltered(list)
  }, [allAirports, excludeCode])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedAirport = allAirports.find(a => a.code === value)

  const handleOpen = () => {
    setHighlightedIndex(-1)
    setOpen(true)
  }

  const handleSelect = (airport: Airport) => {
    setQuery(airport.code)
    onChange(airport.code)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault()
        handleOpen()
        return
      }
      if (e.key.length === 1) {
        const idx = filtered.findIndex(a => a.code.startsWith(e.key.toUpperCase()))
        if (idx >= 0) {
          e.preventDefault()
          setHighlightedIndex(idx)
          handleOpen()
        }
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0) {
        handleSelect(filtered[highlightedIndex])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'Tab') {
      setOpen(false)
    } else if (e.key.length === 1) {
      const idx = filtered.findIndex(
        (a, i) => i > highlightedIndex && a.code.startsWith(e.key.toUpperCase())
      )
      if (idx >= 0) {
        setHighlightedIndex(idx)
        requestAnimationFrame(() => {
          const el = document.getElementById(`${id}-option-${idx}`)
          el?.scrollIntoView({ block: 'nearest' })
        })
      }
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        readOnly
        value={selectedAirport ? selectedAirport.label : query || ''}
        onClick={handleOpen}
        onFocus={handleOpen}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer bg-white"
      />
      {value && !open && (
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={e => { e.stopPropagation(); onChange(''); setQuery(''); setOpen(false) }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm leading-none"
        >
          ✕
        </button>
      )}
      {open && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((airport, i) => (
            <li
              key={airport.code}
              id={`${id}-option-${i}`}
              onMouseDown={e => { e.preventDefault(); handleSelect(airport) }}
              onMouseEnter={() => setHighlightedIndex(i)}
              className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between ${
                value === airport.code
                  ? 'bg-primary/10 text-primary font-semibold'
                  : i === highlightedIndex
                  ? 'bg-gray-100 text-gray-800'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="font-semibold">{airport.code}</span>
              <span className="text-gray-400 text-xs ml-2">{airport.city}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
