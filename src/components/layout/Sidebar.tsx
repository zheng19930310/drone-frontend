import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Shield, Users, Target, AlertTriangle,
  MapPin, Radio, FileCheck, Settings
} from 'lucide-react'

const navGroups = [
  {
    title: '概览',
    items: [
      { path: '/', label: '仪表盘', icon: LayoutDashboard },
    ],
  },
  {
    title: '报备管理',
    items: [
      { path: '/whitelist', label: '白名单报备', icon: FileCheck },
    ],
  },
  {
    title: '安保部门',
    items: [
      { path: '/department', label: '部门管理', icon: Shield },
      { path: '/equipment', label: '设备管理', icon: Radio },
      { path: '/staff', label: '人员管理', icon: Users },
    ],
  },
  {
    title: '任务调度',
    items: [
      { path: '/task', label: '任务管理', icon: Target },
      { path: '/schedule', label: '调度管理', icon: MapPin },
    ],
  },
  {
    title: '预警管理',
    items: [
      { path: '/alarm', label: '预警记录', icon: AlertTriangle },
      { path: '/violation', label: '违规记录', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-sidebar border-r border-sidebar-border flex flex-col z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-sidebar-text leading-tight">低空安保平台</h1>
            <p className="text-[10px] text-sidebar-text-muted leading-tight">Drone Security</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-2 text-[11px] font-medium text-sidebar-text-muted uppercase tracking-wider">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150',
                      isActive
                        ? 'bg-sidebar-active text-primary font-medium'
                        : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border shrink-0">
        <p className="text-[10px] text-sidebar-text-muted text-center">
          Drone Security v1.0
        </p>
      </div>
    </aside>
  )
}
