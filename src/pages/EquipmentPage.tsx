import React, { useEffect, useState } from 'react'
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { equipmentAPI, departmentAPI } from '@/lib/api'

interface Equipment {
  id: number
  deptId: number
  equipmentName: string
  equipmentType: string
  equipmentModel: string
  coordinateLat: string
  coordinateLng: string
  status: string
  createTime: number
  updateTime: number
}

export default function EquipmentPage() {
  const { success, error } = useToast()
  const [list, setList] = useState<Equipment[]>([])
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [searchKey, setSearchKey] = useState('')
  const [deptId, setDeptId] = useState<number | undefined>(undefined)
  const [departments, setDepartments] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Equipment | null>(null)
  const [formData, setFormData] = useState({
    deptId: 0, equipmentName: '', equipmentType: 'base', equipmentModel: '',
    coordinateLat: '', coordinateLng: '', status: 'available',
  })

  const fetchDepartments = async () => {
    try {
      const res: any = await departmentAPI.list(1, 100, '')
      if (res.code === 200) setDepartments(res.data.records || [])
    } catch {}
  }

  const fetchData = async () => {
    try {
      const res: any = await equipmentAPI.list(pageNum, pageSize, deptId, searchKey)
      if (res.code === 200) {
        setList(res.data.records || [])
        setTotal(res.data.total || 0)
      }
    } catch { error('加载失败') }
  }

  useEffect(() => { fetchDepartments() }, [])
  useEffect(() => { fetchData() }, [pageNum, searchKey, deptId])

  const handleSearch = () => { setSearchKey(keyword); setPageNum(1) }
  const resetForm = () => {
    setFormData({ deptId: 0, equipmentName: '', equipmentType: 'base', equipmentModel: '', coordinateLat: '', coordinateLng: '', status: 'available' })
    setEditItem(null)
  }
  const openCreate = () => { resetForm(); setModalOpen(true) }
  const openEdit = (item: Equipment) => {
    setEditItem(item)
    setFormData({
      deptId: item.deptId, equipmentName: item.equipmentName, equipmentType: item.equipmentType,
      equipmentModel: item.equipmentModel, coordinateLat: item.coordinateLat, coordinateLng: item.coordinateLng, status: item.status,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (editItem) { await equipmentAPI.update(editItem.id, formData); success('更新成功') }
      else { await equipmentAPI.create(formData); success('创建成功') }
      setModalOpen(false); fetchData()
    } catch { error('操作失败') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除？')) return
    try { await equipmentAPI.delete(id); success('删除成功'); fetchData() } catch { error('删除失败') }
  }

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; variant: any }> = {
      available: { label: '可用', variant: 'success' },
      in_use: { label: '使用中', variant: 'default' },
      maintenance: { label: '维护中', variant: 'warning' },
    }
    const v = map[s] || { label: s, variant: 'muted' }
    return <span className={`badge badge-${v.variant}`}>{v.label}</span>
  }

  return (
    <div className="page-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">设备管理</h1><p className="text-muted-foreground text-sm mt-1">管理察打设备信息</p></div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" />新增设备</Button>
      </div>

      <div className="card p-4">
        <div className="flex gap-3 flex-wrap">
          <Input placeholder="搜索设备名称" value={keyword} onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="w-64" />
          <select className="select w-40" value={deptId ?? ''} onChange={(e) => setDeptId(e.target.value ? Number(e.target.value) : undefined)}>
            <option value="">全部部门</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.deptName}</option>)}
          </select>
          <Button variant="secondary" onClick={handleSearch}><Search className="w-4 h-4 mr-1" />搜索</Button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>设备名称</th><th>类型</th><th>型号</th><th>所属部门</th><th>坐标</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.equipmentName}</td>
                  <td><span className="badge badge-default">{item.equipmentType === 'base' ? '基站' : item.equipmentType === 'counter' ? '反制' : item.equipmentType}</span></td>
                  <td>{item.equipmentModel}</td>
                  <td>{departments.find((d) => d.id === item.deptId)?.deptName || '-'}</td>
                  <td className="text-muted-foreground text-xs">{item.coordinateLat}, {item.coordinateLng}</td>
                  <td>{statusBadge(item.status)}</td>
                  <td className="text-muted-foreground text-xs">{item.createTime ? new Date(item.createTime).toLocaleString('zh-CN') : '-'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="p-1 rounded hover:bg-muted text-muted-foreground" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></button>
                      <button className="p-1 rounded hover:bg-destructive/10 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">暂无数据</td></tr>}
            </tbody>
          </table>
        </div>
        {total > pageSize && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <span className="text-sm text-muted-foreground">共 {total} 条</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={pageNum <= 1} onClick={() => setPageNum(p => p - 1)}>上一页</Button>
              <span className="text-sm">{pageNum} / {Math.ceil(total / pageSize)}</span>
              <Button variant="outline" size="sm" disabled={pageNum >= Math.ceil(total / pageSize)} onClick={() => setPageNum(p => p + 1)}>下一页</Button>
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetForm() }} title={editItem ? '编辑设备' : '新增设备'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">设备名称</label>
              <Input value={formData.equipmentName} onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })} placeholder="请输入" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">所属部门</label>
              <select className="select" value={formData.deptId} onChange={(e) => setFormData({ ...formData, deptId: Number(e.target.value) })}>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.deptName}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">设备类型</label>
              <select className="select" value={formData.equipmentType} onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}>
                <option value="base">基站</option><option value="counter">反制</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">设备型号</label>
              <Input value={formData.equipmentModel} onChange={(e) => setFormData({ ...formData, equipmentModel: e.target.value })} placeholder="请输入" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">坐标纬度</label>
              <Input value={formData.coordinateLat} onChange={(e) => setFormData({ ...formData, coordinateLat: e.target.value })} placeholder="纬度" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">坐标经度</label>
              <Input value={formData.coordinateLng} onChange={(e) => setFormData({ ...formData, coordinateLng: e.target.value })} placeholder="经度" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setModalOpen(false); resetForm() }}>取消</Button>
            <Button onClick={handleSubmit}>{editItem ? '保存' : '创建'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
