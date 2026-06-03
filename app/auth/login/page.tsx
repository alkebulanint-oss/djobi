'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage('Erreur : ' + error.message)
    } else {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  return (
    <main style={{ fontFamily: 'sans-serif', background: '#FEFAF4', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#1A1208', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center' }}>
        <a href="/" style={{ color: '#F97316', fontWeight: 800, fontSize: 22, textDecoration: 'none' }}>Djobi<span style={{ color: '#fff' }}>.</span></a>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: '#1A1208' }}>Connexion</h1>
          <p style={{ fontSize: 13, color: '#7C6A50', marginBottom: 24 }}>Connectez-vous à votre compte Djobi</p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#1A1208', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e0d8', outline: 'none', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#1A1208', display: 'block', marginBottom: 6 }}>Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e0d8', outline: 'none', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>

          {message && (
            <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {message}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', background: '#F97316', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#7C6A50' }}>
            Pas encore de compte ?{' '}
            <a href="/auth/inscription" style={{ color: '#F97316', fontWeight: 600, textDecoration: 'none' }}>S'inscrire</a>
          </p>
        </div>
      </div>
    </main>
  )
}