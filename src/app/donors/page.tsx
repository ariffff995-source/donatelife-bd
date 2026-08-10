import React from 'react';
import DonorsView from '@/src/views/DonorsView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Donors Directory | DonateLife BD',
  description: 'Browse verified volunteer blood donors across all divisions and districts in Bangladesh.',
};

export default function DonorsPage() {
  return <DonorsView />;
}
