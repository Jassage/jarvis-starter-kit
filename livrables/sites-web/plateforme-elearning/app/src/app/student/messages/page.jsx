'use client';

import { Suspense } from 'react';
import MessagesView from '@/components/MessagesView';

export default function StudentMessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesView role="student" />
    </Suspense>
  );
}
