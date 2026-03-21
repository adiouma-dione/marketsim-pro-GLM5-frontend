'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function TeacherIndexPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/teacher/sessions');
  }, [router]);

  return null;
}
