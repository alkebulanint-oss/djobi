'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Artisan {
  id: string
  nom: string
  metier: string
  ville: string
  quartier: string
  disponible: boolean
  latitude: number
  longitude: number
  prix_min: number
  telephone: string
}

export default function Carte() {
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null)

  useEffect(() => {
    fetchArtisans()
    navigator.geolocation.getCurrentPosition(
      pos => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    )
  }, [])

  async function fetchArtisans() {
    const { data } = await supabase
      .from('artisans')
      .select('*')
      .not('latitude', 'is', null)
    setArtisans(data || [])
  }

  return (
    <main style={{ fontFamily: 'sans-serif', background: '#FEFAF4', minHeight: '100vh', paddingBottom: 80 }}>
      <nav style={{ background: '#1A1208', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ color: '#F97316', fontWeight: 800, fontSize: 22, textDecoration: 'none' }}>Djobi<span style={{ color: '#fff' }}>.</span></a>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{artisans.length} artisan(s) sur la carte</span>
      </nav>

      {/* INFO POSITION */}
      <div style={{ padding: '16px 20px', background: '#fff', borderBottom: '1px solid #f0ebe3' }}>
        {position ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16A34A', fontSize: 13, fontWeight: 600 }}>
            <span>📍</span> Position activée — vous voyez les artisans autour de vous
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#D97706', fontSize: 13, fontWeight: 600 }}>
            <span>⚠️</span> Activez votre GPS pour voir les artisans proches
          </div>
        )}
      </div>

      {/* LISTE ARTISANS GÉOLOCALISÉS */}
      <div style={{ padding: '16px 16px' }}>
        <p style={{ fontFamily: 'sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
          🗺️ Artisans géolocalisés
        </p>

        {artisans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
            <p style={{ fontWeight: 600 }}>Aucun artisan géolocalisé pour l'instant</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>Les artisans apparaîtront ici une fois qu'ils activent leur GPS</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {artisans.map(artisan => {
              const distance = position && artisan.latitude ? (() => {
                const R = 6371
                const dLat = (artisan.latitude - position.lat) * Math.PI / 180
                const dLon = (artisan.longitude - position.lng) * Math.PI / 180
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(position.lat * Math.PI / 180) * Math.cos(artisan.latitude * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2)
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
                return (R * c).toFixed(1)
              })() : null

              return (
                <div key={artisan.id} style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 50, background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                    🧑🏿‍🔧
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1208' }}>{artisan.nom}</div>
                    <div style={{ fontSize: 12, color: '#7C6A50', marginTop: 2 }}>{artisan.metier} · {artisan.ville}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <span style={{ background: artisan.disponible ? '#DCFCE7' : '#FEE2E2', color: artisan.disponible ? '#16A34A' : '#DC2626', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                        {artisan.disponible ? '✓ Disponible' : '⏳ Occupé'}
                      </span>
                      {distance && (
                        <span style={{ color: '#F97316', fontSize: 11, fontWeight: 600 }}>
                          📍 {distance} km
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${artisan.telephone}`}
                    target="_blank"
                    style={{ background: '#25D366', color: '#fff', padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}
                  >
                    💬
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#1A1208', display: 'flex', justifyContent: 'space-around', padding: '10px 0 16px' }}>
        {[
          { icon: '🏠', label: 'Accueil', href: '/' },
          { icon: '🗺️', label: 'Carte', href: '/carte' },
          { icon: '💬', label: 'Messages', href: '/messages' },
          { icon: '👤', label: 'Profil', href: '/profil' }
        ].map(item => (
          <a key={item.label} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', opacity: item.href === '/carte' ? 1 : 0.5 }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: item.href === '/carte' ? '#F97316' : '#fff' }}>{item.label}</span>
          </a>
        ))}
      </div>
    </main>
  )
}
