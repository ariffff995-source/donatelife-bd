import { Metadata } from 'next';
import AdminLoginPageClient from './AdminLoginPageClient';

export const metadata: Metadata = {
  title: 'Admin Login | DonateLife BD',
  description: 'Restricted administrative login portal for DonateLife BD.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return <AdminLoginPageClient />;
}
