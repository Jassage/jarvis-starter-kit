'use client';

import { Suspense } from 'react';
import MessagesView from '@/components/MessagesView';

export default function TeacherMessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesView role="teacher" />
    </Suspense>
  );
}
