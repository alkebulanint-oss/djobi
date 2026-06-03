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

const METIERS = [
  { label: 'Tous', emoji: '✨' },
  { label: 'Menuisier', emoji: '🪑' },
  { label: 'Coiffeuse', emoji: '💇' },
  { label: 'Couturier', emoji: '🧵' },
  { label: 'Électricien', emoji: '⚡' },
  { label: 'Plombier', emoji: '🔧' },
  { label: 'Peintre', emoji: '🎨' },
  { label: 'Maçon', emoji: '🧱' },
]

export default function Home() {
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [filtre, setFiltre] = useState('Tous')
  const [recherche, setRecherche] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArtisans()
  }, [filtre])

  async function fetchArtisans() {
    setLoading(true)
    let query = supabase.from('artisans').select('*')

    if (filtre !== 'Tous') {
      query = query.ilike('metier', `%${filtre}%`)
    }

    if (recherche) {
      query = query.ilike('nom', `%${recherche}%`)
    }

    const { data, error } = await query

    if (!error) {
      setArtisans(data || [])
    }

    setLoading(false)
  }

  async function contacterArtisan(artisanId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('client_id', user.id)
      .eq('artisan_id', artisanId)
      .single()

    if (existing) {
      window.location.href = `/chat/${existing.id}`
    } else {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ client_id: user.id, artisan_id: artisanId })
        .select()
        .single()
      if (newConv) window.location.href = `/chat/${newConv.id}`
    }
  }

  return (
    <main style={{ fontFamily: 'sans-serif', background: '#FEFAF4', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ background: '#1A1208', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#F97316', fontWeight: 800, fontSize: 22 }}>Djobi<span style={{ color: '#fff' }}>.</span></span>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/auth/login" style={{ color: '#fff', fontSize: 13, padding: '6px 14px', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 20, textDecoration: 'none' }}>Connexion</a>
          <a href="/auth/inscription" style={{ background: '#F97316', color: '#fff', fontSize: 13, padding: '6px 14px', borderRadius: 20, textDecoration: 'none' }}>S'inscrire</a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: '#1A1208', padding: '40px 20px 30px' }}>
        <div style={{ display: 'inline-block', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#F97316', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, marginBottom: 16, letterSpacing: 1 }}>
          📍 Géolocalisation activée
        </div>
        <h1 style={{ color: '#fff', fontSize: 30, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
          L'artisan qu'il vous faut,{' '}
          <span style={{ color: '#F97316' }}>près de chez vous</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24 }}>
          Menuisiers, coiffeuses, couturiers… trouvez un artisan de confiance au Bénin.
        </p>
        <div style={{ background: '#fff', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>🔍</span>
          <input
            placeholder="Quel artisan cherchez-vous ?"
            value={recherche}
            onChange={e => { setRecherche(e.target.value); fetchArtisans() }}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }}
          />
          <span style={{ color: '#F97316', fontSize: 12, fontWeight: 600 }}>📍 Bénin</span>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>

        {/* FILTRES */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 24 }}>
          {METIERS.map(m => (
            <button
              key={m.label}
              onClick={() => setFiltre(m.label)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '10px 14px', borderRadius: 14, border: filtre === m.label ? '2px solid #F97316' : '2px solid transparent',
                background: filtre === m.label ? '#FED7AA' : '#fff',
                cursor: 'pointer', minWidth: 68, flexShrink: 0
              }}
            >
              <span style={{ fontSize: 20 }}>{m.emoji}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#3D1F00' }}>{m.label}</span>
            </button>
          ))}
        </div>

        {/* ARTISANS */}
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
          {loading ? 'Chargement...' : `${artisans.length} artisan(s) disponible(s)`}
        </h2>

        {artisans.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p>Aucun artisan trouvé</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>Sois le premier à t'inscrire !</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {artisans.map(artisan => (
            <div key={artisan.id} style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              <div style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, position: 'relative' }}>
                🧑🏿‍🔧
                <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.9)', color: '#F97316', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                  📍 {artisan.ville}
                </span>
                <span style={{ position: 'absolute', top: 10, left: 10, background: artisan.disponible ? '#16A34A' : '#DC2626', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                  {artisan.disponible ? '✓ Disponible' : '⏳ Occupé'}
                </span>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{artisan.nom}</div>
                    <div style={{ fontSize: 12, color: '#7C6A50', marginTop: 2 }}>{artisan.metier} · {artisan.quartier}</div>
                  </div>
                  <div style={{ background: '#fff8f0', border: '1px solid #FED7AA', padding: '3px 8px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    ★ {artisan.note || '–'}
                  </div>
                </div>
                <p style={{ fontSize: 12, color: '#7C6A50', marginBottom: 12, lineHeight: 1.5 }}>{artisan.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f5f0e8', paddingTop: 12 }}>
                  <span style={{ fontSize: 13, color: '#7C6A50' }}>Dès <strong style={{ fontSize: 15, color: '#1A1208' }}>{artisan.prix_min?.toLocaleString()} F</strong></span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => contacterArtisan(artisan.id)}
                      style={{ background: '#F97316', color: '#fff', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                    >
                      💬 Contacter
                    </button>
                    <a
                      href={`/artisan/${artisan.id}`}
                      style={{ background: '#1A1208', color: '#fff', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                    >
                      Profil
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#1A1208', display: 'flex', justifyContent: 'space-around', padding: '10px 0 16px' }}>
        {[{ icon: '🏠', label: 'Accueil', href: '/' }, { icon: '🗺️', label: 'Carte', href: '/carte' }, { icon: '💬', label: 'Messages', href: '/messages' }, { icon: '👤', label: 'Profil', href: '/profil' }].map(item => (
          <a key={item.label} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', opacity: item.href === '/' ? 1 : 0.5 }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: item.href === '/' ? '#F97316' : '#fff' }}>{item.label}</span>
          </a>
        ))}
      </div>

    </main>
  )
}