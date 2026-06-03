'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'

interface Message {
  id: string
  contenu: string
  sender_id: string
  type: string
  created_at: string
}

export default function Chat() {
  const params = useParams()
  const conversationId = params.id as string
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [recording, setRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }
    setUserId(user.id)
    await fetchMessages()
    setLoading(false)

    // Écoute les nouveaux messages en temps réel
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  async function sendMessage() {
    if (!newMessage.trim() || !userId) return
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      contenu: newMessage.trim(),
      type: 'texte'
    })
    setNewMessage('')
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = e => {
        audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const fileName = `voice_${Date.now()}.webm`
        
        // Upload dans Supabase Storage
        const { data } = await supabase.storage
          .from('voices')
          .upload(fileName, audioBlob)

        if (data && userId) {
          const { data: urlData } = supabase.storage
            .from('voices')
            .getPublicUrl(fileName)

          await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: userId,
            contenu: urlData.publicUrl,
            type: 'vocal'
          })
        }
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setRecording(true)
    } catch {
      alert('Microphone non disponible')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p>Chargement...</p>
    </div>
  )

  return (
    <main style={{ fontFamily: 'sans-serif', background: '#f0ebe3', height: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ background: '#1A1208', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <a href="/messages" style={{ color: '#fff', fontSize: 20, textDecoration: 'none' }}>←</a>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🧑🏿‍🔧</div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Conversation</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>En ligne</div>
        </div>
      </nav>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', fontSize: 13, marginTop: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
            <p>Commencez la conversation !</p>
          </div>
        )}

        {messages.map(msg => {
          const isMine = msg.sender_id === userId
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%',
                background: isMine ? '#F97316' : '#fff',
                color: isMine ? '#fff' : '#1A1208',
                padding: '10px 14px',
                borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                {msg.type === 'vocal' ? (
                  <audio controls src={msg.contenu} style={{ maxWidth: 200, height: 36 }} />
                ) : (
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.4 }}>{msg.contenu}</p>
                )}
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: 'right' }}>
                  {formatTime(msg.created_at)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div style={{ background: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #f0ebe3', flexShrink: 0 }}>
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Écrire un message..."
          style={{ flex: 1, border: '1.5px solid #e5e0d8', borderRadius: 24, padding: '10px 16px', outline: 'none', fontSize: 14, background: '#f9f7f4' }}
        />

        {/* Bouton vocal */}
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: recording ? '#DC2626' : '#f0ebe3',
            border: 'none', cursor: 'pointer', fontSize: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {recording ? '⏹️' : '🎤'}
        </button>

        {/* Bouton envoyer */}
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: newMessage.trim() ? '#F97316' : '#f0ebe3',
            border: 'none', cursor: 'pointer', fontSize: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}
        >
          ➤
        </button>
      </div>

    </main>
  )
}