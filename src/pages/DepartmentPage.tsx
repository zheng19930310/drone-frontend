import React, { useEffect, useState } from 'react'
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { departmentAPI } from '@/lib/api'

interface Department {
  id: number
  deptName: string
  deptType: string
  coordinateLat: string
  coordinateLng: string
  parentId: number
  contactPerson: string
  contactPhone: string
  createTime: number
  updateTime: number
}

export default function DepartmentPage() {
  const { success, error } = useToast()
  const [list, setList] = useState<Department[]>([])
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [searchKey, setSearchKey] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Department | null>(null)
  const [formData, setFormData] = useState({
    deptName: '', deptType: 'base', coordinateLat: '', coordinateLng: '',
    parentId: 0, contactPerson: '', contactPhone: '',
  })

  const fetchData = async () => {
    try {
      const res: any = await departmentAPI.list(pageNum, pageSize, searchKey)
      if (res.code === 200) {
        setList(res.data.records || [])
        setTotal(res.data.total || 0)
      }
    } catch { error('加载失败') }
  }

  useEffect(() => { fetchData() }, [pageNum, searchKey])

  const handleSearch = () => { setSearchKey(keyword); setPageNum(1) }
  const resetForm = () => {
    setFormData({ deptName: '', deptType: 'base', coordinateLat: '', coordinateLng: '', parentId: 0, contactPerson: '', contactPhone: '' })
    setEditItem(null)
  }
  const openCreate = () => { resetForm(); setModalOpen(true) }
  const openEdit = (item: Department) => {
    setEditItem(item)
    setFormData({
      deptName: item.deptName, deptType: item.deptType, coordinateLat: item.coordinateLat,
      coordinateLng: item.coordinateLng, parentId: item.parentId,
      contactPerson: item.contactPerson, contactPhone: item.contactPhone,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (editItem) {
        await departmentAPI.update(editItem.id, formData)
        success('更新成功')
      } else {
        await departmentAPI.create(formData)
        success('创建成功')
      }
      setModalOpen(false)
      fetchData()
    } catch { error('操作失败') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除？')) return
    try { await departmentAPI.delete(id); success('删除成功'); fetchData() } catch { error('删除失败') }
  }

  return (
    <div className="page-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">部门管理</h1><p className="text-muted-foreground text-sm mt-1">管理安保部门信息</p></div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" />新增部门</Button>
      </div>

      <div className="card p-4">
        <div className="flex gap-3">
          <Input placeholder="搜索部门名称" value={keyword} onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="w-72" />
          <Button variant="secondary" onClick={handleSearch}><Search className="w-4 h-4 mr-1" />搜索</Button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>部门名称</th><th>类型</th><th>坐标</th><th>联系人</th><th>联系电话</th><th>创建时间</th><th>操作</th></tr></thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.deptName}</td>
                  <td><span className="badge badge-default">{item.deptType === 'base' ? '基站' : item.deptType === 'counter' ? '反制' : item.deptType}</span></td>
                  <td className="text-muted-foreground text-xs">{item.coordinateLat}, {item.coordinateLng}</td>
                  <td>{item.contactPerson}</td>
                  <td>{item.contactPhone}</td>
                  <td className="text-muted-foreground text-xs">{item.createTime ? new Date(item.createTime).toLocaleString('zh-CN') : '-'}</td>
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

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetForm() }} title={editItem ? '编辑部门' : '新增部门'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">部门名称</label>
            <Input value={formData.deptName} onChange={(e) => setFormData({ ...formData, deptName: e.target.value })} placeholder="请输入" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">部门类型</label>
              <select className="select" value={formData.deptType} onChange={(e) => setFormData({ ...formData, deptType: e.target.value })}>
                <option value="base">基站</option><option value="counter">反制</option><option value="other">其他</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">上级部门ID</label>
              <Input type="number" value={formData.parentId} onChange={(e) => setFormData({ ...formData, parentId: Number(e.target.value) })} placeholder="0为顶级" />
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">联系人</label>
              <Input value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} placeholder="请输入" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">联系电话</label>
              <Input value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} placeholder="请输入" />
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
