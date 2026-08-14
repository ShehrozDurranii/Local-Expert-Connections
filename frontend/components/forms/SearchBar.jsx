'use client';

import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/foundation/Button';

export function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ query, city });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-background-primary rounded-xl border border-border shadow-lg max-w-2xl w-full"
    >
      <div className="flex items-center gap-2 px-3 py-2 w-full flex-1 border-b sm:border-b-0 sm:border-r border-border">
        <Search className="w-5 h-5 text-text-muted shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search inspection, verification, or service..."
          className="w-full text-sm bg-transparent text-text-primary focus:outline-none placeholder:text-text-disabled"
        />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 w-full sm:w-48 shrink-0">
        <MapPin className="w-5 h-5 text-text-muted shrink-0" />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City (e.g. Lahore)"
          className="w-full text-sm bg-transparent text-text-primary focus:outline-none placeholder:text-text-disabled"
        />
      </div>

      <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto shrink-0">
        Search
      </Button>
    </form>
  );
}
