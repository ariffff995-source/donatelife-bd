'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
}

export interface SearchableSelectProps {
  id?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  heightClassName?: string;
}

export default function SearchableSelect({
  id,
  options = [],
  value = '',
  onChange,
  placeholder,
  disabled = false,
  required = false,
  icon,
  heightClassName = 'h-[50px]'
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    width: 0,
    placeAbove: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownEstimatedHeight = 260;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placeAbove = spaceBelow < dropdownEstimatedHeight && spaceAbove > spaceBelow;

    const width = rect.width;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    const top = placeAbove ? rect.top - 6 : rect.bottom + 6;

    setCoords({
      top,
      left,
      width,
      placeAbove,
    });
  }, []);

  // Update position on open, scroll, resize
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 20);

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (buttonRef.current && buttonRef.current.contains(target)) {
        return;
      }
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }
      setIsOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Case-insensitive & compound string value matching
  const cleanValue = value ? String(value).split('|')[0].trim().toLowerCase() : '';

  const selectedOption = options.find(opt => opt && opt.value === value) ||
    options.find(opt => opt && String(opt.value).toLowerCase() === String(value).toLowerCase()) ||
    options.find(opt => opt && opt.label === value) ||
    options.find(opt => opt && String(opt.label).toLowerCase() === String(value).toLowerCase()) ||
    options.find(opt => {
      if (!opt || !cleanValue) return false;
      const optCleanVal = String(opt.value).split('|')[0].trim().toLowerCase();
      const optCleanLabel = String(opt.label).split('|')[0].trim().toLowerCase();
      return optCleanVal === cleanValue || optCleanLabel === cleanValue;
    });

  const filteredOptions = options.filter(opt => {
    if (!opt) return false;
    const label = opt.label ? String(opt.label).toLowerCase() : '';
    const val = opt.value ? String(opt.value).toLowerCase() : '';
    const q = search.toLowerCase().trim();
    return label.includes(q) || val.includes(q);
  });

  // Reset focus index when search changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [search]);

  // Auto-scroll focused option into view during keyboard navigation
  useEffect(() => {
    if (isOpen && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [focusedIndex, isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  const handleToggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        updatePosition();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[focusedIndex]) {
        handleSelect(filteredOptions[focusedIndex].value);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  return (
    <div 
      className="relative w-full text-left" 
      ref={containerRef} 
      id={id ? `${id}-container` : undefined}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input for HTML form validation */}
      {required && (
        <input
          type="text"
          value={value}
          readOnly
          required
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 w-full h-0 opacity-0 pointer-events-none"
        />
      )}

      {/* Dropdown Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggleOpen}
        disabled={disabled}
        className={`w-full min-w-0 ${heightClassName} flex items-center justify-between bg-slate-900/70 text-slate-100 rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 outline-none focus:outline-none transition-all duration-200 backdrop-blur-xl shadow-inner shadow-slate-950/40 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs sm:text-sm text-left cursor-pointer group ${
          isOpen
            ? 'border border-rose-500/80 ring-2 ring-rose-500/20 bg-slate-900/90 shadow-rose-950/20'
            : 'border border-slate-750/70 hover:border-rose-500/40 hover:bg-slate-900/85 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 pr-1.5 sm:pr-2">
          {icon && <span className="shrink-0 text-rose-400 group-hover:scale-110 transition-transform duration-200">{icon}</span>}
          <span className={selectedOption ? 'text-slate-100 font-bold truncate' : 'text-slate-400/90 font-medium truncate'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-rose-400' : 'group-hover:text-slate-200'}`} />
      </button>

      {/* Dropdown Panel Portal */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            ...(coords.placeAbove
              ? { bottom: `${window.innerHeight - coords.top}px` }
              : { top: `${coords.top}px` }),
            zIndex: 99999,
          }}
          className="bg-slate-950/95 border border-slate-700/80 rounded-2xl shadow-2xl shadow-slate-950/90 backdrop-blur-2xl overflow-hidden ring-1 ring-white/10 animate-in fade-in-50 zoom-in-95 max-h-64 flex flex-col font-sans pointer-events-auto"
          id={id ? `${id}-dropdown-portal` : undefined}
          role="listbox"
        >
          {/* Search Input Box */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-slate-800/80 bg-slate-900/60 shrink-0">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 text-sm outline-none focus:ring-0 py-0.5 font-medium"
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto flex-1 p-1.5 max-h-48 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value || (selectedOption && opt.value === selectedOption.value);
                const isFocused = idx === focusedIndex;

                return (
                  <button
                    key={opt.value || idx}
                    ref={el => { optionRefs.current[idx] = el; }}
                    type="button"
                    onMouseDown={(e) => {
                      // Prevent focus loss from search input before click handler fires
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(opt.value);
                    }}
                    className={`w-full px-3 py-2.5 my-0.5 text-sm rounded-xl flex items-center justify-between text-left transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40'
                        : isFocused
                        ? 'bg-rose-500/10 text-rose-200 border border-rose-500/20'
                        : 'text-slate-300 font-medium hover:bg-rose-500/10 hover:text-rose-100'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="truncate pr-2">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-xs text-slate-400 text-center font-medium">
                No matches found
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
