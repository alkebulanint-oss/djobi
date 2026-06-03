'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Conversation {
  id: string
  created_at: string
  artisan: {
    id: string
    nom: string
    metier: string
  }
  client_id: string
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    init()
  }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }
    setUserId(user.id)

    const { data } = await supabase
      .from('conversations')
      .select('*, artisan:artisan_id(id, nom, metier)')
      .or(`client_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    setConversations(data || [])
    setLoading(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p>Chargement...</p>
    </div>
  )

  return (
    <main style={{ fontFamily: 'sans-serif', background: '#FEFAF4', minHeight: '100vh', paddingBottom: 80 }}>
      <nav style={{ background: '#1A1208', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center' }}>
        <a href="/" style={{ color: '#F97316', fontWeight: 800, fontSize: 22, textDecoration: 'none' }}>Djobi<span style={{ color: '#fff' }}>.</span></a>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginLeft: 12 }}>Messages</span>
      </nav>

      <div style={{ padding: '16px' }}>
        {conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <p style={{ fontWeight: 600, fontSize: 15 }}>Aucune conversation</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>Contactez un artisan pour démarrer une discussion</p>
            <a href="/" style={{ display: 'inline-block', marginTop: 16, background: '#F97316', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Voir les artisans
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {conversations.map(conv => (
              <a
                key={conv.id}
                href={`/chat/${conv.id}`}
                style={{ background: '#fff', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                  🧑🏿‍🔧
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1208' }}>{conv.artisan?.nom}</div>
                  <div style={{ fontSize: 12, color: '#7C6A50', marginTop: 2 }}>{conv.artisan?.metier}</div>
                </div>
                <span style={{ color: '#ccc', fontSize: 18 }}>→</span>
              </a>
            ))}
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
          <a key={item.label} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', opacity: item.href === '/messages' ? 1 : 0.5 }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: item.href === '/messages' ? '#F97316' : '#fff' }}>{item.label}</span>
          </a>
        ))}
      </div>
    </main>
  )
}