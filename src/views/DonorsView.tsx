'use client';

import React from 'react';
import { useAppContext } from '../providers';
import PublicDonorDirectoryView from './PublicDonorDirectoryView';

export default function DonorsView() {
  const { currentUser } = useAppContext();

  return (
    <div className="space-y-6">
      <PublicDonorDirectoryView currentUser={currentUser} />
    </div>
  );
}
