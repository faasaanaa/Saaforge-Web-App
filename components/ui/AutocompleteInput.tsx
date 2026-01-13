'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface AutocompleteInputProps {
  label: string;
  value: string[];
  onChange: (values: string[]) => void;
  suggestions: string[];
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function AutocompleteInput({
  label,
  value,
  onChange,
  suggestions,
  placeholder,
  helperText,
  required = false,
  error,
  className = '',
}: AutocompleteInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const suggestionRef = useRef<HTMLDivElement | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<{ left: number; top: number; width: number } | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        !(suggestionRef.current && suggestionRef.current.contains(target))
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateDropdownPosition = () => {
    const el = inputRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDropdownStyle({ left: rect.left + window.scrollX, top: rect.bottom + window.scrollY, width: rect.width });
  };

  useEffect(() => {
    if (showSuggestions) updateDropdownPosition();
    const onResize = () => showSuggestions && updateDropdownPosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [showSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputValue(input);

    if (input.trim()) {
      const filtered = suggestions.filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(input.toLowerCase()) &&
          !value.includes(suggestion)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleAddValue = (selectedValue: string) => {
    if (!value.includes(selectedValue)) {
      onChange([...value, selectedValue]);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleRemoveValue = (valueToRemove: string) => {
    onChange(value.filter((v) => v !== valueToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const exactMatch = suggestions.find(
        (s) => s.toLowerCase() === inputValue.toLowerCase()
      );
      if (exactMatch) {
        handleAddValue(exactMatch);
      } else if (filteredSuggestions.length > 0) {
        handleAddValue(filteredSuggestions[0]);
      } else {
        // Add custom value
        handleAddValue(inputValue.trim());
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last item when backspace on empty input
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-200">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <div ref={wrapperRef} className="relative">
        {/* Selected values as oval cards */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {value.map((val, index) => (
              <div
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800 text-gray-200 text-sm font-medium border border-gray-700"
              >
                {val}
                <button
                  type="button"
                  onClick={() => handleRemoveValue(val)}
                  className="ml-2 hover:text-white focus:outline-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && setShowSuggestions(true)}
          placeholder={placeholder}
          className={`w-full px-4 py-2 rounded-lg border bg-gray-950 text-gray-100 placeholder:text-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all ${error ? 'border-red-500' : 'border-gray-700'} ${className}`}
        />
        {/* Suggestions dropdown rendered in a portal so it's not clipped by parent overflow */}
        {showSuggestions && dropdownStyle && filteredSuggestions.length > 0 && createPortal(
          <div ref={suggestionRef} style={{ position: 'absolute', left: dropdownStyle.left, top: dropdownStyle.top, width: dropdownStyle.width }} className="z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAddValue(suggestion)}
                  className="w-full text-left px-4 py-2 text-gray-100 hover:bg-gray-800 focus:bg-gray-800 focus:outline-none transition-colors"
                >
                  {suggestion}
                </button>
              ))}
              {filteredSuggestions.length > 0 && inputValue.trim() && (
                <button
                  type="button"
                  onClick={() => handleAddValue(inputValue.trim())}
                  className="w-full text-left px-4 py-2 border-t border-gray-700 text-gray-300 hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
                >
                  Add "{inputValue.trim()}" (Other)
                </button>
              )}
            </div>
          </div>,
          document.body
        )}

        {showSuggestions && dropdownStyle && filteredSuggestions.length === 0 && inputValue.trim() && createPortal(
          <div ref={suggestionRef} style={{ position: 'absolute', left: dropdownStyle.left, top: dropdownStyle.top, width: dropdownStyle.width }} className="z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
              <button
                type="button"
                onClick={() => handleAddValue(inputValue.trim())}
                className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
              >
                Add "{inputValue.trim()}" (Other)
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>

      {error ? (
        <p className="text-sm text-red-400 mt-1">{error}</p>
      ) : (
        helperText && <p className="text-sm text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
