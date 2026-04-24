import React, { useEffect, useState } from 'react'
import { Search, Plus, Pencil, Trash2, Users, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { taskScheduleAPI, scheduleResourceAPI, taskAPI, departmentAPI, staffAPI, equipmentAPI } from '@/lib/api'

interface TaskSchedule {
  id: number
  taskId: number
  schedulePointName: string
  coordinateLat: string
  coordinateLng: string
  departmentId: number
  staffCount: number
  equipmentType: string
  equipmentCount: number
  status: string
  createTime: number
  updateTime: number
}

export default function SchedulePage() {
  const { success, error } = useToast()
  const [tasks, setTasks] = useState<any[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [schedules, setSchedules] = useState<TaskSchedule[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<TaskSchedule | null>(null)
  const [formData, setFormData] = useState({
    taskId: 0, schedulePointName: '', coordinateLat: '', coordinateLng: '',
    departmentId: 0, staffCount: 1, equipmentType: '', equipmentCount: 0,
  })

  // Resource modal
  const [resourceModal, setResourceModal] = useState(false)
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null)
  const [resources, setResources] = useState<any[]>([])
  const [staffList, setStaffList] = useState<any[]>([])
  const [equipmentList, setEquipmentList] = useState<any[]>([])
  const [resourceForm, setResourceForm] = useState({ scheduleId: 0, staffId: 0, equipmentId: 0 })

  // Departments
  const [departments, setDepartments] = useState<any[]>([])

  const fetchTasks = async () => {
    try {
      const res: any = await taskAPI.list(1, 100, '', '')
      if (res.code === 200) setTasks(res.data.records || [])
    } catch {}
  }

  const fetchSchedules = async () => {
    if (!selectedTaskId) return
    try {
      const res: any = await taskScheduleAPI.listByTaskId(selectedTaskId)
      if (res.code === 200) setSchedules(res.data || [])
    } catch {}
  }

  const fetchDepartments = async () => {
    try {
      const res: any = await departmentAPI.list(1, 100, '')
      if (res.code === 200) setDepartments(res.data.records || [])
    } catch {}
  }

  const fetchResources = async (scheduleId: number) => {
    try {
      const res: any = await scheduleResourceAPI.list(scheduleId)
      if (res.code === 200) setResources(res.data || [])
    } catch {}
  }

  const fetchStaff = async () => {
    try {
      const res: any = await staffAPI.list(1, 100, undefined, '')
      if (res.code === 200) setStaffList(res.data.records || [])
    } catch {}
  }

  const fetchEquipment = async () => {
    try {
      const res: any = await equipmentAPI.list(1, 100, undefined, '')
      if (res.code === 200) setEquipmentList(res.data.records || [])
    } catch {}
  }

  useEffect(() => { fetchTasks(); fetchDepartments() }, [])
  useEffect(() => { fetchSchedules() }, [selectedTaskId])

  const handleSelectTask = (id: number) => { setSelectedTaskId(id); fetchSchedules() }

  const resetForm = () => {
    setFormData({
      taskId: selectedTaskId || 0, schedulePointName: '', coordinateLat: '', coordinateLng: '',
      departmentId: 0, staffCount: 1, equipmentType: '', equipmentCount: 0,
    })
    setEditItem(null)
  }

  const openCreate = () => { resetForm(); setModalOpen(true) }
  const openEdit = (item: TaskSchedule) => {
    setEditItem(item)
    setFormData({
      taskId: item.taskId, schedulePointName: item.schedulePointName,
      coordinateLat: item.coordinateLat, coordinateLng: item.coordinateLng,
      departmentId: item.departmentId, staffCount: item.staffCount,
      equipmentType: item.equipmentType, equipmentCount: item.equipmentCount,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (editItem) { await taskScheduleAPI.update(editItem.id, formData); success('更新成功') }
      else { await taskScheduleAPI.create(formData); success('创建成功') }
      setModalOpen(false); fetchSchedules()
    } catch { error('操作失败') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除？')) return
    try { await taskScheduleAPI.delete(id); success('删除成功'); fetchSchedules() } catch { error('删除失败') }
  }

  const openResourceModal = async (scheduleId: number) => {
    setSelectedScheduleId(scheduleId)
    setResourceForm({ scheduleId, staffId: 0, equipmentId: 0 })
    await fetchStaff()
    await fetchEquipment()
    await fetchResources(scheduleId)
    setResourceModal(true)
  }

  const handleAssignResource = async () => {
    try {
      if (resourceForm.staffId) {
        await scheduleResourceAPI.assign({ scheduleId: resourceForm.scheduleId, staffId: resourceForm.staffId, equipmentId: 0 })
      }
      if (resourceForm.equipmentId) {
        await scheduleResourceAPI.assign({ scheduleId: resourceForm.scheduleId, staffId: 0, equipmentId: resourceForm.equipmentId })
      }
      success('分配成功')
      await fetchResources(resourceForm.scheduleId)
    } catch { error('分配失败') }
  }

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; variant: any }> = {
      pending: { label: '待分配', variant: 'warning' },
      assigned: { label: '已分配', variant: 'default' },
      in_progress: { label: '执行中', variant: 'success' },
      finished: { label: '已结束', variant: 'muted' },
    }
    const v = map[s] || { label: s, variant: 'muted' }
    return <Badge variant={v.variant}>{v.label}</Badge>
  }

  return (
    <div className="page-fade-in space-y-6">
      <div><h1 className="text-2xl font-bold">调度管理</h1><p className="text-muted-foreground text-sm mt-1">管理任务调度点位与资源分配</p></div>

      {/* Task selector */}
      <div className="card p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-muted-foreground">选择任务：</span>
          <div className="flex gap-2 flex-wrap">
            {tasks.map((t) => (
              <button key={t.id}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${selectedTaskId === t.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                onClick={() => handleSelectTask(t.id)}>
                {t.taskName}
              </button>
            ))}
            {tasks.length === 0 && <span className="text-sm text-muted-foreground">暂无任务</span>}
          </div>
        </div>
      </div>

      {!selectedTaskId && <div className="text-center py-16 text-muted-foreground">请先选择一个任务查看调度信息</div>}

      {selectedTaskId && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">调度点位</h3>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" />新增点位</Button>
          </div>

          <div className="card overflow-hidden">
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>点位名称</th><th>坐标</th><th>分配部门</th><th>人员数</th><th>设备类型</th><th>设备数</th><th>状态</th><th>操作</th></tr></thead>
                <tbody>
                  {schedules.map((item) => (
                    <tr key={item.id}>
                      <td className="font-medium">{item.schedulePointName}</td>
                      <td className="text-muted-foreground text-xs">{item.coordinateLat}, {item.coordinateLng}</td>
                      <td>{departments.find((d) => d.id === item.departmentId)?.deptName || '-'}</td>
                      <td>{item.staffCount}</td>
                      <td>{item.equipmentType || '-'}</td>
                      <td>{item.equipmentCount}</td>
                      <td>{statusBadge(item.status)}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button className="p-1 rounded hover:bg-muted text-muted-foreground" title="资源分配" onClick={() => openResourceModal(item.id)}>
                            <Users className="w-4 h-4" />
                          </button>
                          <button className="p-1 rounded hover:bg-muted text-muted-foreground" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></button>
                          <button className="p-1 rounded hover:bg-destructive/10 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {schedules.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">暂无调度点位</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetForm() }} title={editItem ? '编辑点位' : '新增调度点位'} width="max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">点位名称</label>
            <Input value={formData.schedulePointName} onChange={(e) => setFormData({ ...formData, schedulePointName: e.target.value })} placeholder="请输入" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">纬度</label>
              <Input value={formData.coordinateLat} onChange={(e) => setFormData({ ...formData, coordinateLat: e.target.value })} placeholder="纬度" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">经度</label>
              <Input value={formData.coordinateLng} onChange={(e) => setFormData({ ...formData, coordinateLng: e.target.value })} placeholder="经度" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">分配部门</label>
              <select className="select" value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: Number(e.target.value) })}>
                <option value={0}>请选择</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.deptName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">人员数量</label>
              <Input type="number" value={formData.staffCount} onChange={(e) => setFormData({ ...formData, staffCount: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">设备类型</label>
              <select className="select" value={formData.equipmentType} onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}>
                <option value="">请选择</option><option value="base">基站</option><option value="counter">反制</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">设备数量</label>
              <Input type="number" value={formData.equipmentCount} onChange={(e) => setFormData({ ...formData, equipmentCount: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setModalOpen(false); resetForm() }}>取消</Button>
            <Button onClick={handleSubmit}>{editItem ? '保存' : '创建'}</Button>
          </div>
        </div>
      </Modal>

      {/* Resource Modal */}
      <Modal open={resourceModal} onClose={() => setResourceModal(false)} title="资源分配" width="max-w-xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"><Users className="w-4 h-4" />选择执勤人员</label>
              <select className="select" value={resourceForm.staffId} onChange={(e) => setResourceForm({ ...resourceForm, staffId: Number(e.target.value) })}>
                <option value={0}>请选择</option>
                {staffList.map((s) => <option key={s.id} value={s.id}>{s.staffName} ({s.phone})</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"><Radio className="w-4 h-4" />选择察打设备</label>
              <select className="select" value={resourceForm.equipmentId} onChange={(e) => setResourceForm({ ...resourceForm, equipmentId: Number(e.target.value) })}>
                <option value={0}>请选择</option>
                {equipmentList.filter((e) => e.status === 'available').map((e) => <option key={e.id} value={e.id}>{e.equipmentName}</option>)}
              </select>
            </div>
          </div>
          <Button onClick={handleAssignResource} className="w-full">确认分配</Button>

          {resources.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">已分配资源</h4>
              <div className="space-y-2">
                {resources.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm">
                    <span>
                      {r.staffId && staffList.find((s) => s.id === r.staffId)?.staffName}
                      {r.staffId && r.equipmentId && ' / '}
                      {r.equipmentId && equipmentList.find((e) => e.id === r.equipmentId)?.equipmentName}
                    </span>
                    <Badge variant="success">已分配</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
