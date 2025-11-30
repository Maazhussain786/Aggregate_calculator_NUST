'use client';

import { useState, useMemo, useCallback } from 'react';

export interface Program {
  id: string;
  name: string;
  code: string;
  campus: string;
  school: string;
  disciplineGroup: string;
  degreeType: string;
  seats?: number | null;
}

interface ProgramSelectorProps {
  programs: Program[];
  selectedProgram: Program | null;
  onSelect: (program: Program | null) => void;
  label?: string;
  placeholder?: string;
}

export default function ProgramSelector({
  programs,
  selectedProgram,
  onSelect,
  label = 'Select Program',
  placeholder = 'Search or select a program...',
}: ProgramSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampus, setSelectedCampus] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');

  // Get unique campuses and schools
  const campuses = useMemo(() => 
    [...new Set(programs.map(p => p.campus))].sort(),
    [programs]
  );
  
  const schools = useMemo(() => {
    const filtered = selectedCampus 
      ? programs.filter(p => p.campus === selectedCampus)
      : programs;
    return [...new Set(filtered.map(p => p.school))].sort();
  }, [programs, selectedCampus]);

  // Filter programs
  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchesSearch = !searchTerm || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCampus = !selectedCampus || p.campus === selectedCampus;
      const matchesSchool = !selectedSchool || p.school === selectedSchool;
      return matchesSearch && matchesCampus && matchesSchool;
    });
  }, [programs, searchTerm, selectedCampus, selectedSchool]);

  const handleSelect = useCallback((program: Program) => {
    onSelect(program);
    setIsOpen(false);
    setSearchTerm('');
  }, [onSelect]);

  const handleClear = useCallback(() => {
    onSelect(null);
    setSearchTerm('');
    setSelectedCampus('');
    setSelectedSchool('');
  }, [onSelect]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-[var(--text-primary)]">{label}</label>
      
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          value={selectedCampus}
          onChange={(e) => {
            setSelectedCampus(e.target.value);
            setSelectedSchool('');
            setSelectedProgram(null);
          }}
          className="input"
          aria-label="Filter by campus"
        >
          <option value="">All Campuses</option>
          {campuses.map(campus => (
            <option key={campus} value={campus}>{campus}</option>
          ))}
        </select>

        <select
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          className="input"
          aria-label="Filter by school"
        >
          <option value="">All Schools</option>
          {schools.map(school => (
            <option key={school} value={school}>{school}</option>
          ))}
        </select>
      </div>

      {/* Selected Program or Dropdown */}
      <div className="relative">
        {selectedProgram ? (
          <div className="flex items-center justify-between p-4 bg-[var(--accent-light)] border border-[var(--accent-primary)] rounded-lg">
            <div>
              <p className="font-medium text-[var(--text-primary)]">{selectedProgram.name}</p>
              <p className="text-sm text-[var(--text-muted)]">
                {selectedProgram.campus} • {selectedProgram.school}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Clear selection"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="input"
            />
            
            {isOpen && (
              <div className="absolute z-10 w-full mt-2 card shadow-lg max-h-64 overflow-y-auto">
                {filteredPrograms.length === 0 ? (
                  <div className="p-4 text-center text-[var(--text-muted)]">
                    No programs found
                  </div>
                ) : (
                  filteredPrograms.map(program => (
                    <button
                      key={program.id}
                      type="button"
                      onClick={() => handleSelect(program)}
                      className="w-full text-left px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border-color)] last:border-0"
                    >
                      <p className="font-medium text-[var(--text-primary)]">{program.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {program.campus} • {program.school} • {program.code}
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Close dropdown on click outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
