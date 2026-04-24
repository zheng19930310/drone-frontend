import React, { useState } from 'react'
import { Shield, Users, Target, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BeijingMap } from '@/components/ui/beijing-map'
import { DataFlowMap } from '@/components/ui/data-flow-map'
import { RelationGraph } from '@/components/ui/relation-graph'
import { HexagonChart } from '@/components/ui/hexagon-chart'
import {
  TaskStatusChart,
  EquipmentTrendChart,
  AlarmStatsChart,
  StaffDistributionChart
} from '@/components/ui/dashboard-charts'
import { cn } from '@/lib/utils'

const stats = [
  { label: '在线设备', value: '24', icon: Shield, color: 'text-primary', bg: 'bg-primary/10' },
  { label: '执勤人员', value: '156', icon: Users, color: 'text-success', bg: 'bg-success/10' },
  { label: '进行中任务', value: '8', icon: Target, color: 'text-warning', bg: 'bg-warning/10' },
  { label: '待处理预警', value: '3', icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
]

export default function DashboardPage() {
  const [selectedMarker, setSelectedMarker] = useState<any>(null)

  const handleMarkerClick = (marker: any) => {
    setSelectedMarker(marker)
  }

  return (
    <div className="page-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <p className="text-muted-foreground text-sm mt-1">低空安保态势概览</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="card p-5 hover:shadow-glow transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', s.bg)}>
                  <Icon className={cn('w-6 h-6', s.color)} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Beijing Map */}
      <Card>
        <CardHeader>
          <CardTitle>北京区域监控图</CardTitle>
        </CardHeader>
        <CardContent>
          <BeijingMap onMarkerClick={handleMarkerClick} />
        </CardContent>
      </Card>

      {/* Data Flow Map */}
      <Card>
        <CardHeader>
          <CardTitle>数据流入态势 - 石榴庄地铁站</CardTitle>
        </CardHeader>
        <CardContent>
          <DataFlowMap />
        </CardContent>
      </Card>

      {/* Relation Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <RelationGraph
              title="部门人员关系图"
              centerName="安保部"
              categories={['部门', '人员', '组长', '队员']}
              centerColor="#3b82f6"
              satelliteColors={['#10b981', '#f59e0b', '#ef4444']}
              minSatellites={6}
              maxSatellites={15}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <RelationGraph
              title="部门设备关系图"
              centerName="装备科"
              categories={['部门', '无人机', '雷达', '通信设备']}
              centerColor="#8b5cf6"
              satelliteColors={['#3b82f6', '#10b981', '#f59e0b']}
              minSatellites={5}
              maxSatellites={12}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <RelationGraph
              title="部门无人机情况"
              centerName="飞行中队"
              categories={['中队', '察打机', '侦察机', '运输机']}
              centerColor="#06b6d4"
              satelliteColors={['#ef4444', '#10b981', '#f59e0b']}
              minSatellites={4}
              maxSatellites={10}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <RelationGraph
              title="部门监测点情况"
              centerName="监测中心"
              categories={['中心', '高点监测', '低空监测', '移动监测']}
              centerColor="#ec4899"
              satelliteColors={['#3b82f6', '#8b5cf6', '#06b6d4']}
              minSatellites={5}
              maxSatellites={14}
            />
          </CardContent>
        </Card>
      </div>

      {/* ECharts Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <TaskStatusChart />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <EquipmentTrendChart />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <AlarmStatsChart />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <StaffDistributionChart />
          </CardContent>
        </Card>
      </div>

      {/* Hexagon Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HexagonChart title="部门建设情况" type="department" />
        <HexagonChart title="个人能力评估" type="staff" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>最近任务</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['要地安保任务 - 执行中', '重大活动安保 - 调度中', '普通巡逻任务 - 待分配'].map((t, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm">{t}</span>
                  <span className={cn('badge', i === 0 ? 'badge-success' : i === 1 ? 'badge-warning' : 'badge-muted')}>
                    {i === 0 ? '执行中' : i === 1 ? '调度中' : '待分配'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最新预警</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['察打设备E-003 信号异常', '发现违规飞行目标', '设备E-007 需要维护'].map((t, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm">{t}</span>
                  <span className={cn('badge', i === 1 ? 'badge-destructive' : 'badge-warning')}>
                    {i === 1 ? '紧急' : '警告'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
