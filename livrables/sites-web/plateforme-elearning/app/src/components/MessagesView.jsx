'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Icon from './Icon';
import AppShell from './AppShell';
import { useGo } from '@/lib/navigation';
import { timeAgo } from '@/lib/time';

export default function MessagesView({ role }) {
  const go = useGo();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeId, setActiveId] = useState(searchParams.get('c') || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadConversations = useCallback(() => {
    fetch('/api/messages/conversations').then(r => r.json()).then(data => {
      const list = Array.isArray(data) ? data : [];
      setConversations(list);
      setLoadingList(false);
      if (!activeId && list.length > 0) setActiveId(list[0].id);
    }).catch(() => setLoadingList(false));
  }, [activeId]);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 25000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  useEffect(() => {
    const c = searchParams.get('c');
    if (c) setActiveId(c);
  }, [searchParams]);

  const loadMessages = useCallback((id) => {
    fetch(`/api/messages/conversations/${id}/messages`).then(r => r.json()).then(data => {
      setMessages(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    fetch(`/api/messages/conversations/${activeId}/read`, { method: 'PATCH' }).catch(() => {});
    const interval = setInterval(() => loadMessages(activeId), 4000);
    return () => clearInterval(interval);
  }, [activeId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!text.trim() || !activeId) return;
    setSending(true);
    const body = text.trim();
    setText('');
    try {
      const r = await fetch(`/api/messages/conversations/${activeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      if (r.ok) {
        const msg = await r.json();
        setMessages(prev => [...prev, msg]);
        loadConversations();
      }
    } catch {
      // silencieux
    } finally {
      setSending(false);
    }
  }

  const active = conversations.find(c => c.id === activeId);

  return (
    <AppShell role={role} active={role === 'teacher' ? 'tmessages' : 'messages'} go={go} search={false}
      title="Messages" subtitle="Échange avec tes étudiants et formateurs.">
      <div className="card" style={{ overflow: 'hidden', display: 'flex', height: 'calc(100vh - 180px)', minHeight: 420 }}>
        {/* Liste des conversations */}
        <div className="col" style={{ width: 280, flexShrink: 0, borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <h3 className="h4">Conversations</h3>
          </div>
          <div className="col scroll-y" style={{ flex: 1 }}>
            {loadingList ? (
              <div className="small muted" style={{ padding: 20, textAlign: 'center' }}>Chargement…</div>
            ) : conversations.length === 0 ? (
              <div className="small muted" style={{ padding: 20, textAlign: 'center' }}>Aucune conversation pour l'instant.</div>
            ) : conversations.map(c => (
              <button key={c.id}
                className={'edu-nav-item' + (activeId === c.id ? ' is-active' : '')}
                style={{ borderRadius: 0, padding: '12px 16px', height: 'auto', justifyContent: 'flex-start' }}
                onClick={() => { setActiveId(c.id); router.replace(`?c=${c.id}`); }}>
                <div className="avatar avatar-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand-ink)', flexShrink: 0 }}>
                  {(c.otherUser?.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div className="col" style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                  <span style={{ fontWeight: 650, fontSize: 13.5 }}>{c.otherUser?.name || 'Utilisateur'}</span>
                  <span className="tiny muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: 160 }}>
                    {c.lastMessage?.body || 'Nouvelle conversation'}
                  </span>
                </div>
                {c.unreadCount > 0 && <span className="edu-nav-badge">{c.unreadCount}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Fil de discussion */}
        <div className="col" style={{ flex: 1, minWidth: 0 }}>
          {!active ? (
            <div className="col" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)' }}>
              Sélectionne une conversation
            </div>
          ) : (
            <>
              <div className="row gap-10" style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                <div className="avatar avatar-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand-ink)' }}>
                  {(active.otherUser?.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <span style={{ fontWeight: 700 }}>{active.otherUser?.name}</span>
              </div>

              <div className="col gap-10 scroll-y" style={{ flex: 1, padding: '16px 18px' }}>
                {messages.length === 0 ? (
                  <div className="small muted" style={{ textAlign: 'center', paddingTop: 20 }}>Aucun message. Dis bonjour !</div>
                ) : messages.map(m => {
                  const mine = m.senderId === session?.user?.id;
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '70%', padding: '9px 13px', borderRadius: 14,
                        background: mine ? 'var(--brand)' : 'var(--bg-2)',
                        color: mine ? '#fff' : 'var(--ink)',
                      }}>
                        <div style={{ fontSize: 13.5 }}>{m.body}</div>
                        <div className="tiny" style={{ marginTop: 3, opacity: 0.7 }}>{timeAgo(m.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="row gap-10" style={{ padding: '14px 18px', borderTop: '1px solid var(--border)' }}>
                <input className="input" placeholder="Écris un message…" value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  style={{ flex: 1 }} />
                <button className="btn btn-primary btn-icon" disabled={sending || !text.trim()} onClick={sendMessage} aria-label="Envoyer">
                  <Icon name="send" size={17} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
