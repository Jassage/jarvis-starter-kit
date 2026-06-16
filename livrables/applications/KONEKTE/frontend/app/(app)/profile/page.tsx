"use client";
import { useEffect, useState } from "react";
import { LogOut, CheckCircle, ChevronRight, Lock, Trash2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import PhotoUpload from "@/components/ui/PhotoUpload";
import { photoUrl } from "@/lib/photo";

const INTERESTS = ["Tech", "Musique", "Voyages", "Sport", "Lecture", "Cuisine", "Cinéma", "Danse", "Kompa", "Entrepreneuriat", "Mode", "Art"];
const PROMPTS = [
  "Mon guilty pleasure :",
  "Je cherche quelqu'un qui :",
  "La chose la plus créole que je fais :",
  "Mon projet secret :",
  "Ce qui me fait rire :",
];

interface Photo { id: string; url: string; isMain: boolean; }

interface Profile {
  firstName: string;
  bio: string | null;
  occupation: string | null;
  city: string;
  age: number;
  interests: string[];
  profileComplete: number;
  isVerified: boolean;
  photos: Photo[];
  prompt1: { q: string; a: string } | null;
  prompt2: { q: string; a: string } | null;
}

type Tab = "photos" | "bio" | "preferences" | "compte";

export default function ProfilePage() {
  const { logout } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<Tab>("photos");
  const [form, setForm] = useState({
    bio: "", occupation: "", interests: [] as string[],
    prompt1Question: "", prompt1Answer: "",
    prompt2Question: "", prompt2Answer: "",
    minAge: 18, maxAge: 50, maxDistance: 50,
  });
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [deletePass, setDeletePass] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadProfile = async () => {
    try {
      const r = await api.get("/profiles/me");
      const d = r.data.data;
      setProfile(d);
      setForm({
        bio: d.bio ?? "",
        occupation: d.occupation ?? "",
        interests: (d.interests as string[]) ?? [],
        prompt1Question: d.prompt1?.q ?? "",
        prompt1Answer: d.prompt1?.a ?? "",
        prompt2Question: d.prompt2?.q ?? "",
        prompt2Answer: d.prompt2?.a ?? "",
        minAge: d.minAge ?? 18,
        maxAge: d.maxAge ?? 50,
        maxDistance: d.maxDistance ?? 50,
      });
    } catch {
      toast.error("Erreur de chargement");
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const toggleInterest = (i: string) =>
    setForm((f) => ({ ...f, interests: f.interests.includes(i) ? f.interests.filter((x) => x !== i) : [...f.interests, i] }));

  const changePassword = async () => {
    if (pwForm.next !== pwForm.confirm) { toast.error("Les mots de passe ne correspondent pas"); return; }
    if (pwForm.next.length < 8) { toast.error("Minimum 8 caractères"); return; }
    setPwSaving(true);
    try {
      await api.put("/auth/change-password", { currentPassword: pwForm.current, newPassword: pwForm.next });
      toast.success("Mot de passe modifié !");
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Erreur";
      toast.error(msg);
    } finally { setPwSaving(false); }
  };

  const deleteAccount = async () => {
    try {
      await api.delete("/auth/account", { data: { password: deletePass } });
      toast.success("Compte supprimé");
      logout();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Erreur";
      toast.error(msg);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/profiles/me", form);
      toast.success("Profil mis à jour !");
      await loadProfile();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <div className="text-center py-20 text-gray-400">Chargement...</div>;

  const mainPhoto = profile.photos.find((p) => p.isMain);

  return (
    <div className="max-w-lg mx-auto w-full px-4 pt-4 pb-4 flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl font-bold" style={{ background: "#FBEAF0", color: "#993556" }}>
            {mainPhoto ? <img src={photoUrl(mainPhoto.url) ?? ""} alt="" className="w-full h-full object-cover" /> : profile.firstName[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800">{profile.firstName}, {profile.age}</h2>
              {profile.isVerified && <CheckCircle size={16} className="text-blue-500" />}
            </div>
            <p className="text-gray-400 text-sm">📍 {profile.city}</p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Profil complété</span>
                <span className="font-medium" style={{ color: "#D4537E" }}>{profile.profileComplete}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${profile.profileComplete}%`, background: "#D4537E" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex bg-white rounded-2xl p-1 shadow-sm gap-1">
        {(["photos", "bio", "preferences", "compte"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-all capitalize"
            style={{
              background: tab === t ? "#D4537E" : "transparent",
              color: tab === t ? "white" : "#9ca3af",
            }}
          >
            {t === "photos" ? "📷" : t === "bio" ? "✏️ Bio" : t === "preferences" ? "⚙️" : "🔒"}
          </button>
        ))}
      </div>

      {tab === "photos" && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Mes photos</h3>
          <PhotoUpload
            photos={profile.photos}
            onUpdate={(photos) => setProfile((p) => p ? { ...p, photos } : p)}
          />
        </div>
      )}

      {tab === "bio" && (
        <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Bio</label>
            <textarea rows={3} placeholder="Présente-toi en quelques lignes..." value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })} className="resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Profession</label>
            <input type="text" placeholder="Ex: Développeur, Médecin..." value={form.occupation}
              onChange={(e) => setForm({ ...form, occupation: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Prompt 1</label>
            <select value={form.prompt1Question} onChange={(e) => setForm({ ...form, prompt1Question: e.target.value })}>
              <option value="">Choisir une question...</option>
              {PROMPTS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {form.prompt1Question && (
              <input type="text" className="mt-2" placeholder="Ta réponse..." value={form.prompt1Answer}
                onChange={(e) => setForm({ ...form, prompt1Answer: e.target.value })} />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Prompt 2</label>
            <select value={form.prompt2Question} onChange={(e) => setForm({ ...form, prompt2Question: e.target.value })}>
              <option value="">Choisir une question...</option>
              {PROMPTS.filter((p) => p !== form.prompt1Question).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {form.prompt2Question && (
              <input type="text" className="mt-2" placeholder="Ta réponse..." value={form.prompt2Answer}
                onChange={(e) => setForm({ ...form, prompt2Answer: e.target.value })} />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Centres d&apos;intérêt</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <button key={i} type="button" onClick={() => toggleInterest(i)}
                  className="text-sm px-3 py-1 rounded-full font-medium border transition-all"
                  style={{ background: form.interests.includes(i) ? "#D4537E" : "white", color: form.interests.includes(i) ? "white" : "#D4537E", borderColor: "#D4537E" }}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary w-full" onClick={save} disabled={saving}>
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      )}

      {tab === "preferences" && (
        <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <label className="font-medium text-gray-600">Tranche d&apos;âge</label>
              <span className="font-semibold" style={{ color: "#D4537E" }}>{form.minAge} – {form.maxAge} ans</span>
            </div>
            <div className="flex gap-3 items-center">
              <span className="text-xs text-gray-400 w-6">18</span>
              <input type="range" min={18} max={form.maxAge - 1} value={form.minAge}
                onChange={(e) => setForm({ ...form, minAge: +e.target.value })} className="flex-1 accent-pink-500" />
              <input type="range" min={form.minAge + 1} max={80} value={form.maxAge}
                onChange={(e) => setForm({ ...form, maxAge: +e.target.value })} className="flex-1 accent-pink-500" />
              <span className="text-xs text-gray-400 w-6">80</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <label className="font-medium text-gray-600">Distance maximale</label>
              <span className="font-semibold" style={{ color: "#D4537E" }}>{form.maxDistance} km</span>
            </div>
            <input type="range" min={5} max={200} step={5} value={form.maxDistance}
              onChange={(e) => setForm({ ...form, maxDistance: +e.target.value })} className="w-full accent-pink-500" />
          </div>

          <button className="btn-primary w-full" onClick={save} disabled={saving}>
            {saving ? "Sauvegarde..." : "Sauvegarder les préférences"}
          </button>
        </div>
      )}

      {tab === "compte" && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Lock size={16} style={{ color: "#D4537E" }} />
              <h3 className="font-semibold text-gray-700">Changer le mot de passe</h3>
            </div>
            <input type="password" placeholder="Mot de passe actuel" value={pwForm.current}
              onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} />
            <input type="password" placeholder="Nouveau mot de passe (min. 8 car.)" value={pwForm.next}
              onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} />
            <input type="password" placeholder="Confirmer le nouveau mot de passe" value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
            <button className="btn-primary w-full" onClick={changePassword} disabled={pwSaving || !pwForm.current || !pwForm.next}>
              {pwSaving ? "Modification..." : "Modifier le mot de passe"}
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Trash2 size={16} className="text-red-400" />
              <h3 className="font-semibold text-gray-700">Supprimer mon compte</h3>
            </div>
            <p className="text-xs text-gray-400">Cette action est irréversible. Toutes tes données, matchs et conversations seront supprimés.</p>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} className="w-full py-3 rounded-xl border border-red-300 text-red-400 text-sm font-medium hover:bg-red-50 transition-colors">
                Supprimer mon compte
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <input type="password" placeholder="Confirme ton mot de passe" value={deletePass}
                  onChange={(e) => setDeletePass(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={() => { setShowDeleteConfirm(false); setDeletePass(""); }} className="flex-1 py-2.5 rounded-xl border text-sm text-gray-500">Annuler</button>
                  <button onClick={deleteAccount} disabled={!deletePass} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-50">
                    Confirmer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50 flex justify-between items-center text-sm">
          <span className="text-gray-600">Plan actuel</span>
          <span className="font-semibold px-2 py-0.5 rounded-full text-xs" style={{ background: "#FBEAF0", color: "#993556" }}>FREE</span>
        </div>
        <Link href="/premium" className="w-full px-5 py-3 flex justify-between items-center text-sm hover:bg-gray-50">
          <span style={{ color: "#D4537E" }} className="font-medium">✨ Passer Premium</span>
          <ChevronRight size={16} className="text-gray-300" />
        </Link>
      </div>

      <button onClick={logout} className="flex items-center justify-center gap-2 w-full bg-white rounded-2xl p-4 shadow-sm text-red-400 font-medium hover:bg-red-50 transition-colors">
        <LogOut size={18} /> Se déconnecter
      </button>
    </div>
  );
}
