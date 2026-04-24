import React, { useEffect, useState } from 'react'
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { staffAPI, departmentAPI } from '@/lib/api'

interface Staff {
  id: number
  deptId: number
  staffName: string
  phone: string
  staffType: string
  skills: string
  status: string
  createTime: number
  updateTime: number
}

export default function StaffPage() {
  const { success, error } = useToast()
  const [list, setList] = useState<Staff[]>([])
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [searchKey, setSearchKey] = useState('')
  const [deptId, setDeptId] = useState<number | undefined>(undefined)
  const [departments, setDepartments] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Staff | null>(null)
  const [formData, setFormData] = useState({
    deptId: 0, staffName: '', phone: '', staffType: 'enforcer', skills: '', status: 'available',
  })

  const fetchDepartments = async () => {
    try {
      const res: any = await departmentAPI.list(1, 100, '')
      if (res.code === 200) setDepartments(res.data.records || [])
    } catch {}
  }

  const fetchData = async () => {
    try {
      const res: any = await staffAPI.list(pageNum, pageSize, deptId, searchKey)
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
    setFormData({ deptId: 0, staffName: '', phone: '', staffType: 'enforcer', skills: '', status: 'available' })
    setEditItem(null)
  }
  const openCreate = () => { resetForm(); setModalOpen(true) }
  const openEdit = (item: Staff) => {
    setEditItem(item)
    setFormData({
      deptId: item.deptId, staffName: item.staffName, phone: item.phone,
      staffType: item.staffType, skills: item.skills, status: item.status,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (editItem) { await staffAPI.update(editItem.id, formData); success('更新成功') }
      else { await staffAPI.create(formData); success('创建成功') }
      setModalOpen(false); fetchData()
    } catch { error('操作失败') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除？')) return
    try { await staffAPI.delete(id); success('删除成功'); fetchData() } catch { error('删除失败') }
  }

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; variant: any }> = {
      available: { label: '空闲', variant: 'success' },
      busy: { label: '忙碌', variant: 'warning' },
      off_duty: { label: '下班', variant: 'muted' },
    }
    const v = map[s] || { label: s, variant: 'muted' }
    return <span className={`badge badge-${v.variant}`}>{v.label}</span>
  }

  return (
    <div className="page-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">人员管理</h1><p className="text-muted-foreground text-sm mt-1">管理执勤人员信息</p></div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" />新增人员</Button>
      </div>

      <div className="card p-4">
        <div className="flex gap-3 flex-wrap">
          <Input placeholder="搜索人员姓名" value={keyword} onChange={(e) => setKeyword(e.target.value)}
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
            <thead><tr><th>姓名</th><th>手机号</th><th>所属部门</th><th>人员类型</th><th>技能</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.staffName}</td>
                  <td>{item.phone}</td>
                  <td>{departments.find((d) => d.id === item.deptId)?.deptName || '-'}</td>
                  <td><span className="badge badge-default">{item.staffType === 'enforcer' ? '执勤人员' : item.staffType}</span></td>
                  <td className="max-w-[200px] truncate">{item.skills}</td>
                  <td>{statusBadge(item.status)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="p-1 rounded hover:bg-muted text-muted-foreground" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></button>
                      <button className="p-1 rounded hover:bg-destructive/10 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">暂无数据</td></tr>}
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

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetForm() }} title={editItem ? '编辑人员' : '新增人员'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">姓名</label>
              <Input value={formData.staffName} onChange={(e) => setFormData({ ...formData, staffName: e.target.value })} placeholder="请输入" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">手机号</label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="请输入" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">所属部门</label>
              <select className="select" value={formData.deptId} onChange={(e) => setFormData({ ...formData, deptId: Number(e.target.value) })}>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.deptName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">人员类型</label>
              <select className="select" value={formData.staffType} onChange={(e) => setFormData({ ...formData, staffType: e.target.value })}>
                <option value="enforcer">执勤人员</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">技能列表</label>
            <Input value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} placeholder="多个技能用逗号分隔" />
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
