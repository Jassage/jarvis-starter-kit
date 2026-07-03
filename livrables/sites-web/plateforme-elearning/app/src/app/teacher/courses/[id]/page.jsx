'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Icon from '@/components/Icon';
import AppShell from '@/components/AppShell';
import { useGo } from '@/lib/navigation';

const LESSON_TYPES = [
  { value: 'VIDEO', label: 'Vidéo', icon: 'video' },
  { value: 'PDF', label: 'PDF', icon: 'pdf' },
  { value: 'QUIZ', label: 'Quiz', icon: 'quiz' },
  { value: 'PROJECT', label: 'Projet', icon: 'briefcase' },
];

const EMPTY_LESSON = { title: '', type: 'VIDEO', duration: '' };
const UPLOAD_TYPES = ['VIDEO', 'PDF'];

function typeIcon(type) { return LESSON_TYPES.find(t => t.value === type)?.icon || 'play'; }
function typeLabel(type) { return LESSON_TYPES.find(t => t.value === type)?.label || type; }
function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' o';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' Ko';
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
}

function acceptAttr(type) {
  if (type === 'VIDEO') return 'video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska';
  if (type === 'PDF') return 'application/pdf';
  return '';
}

export default function CourseContentPage() {
  const params = useParams();
  const router = useRouter();
  const go = useGo();
  const courseId = params.id;

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [editingModule, setEditingModule] = useState(null);

  const [addingLesson, setAddingLesson] = useState(null);
  const [newLesson, setNewLesson] = useState(EMPTY_LESSON);
  const [editingLesson, setEditingLesson] = useState(null);

  const [saving, setSaving] = useState(false);

  // Upload state
  const [uploadingLesson, setUploadingLesson] = useState(null); // lessonId
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const uploadTargetRef = useRef(null); // { moduleId, lessonId, type }

  async function load() {
    const [courseRes, modulesRes] = await Promise.all([
      fetch(`/api/teacher/courses/${courseId}`),
      fetch(`/api/teacher/courses/${courseId}/modules`),
    ]);
    if (!courseRes.ok) { router.push('/teacher/courses'); return; }
    const [courseData, modulesData] = await Promise.all([courseRes.json(), modulesRes.json()]);
    setCourse(courseData);
    setModules(Array.isArray(modulesData) ? modulesData : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [courseId]);

  // --- Modules ---

  async function createModule() {
    if (!newModuleTitle.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/teacher/courses/${courseId}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newModuleTitle.trim() }),
    });
    if (res.ok) { setNewModuleTitle(''); setAddingModule(false); await load(); }
    setSaving(false);
  }

  async function saveModuleTitle(moduleId, title) {
    await fetch(`/api/teacher/courses/${courseId}/modules/${moduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    setEditingModule(null);
    await load();
  }

  async function deleteModule(moduleId) {
    if (!window.confirm('Supprimer ce module et toutes ses leçons ?')) return;
    await fetch(`/api/teacher/courses/${courseId}/modules/${moduleId}`, { method: 'DELETE' });
    await load();
  }

  async function moveModule(mod, dir) {
    const sorted = [...modules].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(m => m.id === mod.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swap = sorted[swapIdx];
    await Promise.all([
      fetch(`/api/teacher/courses/${courseId}/modules/${mod.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: swap.order }),
      }),
      fetch(`/api/teacher/courses/${courseId}/modules/${swap.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: mod.order }),
      }),
    ]);
    await load();
  }

  // --- Lessons ---

  async function createLesson(moduleId) {
    if (!newLesson.title.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/teacher/courses/${courseId}/modules/${moduleId}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLesson),
    });
    if (res.ok) { setNewLesson(EMPTY_LESSON); setAddingLesson(null); await load(); }
    setSaving(false);
  }

  async function saveLessonEdit() {
    if (!editingLesson) return;
    await fetch(`/api/teacher/courses/${courseId}/modules/${editingLesson.moduleId}/lessons/${editingLesson.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editingLesson.title, type: editingLesson.type, duration: editingLesson.duration }),
    });
    setEditingLesson(null);
    await load();
  }

  async function deleteLesson(moduleId, lessonId) {
    if (!window.confirm('Supprimer cette leçon ?')) return;
    await fetch(`/api/teacher/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, { method: 'DELETE' });
    await load();
  }

  async function moveLesson(moduleId, lesson, dir) {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    const sorted = [...mod.lessons].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(l => l.id === lesson.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swap = sorted[swapIdx];
    await Promise.all([
      fetch(`/api/teacher/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: swap.order }),
      }),
      fetch(`/api/teacher/courses/${courseId}/modules/${moduleId}/lessons/${swap.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: lesson.order }),
      }),
    ]);
    await load();
  }

  // --- Upload ---

  function triggerUpload(moduleId, lessonId, lessonType) {
    uploadTargetRef.current = { moduleId, lessonId, lessonType };
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptAttr(lessonType);
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }

  async function removeFile(moduleId, lessonId) {
    await fetch(`/api/teacher/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentUrl: null }),
    });
    await load();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetRef.current) return;
    const { moduleId, lessonId } = uploadTargetRef.current;

    setUploadingLesson(lessonId);
    setUploadProgress(0);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
      }
    };
    xhr.onload = async () => {
      setUploadingLesson(null);
      if (xhr.status === 200) {
        await load();
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          setUploadError(data.error || 'Erreur lors de l\'upload');
        } catch {
          setUploadError('Erreur lors de l\'upload');
        }
      }
    };
    xhr.onerror = () => { setUploadingLesson(null); setUploadError('Erreur réseau'); };
    xhr.open('POST', `/api/teacher/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/upload`);
    xhr.send(formData);
  }

  const sortedModules = [...modules].sort((a, b) => a.order - b.order);
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  if (loading) return (
    <AppShell role="teacher" active="tcourses" go={go} title="Éditeur de contenu">
      <div style={{ textAlign: 'center', color: 'var(--ink-4)', padding: 60 }}>Chargement…</div>
    </AppShell>
  );

  return (
    <AppShell role="teacher" active="tcourses" go={go} title="Éditeur de contenu" subtitle={course?.title}>
      {/* Hidden file input shared for all lessons */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className="edu-content-narrow">

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <button className="btn btn-ghost btn-sm row gap-6" onClick={() => go('tcourses')}
            style={{ marginBottom: 14, color: 'var(--ink-3)', padding: '4px 0' }}>
            <Icon name="chevL" size={16} /> Retour aux cours
          </button>
          <div className="row gap-12" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="grow">
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{course?.title}</h1>
              <div className="row gap-10">
                <span className={'badge ' + (course?.status === 'PUBLISHED' ? 'badge-green badge-dot' : '')}
                  style={course?.status !== 'PUBLISHED' ? { background: 'var(--bg-2)', color: 'var(--ink-3)' } : undefined}>
                  {course?.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                </span>
                <span className="small muted">
                  {sortedModules.length} module{sortedModules.length !== 1 ? 's' : ''} · {totalLessons} leçon{totalLessons !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {uploadError && (
          <div className="card card-pad row gap-10" style={{ background: 'var(--rose-soft)', border: '1px solid var(--rose)', marginBottom: 16, color: 'var(--rose)' }}>
            <Icon name="xCircle" size={16} style={{ flexShrink: 0 }} />
            <span className="small">{uploadError}</span>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', color: 'var(--rose)' }} onClick={() => setUploadError(null)}>×</button>
          </div>
        )}

        {/* Modules list */}
        <div className="col gap-12">
          {sortedModules.map((mod, modIdx) => {
            const sortedLessons = [...mod.lessons].sort((a, b) => a.order - b.order);
            const hasBorder = sortedLessons.length > 0 || addingLesson === mod.id;
            return (
              <div key={mod.id} className="card anim-up" style={{ animationDelay: `${modIdx * 0.04}s` }}>

                {/* Module header */}
                <div className="card-pad row gap-12 between"
                  style={{ borderBottom: hasBorder ? '1px solid var(--border)' : undefined, flexWrap: 'wrap', gap: 10 }}>
                  <div className="row gap-10 grow" style={{ minWidth: 0 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, background: 'var(--bg-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>{modIdx + 1}</span>
                    </div>
                    {editingModule?.id === mod.id ? (
                      <input className="input" style={{ fontWeight: 600, fontSize: 15, flex: 1 }}
                        value={editingModule.title}
                        onChange={e => setEditingModule(m => ({ ...m, title: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveModuleTitle(mod.id, editingModule.title);
                          if (e.key === 'Escape') setEditingModule(null);
                        }}
                        autoFocus />
                    ) : (
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{mod.title}</span>
                    )}
                  </div>
                  <div className="row gap-4" style={{ flexShrink: 0 }}>
                    {editingModule?.id === mod.id ? (
                      <>
                        <button className="btn btn-primary btn-sm"
                          onClick={() => saveModuleTitle(mod.id, editingModule.title)}>Sauvegarder</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingModule(null)}>Annuler</button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Remonter"
                          onClick={() => moveModule(mod, 'up')} disabled={modIdx === 0}>
                          <Icon name="chevD" size={15} style={{ transform: 'rotate(180deg)' }} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Descendre"
                          onClick={() => moveModule(mod, 'down')} disabled={modIdx === sortedModules.length - 1}>
                          <Icon name="chevD" size={15} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Renommer"
                          onClick={() => setEditingModule({ id: mod.id, title: mod.title })}>
                          <Icon name="edit" size={15} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Supprimer"
                          onClick={() => deleteModule(mod.id)} style={{ color: 'var(--rose)' }}>
                          <Icon name="trash" size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Lessons */}
                {sortedLessons.length > 0 && (
                  <div style={{ padding: '0 16px' }}>
                    {sortedLessons.map((lesson, lessonIdx) => (
                      <div key={lesson.id}>
                        {editingLesson?.id === lesson.id ? (
                          <div className="col gap-10" style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                            <div className="edu-grid edu-grid-2" style={{ gap: 10 }}>
                              <div className="field">
                                <label className="label" style={{ fontSize: 12 }}>Titre</label>
                                <input className="input" value={editingLesson.title}
                                  onChange={e => setEditingLesson(l => ({ ...l, title: e.target.value }))} autoFocus />
                              </div>
                              <div className="field">
                                <label className="label" style={{ fontSize: 12 }}>Durée</label>
                                <input className="input" placeholder="ex: 10 min" value={editingLesson.duration}
                                  onChange={e => setEditingLesson(l => ({ ...l, duration: e.target.value }))} />
                              </div>
                            </div>
                            <div className="row gap-6" style={{ flexWrap: 'wrap' }}>
                              {LESSON_TYPES.map(t => (
                                <button key={t.value}
                                  className={'btn btn-sm ' + (editingLesson.type === t.value ? 'btn-primary' : 'btn-outline')}
                                  onClick={() => setEditingLesson(l => ({ ...l, type: t.value }))}>
                                  <Icon name={t.icon} size={14} />{t.label}
                                </button>
                              ))}
                            </div>
                            <div className="row gap-8">
                              <button className="btn btn-primary btn-sm" onClick={saveLessonEdit}>Sauvegarder</button>
                              <button className="btn btn-ghost btn-sm" onClick={() => setEditingLesson(null)}>Annuler</button>
                            </div>
                          </div>
                        ) : (
                          <div className="col gap-6" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                            <div className="row gap-10 between" style={{ flexWrap: 'nowrap' }}>
                              <div className="row gap-8" style={{ minWidth: 0, flex: 1 }}>
                                <Icon name={typeIcon(lesson.type)} size={14}
                                  style={{ color: 'var(--ink-3)', flexShrink: 0, marginTop: 1 }} />
                                <span className="small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {lesson.title}
                                </span>
                                <span className="tiny muted" style={{ flexShrink: 0 }}>{typeLabel(lesson.type)}</span>
                                {lesson.duration && lesson.duration !== '—' && (
                                  <span className="tiny muted" style={{ flexShrink: 0 }}>{lesson.duration}</span>
                                )}
                                {lesson.contentUrl && (
                                  <span className="tiny" style={{ flexShrink: 0, color: 'var(--green)', fontWeight: 600 }}>✓ Fichier</span>
                                )}
                              </div>
                              <div className="row gap-2" style={{ flexShrink: 0 }}>
                                {UPLOAD_TYPES.includes(lesson.type) && (
                                  <button
                                    className="btn btn-ghost btn-icon btn-sm"
                                    title={lesson.contentUrl ? 'Remplacer le fichier' : 'Uploader un fichier'}
                                    onClick={() => triggerUpload(mod.id, lesson.id, lesson.type)}
                                    disabled={uploadingLesson === lesson.id}
                                    style={{ color: lesson.contentUrl ? 'var(--green)' : 'var(--ink-3)' }}>
                                    <Icon name="upload" size={13} />
                                  </button>
                                )}
                                <button className="btn btn-ghost btn-icon btn-sm" title="Remonter"
                                  onClick={() => moveLesson(mod.id, lesson, 'up')} disabled={lessonIdx === 0}>
                                  <Icon name="chevD" size={13} style={{ transform: 'rotate(180deg)' }} />
                                </button>
                                <button className="btn btn-ghost btn-icon btn-sm" title="Descendre"
                                  onClick={() => moveLesson(mod.id, lesson, 'down')} disabled={lessonIdx === sortedLessons.length - 1}>
                                  <Icon name="chevD" size={13} />
                                </button>
                                <button className="btn btn-ghost btn-icon btn-sm" title="Modifier"
                                  onClick={() => setEditingLesson({ id: lesson.id, moduleId: mod.id, title: lesson.title, type: lesson.type, duration: lesson.duration || '' })}>
                                  <Icon name="edit" size={13} />
                                </button>
                                <button className="btn btn-ghost btn-icon btn-sm" title="Supprimer"
                                  onClick={() => deleteLesson(mod.id, lesson.id)} style={{ color: 'var(--rose)' }}>
                                  <Icon name="trash" size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Upload progress */}
                            {uploadingLesson === lesson.id && (
                              <div className="col gap-4">
                                <div className="track">
                                  <div className="track-fill" style={{ width: uploadProgress + '%', transition: 'width .2s' }} />
                                </div>
                                <span className="tiny muted">Upload en cours… {uploadProgress}%</span>
                              </div>
                            )}

                            {/* File info */}
                            {lesson.contentUrl && uploadingLesson !== lesson.id && (
                              <div className="row gap-8" style={{ padding: '4px 0' }}>
                                <Icon name={lesson.type === 'PDF' ? 'pdf' : 'video'} size={12} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
                                <span className="tiny muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                  {lesson.contentUrl.split('/').pop()}
                                </span>
                                <button className="tiny" style={{ color: 'var(--rose)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 0 }}
                                  onClick={() => removeFile(mod.id, lesson.id)}>
                                  Retirer
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add lesson */}
                <div style={{ padding: '12px 16px' }}>
                  {addingLesson === mod.id ? (
                    <div className="col gap-10">
                      <div className="edu-grid edu-grid-2" style={{ gap: 10 }}>
                        <div className="field">
                          <label className="label" style={{ fontSize: 12 }}>Titre de la leçon *</label>
                          <input className="input" placeholder="ex: Introduction à React" value={newLesson.title}
                            onChange={e => setNewLesson(l => ({ ...l, title: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && createLesson(mod.id)}
                            autoFocus />
                        </div>
                        <div className="field">
                          <label className="label" style={{ fontSize: 12 }}>Durée</label>
                          <input className="input" placeholder="ex: 10 min" value={newLesson.duration}
                            onChange={e => setNewLesson(l => ({ ...l, duration: e.target.value }))} />
                        </div>
                      </div>
                      <div className="row gap-6" style={{ flexWrap: 'wrap' }}>
                        {LESSON_TYPES.map(t => (
                          <button key={t.value}
                            className={'btn btn-sm ' + (newLesson.type === t.value ? 'btn-primary' : 'btn-outline')}
                            onClick={() => setNewLesson(l => ({ ...l, type: t.value }))}>
                            <Icon name={t.icon} size={14} />{t.label}
                          </button>
                        ))}
                      </div>
                      <div className="row gap-8">
                        <button className="btn btn-primary btn-sm"
                          onClick={() => createLesson(mod.id)} disabled={saving || !newLesson.title.trim()}>
                          {saving ? 'Ajout…' : 'Ajouter la leçon'}
                        </button>
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => { setAddingLesson(null); setNewLesson(EMPTY_LESSON); }}>
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-ghost btn-sm row gap-6" style={{ color: 'var(--brand)' }}
                      onClick={() => { setAddingLesson(mod.id); setNewLesson(EMPTY_LESSON); }}>
                      <Icon name="plus" size={15} /> Ajouter une leçon
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add module */}
          {addingModule ? (
            <div className="card card-pad col gap-10">
              <div className="field">
                <label className="label">Titre du module *</label>
                <input className="input" placeholder="ex: Introduction" value={newModuleTitle}
                  onChange={e => setNewModuleTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createModule()}
                  autoFocus />
              </div>
              <div className="row gap-8">
                <button className="btn btn-primary btn-sm"
                  onClick={createModule} disabled={saving || !newModuleTitle.trim()}>
                  {saving ? 'Création…' : 'Créer le module'}
                </button>
                <button className="btn btn-ghost btn-sm"
                  onClick={() => { setAddingModule(false); setNewModuleTitle(''); }}>
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn-outline row gap-8" style={{ justifyContent: 'center' }}
              onClick={() => setAddingModule(true)}>
              <Icon name="plus" size={18} /> Ajouter un module
            </button>
          )}
        </div>

        {/* Empty state */}
        {sortedModules.length === 0 && !addingModule && (
          <div className="card card-pad col" style={{ alignItems: 'center', textAlign: 'center', padding: '48px 24px', gap: 14, marginTop: 12 }}>
            <Icon name="layers" size={36} style={{ color: 'var(--ink-4)' }} />
            <h3 className="h3">Aucun module pour l'instant</h3>
            <p className="muted small">Structure ton cours en modules, puis ajoute des leçons dans chaque module.</p>
            <button className="btn btn-primary" onClick={() => setAddingModule(true)}>
              <Icon name="plus" size={18} /> Créer le premier module
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
