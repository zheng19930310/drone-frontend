import React, { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'

// 部门数据
const departments = [
  { id: 'security', name: '安保部' },
  { id: 'equipment', name: '装备科' },
  { id: 'flight', name: '飞行中队' },
  { id: 'monitor', name: '监测中心' },
  { id: 'command', name: '指挥中心' }
]

// 人员数据
const staffMembers = [
  { id: 'staff1', name: '张三' },
  { id: 'staff2', name: '李四' },
  { id: 'staff3', name: '王五' },
  { id: 'staff4', name: '赵六' },
  { id: 'staff5', name: '孙七' }
]

// 生成随机部门数据
function generateDepartmentData() {
  return {
    indicators: [
      { name: '人员配置', max: 100 },
      { name: '设备完好率', max: 100 },
      { name: '任务完成率', max: 100 },
      { name: '应急响应', max: 100 },
      { name: '培训考核', max: 100 },
      { name: '协同作战', max: 100 }
    ],
    data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 40) + 60)
  }
}

// 生成随机人员数据
function generateStaffData() {
  return {
    indicators: [
      { name: '专业技能', max: 100 },
      { name: '应急处置', max: 100 },
      { name: '团队协作', max: 100 },
      { name: '体能素质', max: 100 },
      { name: '沟通能力', max: 100 },
      { name: '学习能力', max: 100 }
    ],
    data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 50) + 50)
  }
}

interface HexagonChartProps {
  title: string
  type: 'department' | 'staff'
}

export function HexagonChart({ title, type }: HexagonChartProps) {
  const [selectedId, setSelectedId] = useState<string>(type === 'department' ? departments[0].id : staffMembers[0].id)
  const [chartData, setChartData] = useState(type === 'department' ? generateDepartmentData() : generateStaffData())

  // 当选择改变时，生成新的随机数据
  useEffect(() => {
    const newData = type === 'department' ? generateDepartmentData() : generateStaffData()
    setChartData(newData)
  }, [selectedId, type])

  // 定时更新数据，模拟实时变化
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = type === 'department' ? generateDepartmentData() : generateStaffData()
      setChartData(newData)
    }, 10000)
    return () => clearInterval(interval)
  }, [type])

  const options = {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: 0,
      textStyle: {
        fontSize: 11
      }
    },
    radar: {
      indicator: chartData.indicators,
      radius: '65%',
      center: ['50%', '50%'],
      splitNumber: 4,
      axisName: {
        color: '#64748b',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: '#e2e8f0'
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(59, 130, 246, 0.05)', 'rgba(59, 130, 246, 0.1)']
        }
      },
      axisLine: {
        lineStyle: {
          color: '#cbd5e1'
        }
      }
    },
    series: [
      {
        name: type === 'department' ? '部门建设情况' : '个人能力评估',
        type: 'radar',
        data: [
          {
            value: chartData.data,
            name: type === 'department' ? '当前状态' : '能力评分',
            itemStyle: { 
              color: type === 'department' ? '#3b82f6' : '#8b5cf6' 
            },
            lineStyle: {
              width: 2
            },
            areaStyle: {
              color: type === 'department' 
                ? 'rgba(59, 130, 246, 0.3)' 
                : 'rgba(139, 92, 246, 0.3)'
            }
          }
        ]
      }
    ]
  }

  const items = type === 'department' ? departments : staffMembers
  const selectedName = items.find(item => item.id === selectedId)?.name || ''

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Select 
            value={selectedId} 
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-[140px] h-8 text-sm"
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground mb-2 text-center">
          当前查看：{selectedName}
        </div>
        <ReactECharts option={options} style={{ height: '320px', width: '100%' }} notMerge={true} />
      </CardContent>
    </Card>
  )
}
