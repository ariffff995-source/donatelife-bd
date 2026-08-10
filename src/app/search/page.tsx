'use client';

import { Suspense } from 'react';
import SearchView from '@/src/views/SearchView';
import { useAppContext } from '@/src/providers';

function SearchContent() {
  const { currentUser, searchFilters, setSearchFilters } = useAppContext();

  return (
    <SearchView
      currentUser={currentUser}
      initialFilters={searchFilters}
      onFiltersChange={setSearchFilters}
    />
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
