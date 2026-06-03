'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Artisan {
  id: string
  nom: string
  metier: string
  telephone: string
  description: string
  ville: string
  quartier: string
  disponible: boolean
  prix_min: number
  note: number
  nb_avis: number
  latitude: number
  longitude: number
}

export default function Dashboard() {
  const [artisan, setArtisan] = useState<Artisan | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }

    const { data } = await supabase
      .from('artisans')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) setArtisan(data)
    setLoading(false)
  }

  async function saveProfile() {
    if (!artisan) return
    setSaving(true)
    const { error } = await supabase
      .from('artisans')
      .update({
        nom: artisan.nom,
        description: artisan.description,
        quartier: artisan.quartier,
        prix_min: artisan.prix_min,
        disponible: artisan.disponible,
      })
      .eq('id', artisan.id)

    setMessage(error ? '❌ Erreur sauvegarde' : '✅ Profil mis à jour !')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  async function activerLocalisation() {
    if (!artisan) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        await supabase
          .from('artisans')
          .update({ latitude, longitude })
          .eq('id', artisan.id)
        setArtisan({ ...artisan, latitude, longitude })
        setMessage('✅ Position activée !')
        setLocating(false)
        setTimeout(() => setMessage(''), 3000)
      },
      () => {
        setMessage('❌ Géolocalisation refusée')
        setLocating(false)
      }
    )
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
        <p>Chargement...</p>
      </div>
    </div>
  )

  if (!artisan) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>❌</div>
        <p>Profil artisan non trouvé</p>
        <a href="/" style={{ color: '#F97316' }}>Retour à l'accueil</a>
      </div>
    </div>
  )

  return (
    <main style={{ fontFamily: 'sans-serif', background: '#FEFAF4', minHeight: '100vh', paddingBottom: 80 }}>

      {/* NAV */}
      <nav style={{ background: '#1A1208', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ color: '#F97316', fontWeight: 800, fontSize: 22, textDecoration: 'none' }}>Djobi<span style={{ color: '#fff' }}>.</span></a>
        <button onClick={handleLogout} style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12 }}>
          Déconnexion
        </button>
      </nav>

      <div style={{ padding: '20px 16px' }}>

        {/* HEADER PROFIL */}
        <div style={{ background: 'linear-gradient(135deg, #1A1208, #3D1F00)', borderRadius: 20, padding: 20, marginBottom: 20, color: '#fff' }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🧑🏿‍🔧</div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>{artisan.nom}</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>{artisan.metier} · {artisan.ville}</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '8px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#F97316' }}>★ {artisan.note || '–'}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Note</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '8px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#F97316' }}>{artisan.nb_avis}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Avis</div>
            </div>
            <div style={{ background: artisan.disponible ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)', borderRadius: 12, padding: '8px 14px', textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: artisan.disponible ? '#4ADE80' : '#F87171' }}>
                {artisan.disponible ? '✓ Disponible' : '⏳ Occupé'}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Statut</div>
            </div>
          </div>
        </div>

        {/* GÉOLOCALISATION */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            📍 Ma position GPS
          </div>
          {artisan.latitude ? (
            <div style={{ background: '#DCFCE7', color: '#16A34A', padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
              ✅ Position activée — les clients vous voient sur la carte
            </div>
          ) : (
            <div style={{ background: '#FEF3C7', color: '#D97706', padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
              ⚠️ Position non activée — les clients ne vous voient pas
            </div>
          )}
          <button
            onClick={activerLocalisation}
            disabled={locating}
            style={{ width: '100%', background: '#1A1208', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            {locating ? '📍 Localisation...' : artisan.latitude ? '🔄 Mettre à jour ma position' : '📍 Activer ma géolocalisation'}
          </button>
        </div>

        {/* DISPONIBILITÉ */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>🟢 Disponibilité</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[true, false].map(val => (
              <button
                key={String(val)}
                onClick={() => setArtisan({ ...artisan, disponible: val })}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10,
                  border: artisan.disponible === val ? '2px solid #F97316' : '2px solid #e5e0d8',
                  background: artisan.disponible === val ? '#FED7AA' : '#fff',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#1A1208'
                }}
              >
                {val ? '✅ Disponible' : '⏳ Occupé'}
              </button>
            ))}
          </div>
        </div>

        {/* MODIFIER PROFIL */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>✏️ Mon profil</div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nom complet</label>
            <input
              value={artisan.nom}
              onChange={e => setArtisan({ ...artisan, nom: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e0d8', outline: 'none', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Quartier</label>
            <input
              value={artisan.quartier || ''}
              onChange={e => setArtisan({ ...artisan, quartier: e.target.value })}
              placeholder="Ex: Fidjrossè, Akpakpa..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e0d8', outline: 'none', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Description</label>
            <textarea
              value={artisan.description || ''}
              onChange={e => setArtisan({ ...artisan, description: e.target.value })}
              placeholder="Décrivez votre expérience et vos services..."
              rows={3}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e0d8', outline: 'none', fontSize: 14, boxSizing: 'border-box', resize: 'none' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Prix minimum (FCFA)</label>
            <input
              type="number"
              value={artisan.prix_min || 0}
              onChange={e => setArtisan({ ...artisan, prix_min: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e0d8', outline: 'none', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>

          {message && (
            <div style={{ background: message.includes('✅') ? '#DCFCE7' : '#FEE2E2', color: message.includes('✅') ? '#16A34A' : '#DC2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 12 }}>
              {message}
            </div>
          )}

          <button
            onClick={saveProfile}
            disabled={saving}
            style={{ width: '100%', background: '#F97316', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
          >
            {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
          </button>
        </div>

      </div>
    </main>
  )
}