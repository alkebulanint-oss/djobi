'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Profil() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p>Chargement...</p>
    </div>
  )

  return (
    <main style={{ fontFamily: 'sans-serif', background: '#FEFAF4', minHeight: '100vh', paddingBottom: 80 }}>
      <nav style={{ background: '#1A1208', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ color: '#F97316', fontWeight: 800, fontSize: 22, textDecoration: 'none' }}>Djobi<span style={{ color: '#fff' }}>.</span></a>
      </nav>

      <div style={{ padding: 20 }}>
        <div style={{ background: 'linear-gradient(135deg, #1A1208, #3D1F00)', borderRadius: 20, padding: 24, marginBottom: 20, color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>👤</div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>{user.email}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>Membre Djobi</div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
          <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', textDecoration: 'none', color: '#1A1208', borderBottom: '1px solid #f5f0e8' }}>
            <span style={{ fontSize: 20 }}>🔨</span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Mon dashboard artisan</span>
            <span style={{ marginLeft: 'auto', color: '#ccc' }}>→</span>
          </a>
          <a href="/auth/login" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', textDecoration: 'none', color: '#1A1208', borderBottom: '1px solid #f5f0e8' }}>
            <span style={{ fontSize: 20 }}>⚙️</span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Paramètres</span>
            <span style={{ marginLeft: 'auto', color: '#ccc' }}>→</span>
          </a>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', color: '#DC2626' }}
          >
            <span style={{ fontSize: 20 }}>🚪</span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Se déconnecter</span>
          </button>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#1A1208', display: 'flex', justifyContent: 'space-around', padding: '10px 0 16px' }}>
        {[
          { icon: '🏠', label: 'Accueil', href: '/' },
          { icon: '🗺️', label: 'Carte', href: '/carte' },
          { icon: '💬', label: 'Messages', href: '/messages' },
          { icon: '👤', label: 'Profil', href: '/profil' }
        ].map(item => (
          <a key={item.label} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', opacity: item.href === '/profil' ? 1 : 0.5 }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: item.href === '/profil' ? '#F97316' : '#fff' }}>{item.label}</span>
          </a>
        ))}
      </div>
    </main>
  )
}