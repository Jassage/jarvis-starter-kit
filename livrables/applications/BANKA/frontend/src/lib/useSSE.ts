'use client';
import { useEffect, useRef, useCallback } from 'react';

export type SSEEventType =
  | 'TRANSACTION_EN_ATTENTE'
  | 'TRANSACTION_VALIDEE'
  | 'TRANSACTION_REJETEE'
  | 'ALERTE_AML'
  | 'ECHEANCE_RETARD'
  | 'CAISSE_FERMEE'
  | 'CONNECTED';

export interface SSEMessage {
  type: SSEEventType;
  data: Record<string, unknown>;
}

type SSEHandler = (message: SSEMessage) => void;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
const RECONNECT_DELAY = 5000;
const MAX_RECONNECT = 10;

export function useSSE(onMessage: SSEHandler, enabled = true) {
  const esRef = useRef<EventSource | null>(null);
  const reconnectCount = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  const connect = useCallback(() => {
    if (!enabled) return;
    const token = localStorage.getItem('banka_token');
    if (!token) return;

    const url = `${API_URL}/sse?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const msg: SSEMessage = JSON.parse(e.data);
        handlerRef.current(msg);
      } catch { /* ignore malformed */ }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      if (reconnectCount.current < MAX_RECONNECT) {
        reconnectCount.current++;
        timerRef.current = setTimeout(connect, RECONNECT_DELAY * Math.min(reconnectCount.current, 3));
      }
    };

    es.onopen = () => { reconnectCount.current = 0; };
  }, [enabled]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [connect]);
}
