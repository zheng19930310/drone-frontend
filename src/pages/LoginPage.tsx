import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { authAPI } from '@/lib/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const { success, error } = useToast()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res: any = await authAPI.login(username, password)
      if (res.code === 200) {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('username', res.data.username)
        success('登录成功')
        navigate('/')
      } else {
        error(res.message || '登录失败')
      }
    } catch {
      error('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">无人机低空安保管控平台</h1>
          <p className="text-muted-foreground text-sm mt-2">Drone Security Control System</p>
        </div>

        {/* Login Card */}
        <div className="card p-8">
          <form onSubmit={handleLogin}>
            <div className="space-y-5">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">用户名</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !loading && handleLogin(e)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? '登录中...' : '登 录'}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              模拟登录：任意用户名和密码均可登录
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Drone Security v1.0
        </p>
      </div>
    </div>
  )
}
