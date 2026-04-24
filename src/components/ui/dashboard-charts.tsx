import React, { useEffect, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'

// Generate random data for demo
function generateTaskData() {
  return [
    { value: Math.floor(Math.random() * 10) + 5, name: '执行中', itemStyle: { color: '#10b981' } },
    { value: Math.floor(Math.random() * 8) + 2, name: '待分配', itemStyle: { color: '#f59e0b' } },
    { value: Math.floor(Math.random() * 15) + 8, name: '已完成', itemStyle: { color: '#3b82f6' } },
    { value: Math.floor(Math.random() * 4) + 1, name: '已取消', itemStyle: { color: '#ef4444' } }
  ]
}

function generateEquipmentData() {
  return {
    online: Array.from({ length: 7 }, () => Math.floor(Math.random() * 10) + 18),
    offline: Array.from({ length: 7 }, () => Math.floor(Math.random() * 5) + 1)
  }
}

function generateAlarmData() {
  return {
    thisWeek: Array.from({ length: 5 }, () => Math.floor(Math.random() * 10) + 2),
    lastWeek: Array.from({ length: 5 }, () => Math.floor(Math.random() * 8) + 2)
  }
}

function generateStaffData() {
  return {
    current: Array.from({ length: 6 }, () => Math.floor(Math.random() * 30) + 60),
    standard: [90, 85, 95, 85, 90, 95]
  }
}

// Chart 1: Task Status Distribution (Pie Chart)
export function TaskStatusChart() {
  const [data, setData] = useState(generateTaskData())

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateTaskData())
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const option = {
    title: {
      text: '任务状态分布',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        fontSize: 11
      }
    },
    series: [
      {
        name: '任务状态',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '55%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{c}',
          fontSize: 11
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 13,
            fontWeight: 'bold'
          }
        },
        data: data
      }
    ]
  }

  return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} notMerge={true} />
}

// Chart 2: Equipment Usage Trend (Line Chart)
export function EquipmentTrendChart() {
  const [data, setData] = useState(generateEquipmentData())

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateEquipmentData())
    }, 20000)
    return () => clearInterval(interval)
  }, [])

  const option = {
    title: {
      text: '设备使用趋势',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['在线设备', '离线设备'],
      bottom: 0,
      textStyle: {
        fontSize: 11
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLabel: {
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10
      }
    },
    series: [
      {
        name: '在线设备',
        type: 'line',
        smooth: true,
        data: data.online,
        itemStyle: { color: '#10b981' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
          ])
        }
      },
      {
        name: '离线设备',
        type: 'line',
        smooth: true,
        data: data.offline,
        itemStyle: { color: '#ef4444' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
            { offset: 1, color: 'rgba(239, 68, 68, 0.05)' }
          ])
        }
      }
    ]
  }

  return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} notMerge={true} />
}

// Chart 3: Alarm Statistics (Bar Chart)
export function AlarmStatsChart() {
  const [data, setData] = useState(generateAlarmData())

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateAlarmData())
    }, 25000)
    return () => clearInterval(interval)
  }, [])

  const option = {
    title: {
      text: '预警统计分析',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['本周', '上周'],
      bottom: 0,
      textStyle: {
        fontSize: 11
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['设备异常', '违规飞行', '信号丢失', '电量不足', '其他'],
      axisLabel: {
        fontSize: 10,
        rotate: 15
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10
      }
    },
    series: [
      {
        name: '本周',
        type: 'bar',
        data: data.thisWeek,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3b82f6' },
            { offset: 1, color: '#1d4ed8' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '上周',
        type: 'bar',
        data: data.lastWeek,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#94a3b8' },
            { offset: 1, color: '#64748b' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  }

  return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} notMerge={true} />
}

// Chart 4: Staff Distribution (Radar Chart)
export function StaffDistributionChart() {
  const [data, setData] = useState(generateStaffData())

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateStaffData())
    }, 18000)
    return () => clearInterval(interval)
  }, [])

  const option = {
    title: {
      text: '人员技能分布',
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
      data: ['当前配置', '标准配置'],
      bottom: 0,
      textStyle: {
        fontSize: 11
      }
    },
    radar: {
      indicator: [
        { name: '无人机操作', max: 100 },
        { name: '应急处置', max: 100 },
        { name: '通信联络', max: 100 },
        { name: '数据分析', max: 100 },
        { name: '设备维护', max: 100 },
        { name: '指挥协调', max: 100 }
      ],
      radius: '60%',
      center: ['50%', '45%']
    },
    series: [
      {
        name: '人员技能',
        type: 'radar',
        data: [
          {
            value: data.current,
            name: '当前配置',
            itemStyle: { color: '#3b82f6' },
            areaStyle: {
              color: 'rgba(59, 130, 246, 0.3)'
            }
          },
          {
            value: data.standard,
            name: '标准配置',
            itemStyle: { color: '#10b981' },
            areaStyle: {
              color: 'rgba(16, 185, 129, 0.2)'
            }
          }
        ]
      }
    ]
  }

  return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} notMerge={true} />
}
