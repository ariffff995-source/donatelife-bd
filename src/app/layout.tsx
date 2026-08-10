import type { Metadata } from 'next';
import { Inter, Hind_Siliguri, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/src/providers';
import PageShell from '@/src/page-shell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  variable: '--font-bn',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'DonateLife BD | Emergency Blood Network Bangladesh',
    template: '%s | DonateLife BD',
  },
  description:
    'Connect with voluntary blood donors across 64 districts in Bangladesh. Post emergency blood requests, locate blood banks, hospitals, and ambulance services 24/7.',
  keywords: [
    'blood donor bangladesh',
    'emergency blood request bd',
    'blood group search dhaka',
    'blood bank directory bangladesh',
    'ambulance service bd',
    'voluntary blood donor',
    'DonateLife BD',
  ],
  authors: [{ name: 'DonateLife BD Team' }],
  creator: 'DonateLife BD',
  publisher: 'DonateLife BD',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://donatelifebd.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'DonateLife BD | Emergency Blood Network Bangladesh',
    description:
      'Find voluntary blood donors across 64 districts and all upazilas in Bangladesh. Instant search, 24/7 emergency blood requests & helpline.',
    url: 'https://donatelifebd.com',
    siteName: 'DonateLife BD',
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DonateLife BD | Emergency Blood Network Bangladesh',
    description:
      'Find voluntary blood donors across 64 districts and all upazilas in Bangladesh.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalOrganization',
  name: 'DonateLife BD',
  url: 'https://donatelifebd.com',
  logo: 'https://donatelifebd.com/favicon.svg',
  description: 'Emergency Blood Donation & Voluntary Donor Network in Bangladesh',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'BD',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+880-1700-000000',
    contactType: 'Emergency Blood Hotline',
    availableLanguage: ['English', 'Bengali'],
  },
};

import { cookies } from 'next/headers';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const savedLang = cookieStore.get('donatelife_lang')?.value;
  const initialLanguage = (savedLang === 'en' || savedLang === 'bn') ? savedLang : 'bn';

  return (
    <html lang={initialLanguage} className={`${inter.variable} ${hindSiliguri.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className="bg-slate-950 text-slate-100 font-sans antialiased selection:bg-rose-500 selection:text-white">
        <Providers initialLanguage={initialLanguage}>
          <PageShell>{children}</PageShell>
        </Providers>
      </body>
    </html>
  );
}
