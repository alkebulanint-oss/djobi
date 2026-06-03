'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Inscription() {
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')
  const [metier, setMetier] = useState('')
  const [ville, setVille] = useState('')
  const [role, setRole] = useState<'artisan' | 'client'>('client')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const METIERS = ['Menuisier', 'Coiffeuse', 'Couturier', 'Électricien', 'Plombier', 'Peintre', 'Maçon', 'Autre']
  const VILLES = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon', 'Natitingou', 'Lokossa', 'Ouidah']

  async function handleInscription() {
    if (loading) return
    setLoading(true)
    setMessage('')

    if (!nom || !email || !telephone || !ville || !password) {
      setMessage('❌ Veuillez remplir tous les champs')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage('❌ Le mot de passe doit avoir au moins 6 caractères')
      setLoading(false)
      return
    }

    if (role === 'artisan' && !metier) {
      setMessage('❌ Veuillez choisir un métier')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nom, telephone, role }
        }
      })

      if (error) {
        setMessage('❌ Erreur : ' + error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        if (role === 'artisan') {
          const { error: artisanError } = await supabase.from('artisans').insert({
            user_id: data.user.id,
            nom, email, telephone, metier, ville,
            disponible: true, prix_min: 0
          })
          if (artisanError) {
            setMessage('❌ Erreur profil : ' + artisanError.message)
            setLoading(false)
            return
          }
        } else {
          const { error: clientError } = await supabase.from('clients').insert({
            user_id: data.user.id,
            nom, email, telephone
          })
          if (clientError) {
            setMessage('❌ Erreur profil : ' + clientError.message)
            setLoading(false)
            return
          }
        }
        setMessage('✅ Compte créé ! Connectez-vous maintenant.')
      }
    } catch (err) {
      setMessage('❌ Une erreur est survenue. Réessayez.')
    }

    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: 12,
    border: '1.5px solid #e5e0d8',
    outline: 'none',
    fontSize: 16,
    boxSizing: 'border-box' as const,
    color: '#1A1208',
    background: '#fff',
    WebkitTextFillColor: '#1A1208',
    display: 'block' as const,
  }

  const selectStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: 12,
    border: '1.5px solid #e5e0d8',
    outline: 'none',
    fontSize: 16,
    boxSizing: 'border-box' as const,
    color: '#1A1208',
    background: '#fff',
    WebkitTextFillColor: '#1A1208',
    display: 'block' as const,
  }

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600 as const,
    color: '#1A1208',
    display: 'block' as const,
    marginBottom: 8
  }

  return (
    <main style={{ fontFamily: 'sans-serif', background: '#FEFAF4', minHeight: '100vh' }}>
      <nav style={{ background: '#1A1208', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center' }}>
        <a href="/" style={{ color: '#F97316', fontWeight: 800, fontSize: 22, textDecoration: 'none' }}>
          Djobi<span style={{ color: '#fff' }}>.</span>
        </a>
      </nav>

      <div style={{ padding: '20px 16px' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 420, margin: '0 auto', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, color: '#1A1208' }}>Créer un compte</h1>
          <p style={{ fontSize: 14, color: '#7C6A50', marginBottom: 20 }}>Rejoignez Djobi gratuitement</p>

          {/* CHOIX ROLE */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {(['client', 'artisan'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  flex: 1, padding: '12px',
                  borderRadius: 12,
                  border: role === r ? '2px solid #F97316' : '2px solid #e5e0d8',
                  background: role === r ? '#FED7AA' : '#fff',
                  fontWeight: 600, fontSize: 14,
                  cursor: 'pointer', color: '#1A1208'
                }}
              >
                {r === 'client' ? '👤 Client' : '🔨 Artisan'}
              </button>
            ))}
          </div>

          {/* NOM */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Nom complet</label>
            <input
              type="text"
              placeholder="Jean Koffi"
              value={nom}
              onChange={e => setNom(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* EMAIL */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* TELEPHONE */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Téléphone</label>
            <input
              type="tel"
              placeholder="+229 97000000"
              value={telephone}
              onChange={e => setTelephone(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* VILLE */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Ville</label>
            <select
              value={ville}
              onChange={e => setVille(e.target.value)}
              style={selectStyle}
            >
              <option value="">Choisir une ville</option>
              {VILLES.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* METIER */}
          {role === 'artisan' && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Métier</label>
              <select
                value={metier}
                onChange={e => setMetier(e.target.value)}
                style={selectStyle}
              >
                <option value="">Choisir un métier</option>
                {METIERS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}

          {/* MOT DE PASSE */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Mot de passe</label>
            <input
              type="password"
              placeholder="Minimum 6 caractères"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* MESSAGE */}
          {message && (
            <div style={{
              background: message.includes('✅') ? '#DCFCE7' : '#FEE2E2',
              color: message.includes('✅') ? '#16A34A' : '#DC2626',
              padding: '12px 14px', borderRadius: 10,
              fontSize: 13, marginBottom: 16,
              fontWeight: 500
            }}>
              {message}
            </div>
          )}

          {/* BOUTON */}
          <button
            onClick={handleInscription}
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#fed7aa' : '#F97316',
              color: '#fff', border: 'none',
              borderRadius: 12, padding: '16px',
              fontSize: 16, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 16,
              WebkitAppearance: 'none' as const,
            }}
          >
            {loading ? '⏳ Création...' : 'Créer mon compte'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#7C6A50' }}>
            Déjà un compte ?{' '}
            <a href="/auth/login" style={{ color: '#F97316', fontWeight: 600, textDecoration: 'none' }}>
              Se connecter
            </a>
          </p>

        </div>
      </div>
    </main>
  )
}