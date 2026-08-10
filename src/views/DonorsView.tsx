'use client';

import React from 'react';
import { useAppContext } from '../providers';
import SearchView from './SearchView';

export default function DonorsView() {
  const { currentUser } = useAppContext();

  return (
    <div className="space-y-6">
      <SearchView currentUser={currentUser} />
    </div>
  );
}
