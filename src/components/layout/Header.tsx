import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut } from 'lucide-react'

export function Header() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('Admin')

  useEffect(() => {
    const name = localStorage.getItem('username')
    if (name) setUsername(name)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 shrink-0">
      <div>
        <h2 className="text-lg font-semibold">无人机低空安保管控平台</h2>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-medium">
            {username.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm">{username}</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
          title="退出登录"
        >
          <LogOut className="w-5 h-5 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
    </header>
  )
}
