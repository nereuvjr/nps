'use client';

import { useEffect } from 'react';
import formbricks from './formbricks';

export default function RootLayout({ children }) {
  useEffect(() => {
    formbricks.init();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
