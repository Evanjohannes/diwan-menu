'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  Settings, 
  Image, 
  CheckCircle, 
  XCircle,
  Upload,
  Save,
  X,
  Menu as MenuIcon,
  Coffee,
  Tag,
  RefreshCw
} from 'lucide-react'

type MenuItem = {
  id: number
  category_id: number
  name: string
  price: number
  is_available: boolean
  image_url: string | null
}

type Category = {
  id: number
  name: string
}

type Variant = {
  id: number
  item_id: number
  label: string
  price: number
}

export default function DashboardPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [menuTitle, setMenuTitle] = useState('')
  const [titleMessage, setTitleMessage] = useState('')

  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newCategoryId, setNewCategoryId] = useState('')
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items')
  
  // Image upload states for individual items
  const [uploadingImageFor, setUploadingImageFor] = useState<number | null>(null)
  const [imageUploadMessage, setImageUploadMessage] = useState<{id: number, text: string} | null>(null)

  const [variants, setVariants] = useState<Variant[]>([])
  const [newVariantLabel, setNewVariantLabel] = useState<{ [itemId: number]: string }>({})
  const [newVariantPrice, setNewVariantPrice] = useState<{ [itemId: number]: string }>({})

  useEffect(() => {
    checkUserAndLoad()
  }, [])

  const checkUserAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/admin')
      return
    }

    await loadItems()
    await loadCategories()
    await loadTitle()
    await loadVariants()
    setLoading(false)
  }

  const loadVariants = async () => {
    const { data } = await supabase.from('item_variants').select('*').order('id')
    setVariants(data || [])
  }

  const loadItems = async () => {
    const { data } = await supabase.from('menu_items').select('*').order('id')
    setItems(data || [])
  }

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('id')
    setCategories(data || [])
  }

  const loadTitle = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('menu_title')
      .limit(1)
      .single()

    setMenuTitle(data?.menu_title || '')
  }

  // --- Menu title ---
  const updateTitle = async (e: React.FormEvent) => {
    e.preventDefault()
    setTitleMessage('')

    const { data } = await supabase.from('site_settings').select('id').limit(1).single()

    if (data?.id) {
      await supabase
        .from('site_settings')
        .update({ menu_title: menuTitle })
        .eq('id', data.id)
    }

    setTitleMessage('Menu title updated! ✨')
    setTimeout(() => setTitleMessage(''), 3000)
  }

  // --- Menu items ---
  const updatePrice = async (id: number, newPrice: number) => {
    await supabase.from('menu_items').update({ price: newPrice }).eq('id', id)
    loadItems()
  }

  const toggleAvailability = async (id: number, current: boolean) => {
    await supabase.from('menu_items').update({ is_available: !current }).eq('id', id)
    loadItems()
  }

  const deleteItem = async (id: number) => {
    const confirmed = window.confirm('Delete this item?')
    if (!confirmed) return

    await supabase.from('menu_items').delete().eq('id', id)
    loadItems()
  }

  const addVariant = async (itemId: number) => {
    const label = newVariantLabel[itemId]
    const price = newVariantPrice[itemId]

    if (!label || !price) {
      alert('Enter both a size label and price')
      return
    }

    await supabase.from('item_variants').insert({
      item_id: itemId,
      label,
      price: Number(price),
    })

    setNewVariantLabel((prev) => ({ ...prev, [itemId]: '' }))
    setNewVariantPrice((prev) => ({ ...prev, [itemId]: '' }))
    loadVariants()
  }

  const updateVariantPrice = async (id: number, price: number) => {
    await supabase.from('item_variants').update({ price }).eq('id', id)
    loadVariants()
  }

  const deleteVariant = async (id: number) => {
    const confirmed = window.confirm('Delete this size option?')
    if (!confirmed) return

    await supabase.from('item_variants').delete().eq('id', id)
    loadVariants()
  }

  // --- Improved Image Management ---
  const uploadItemImage = async (id: number, file: File) => {
    if (!file) return
    
    setUploadingImageFor(id)
    setImageUploadMessage(null)
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(fileName, file)

    if (uploadError) {
      alert('Image upload failed: ' + uploadError.message)
      setUploadingImageFor(null)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('menu-images')
      .getPublicUrl(fileName)

    await supabase
      .from('menu_items')
      .update({ image_url: publicUrlData.publicUrl })
      .eq('id', id)

    await loadItems()
    setUploadingImageFor(null)
    setImageUploadMessage({ id, text: '✅ Image uploaded successfully!' })
    setTimeout(() => setImageUploadMessage(null), 3000)
  }

  const removeItemImage = async (id: number) => {
    const confirmed = window.confirm('Remove this photo?')
    if (!confirmed) return

    await supabase
      .from('menu_items')
      .update({ image_url: '' })
      .eq('id', id)

    await loadItems()
    setImageUploadMessage({ id, text: '🗑️ Image removed' })
    setTimeout(() => setImageUploadMessage(null), 3000)
  }

  // File input refs for each item
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})

  const handleFileSelect = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadItemImage(id, file)
    }
    // Reset input so same file can be selected again
    if (e.target) {
      e.target.value = ''
    }
  }

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newName || !newPrice || !newCategoryId) {
      alert('Fill in all fields')
      return
    }

    let imageUrl = ''

    if (newImageFile) {
      setUploading(true)
      const fileExt = newImageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(fileName, newImageFile)

      if (uploadError) {
        alert('Image upload failed: ' + uploadError.message)
        setUploading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('menu-images')
        .getPublicUrl(fileName)

      imageUrl = publicUrlData.publicUrl
      setUploading(false)
    }

    await supabase.from('menu_items').insert({
      name: newName,
      price: Number(newPrice),
      category_id: Number(newCategoryId),
      is_available: true,
      image_url: imageUrl,
    })

    setNewName('')
    setNewPrice('')
    setNewCategoryId('')
    setNewImageFile(null)
    loadItems()
  }

  // --- Categories ---
  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setCategoryError('')

    if (!newCategoryName.trim()) return

    await supabase.from('categories').insert({ name: newCategoryName.trim() })
    setNewCategoryName('')
    loadCategories()
  }

  const startEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id)
    setEditingCategoryName(cat.name)
  }

  const saveCategory = async (id: number) => {
    await supabase
      .from('categories')
      .update({ name: editingCategoryName })
      .eq('id', id)

    setEditingCategoryId(null)
    loadCategories()
  }

  const deleteCategory = async (id: number) => {
    const itemsInCategory = items.filter((item) => item.category_id === id)

    if (itemsInCategory.length > 0) {
      setCategoryError(
        'Cannot delete this category — it still has menu items in it. Delete or move those items first.'
      )
      return
    }

    const confirmed = window.confirm('Delete this category?')
    if (!confirmed) return

    await supabase.from('categories').delete().eq('id', id)
    loadCategories()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c9a24b] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-serif">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Top Border */}
      <div className="h-1 bg-gradient-to-r from-[#c9a24b] via-[#e8d5b5] to-[#c9a24b]" />

      {/* Header */}
      <div className="bg-white border-b border-[#f0ebe3] sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2f3b2f] flex items-center justify-center">
                <Coffee className="w-5 h-5 text-[#faf7f2]" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-[#2f3b2f]">Diwan Dashboard</h1>
                <p className="text-xs text-[#8a7a5a]">Manage your menu</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/dashboard/settings')}
                className="p-2 rounded-lg hover:bg-[#faf7f2] transition-colors"
              >
                <Settings className="w-5 h-5 text-[#8a7a5a]" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Menu Title Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-[#f0ebe3]">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-[#c9a24b]" />
            <h2 className="font-semibold text-[#2f3b2f]">Menu Title</h2>
          </div>
          <form onSubmit={updateTitle} className="flex gap-3">
            <input
              type="text"
              value={menuTitle}
              onChange={(e) => setMenuTitle(e.target.value)}
              className="flex-1 border border-[#e8e0d5] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#c9a24b] focus:border-transparent outline-none transition-all"
              placeholder="Enter menu title..."
            />
            <button 
              type="submit" 
              className="bg-[#2f3b2f] text-white px-6 py-2 rounded-lg hover:bg-[#3f4f3f] transition-all font-medium"
            >
              <Save className="w-4 h-4 inline mr-2" />
              Save
            </button>
          </form>
          {titleMessage && (
            <p className="text-[#c9a24b] text-sm mt-3 font-medium">{titleMessage}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-[#f0ebe3] shadow-sm">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 px-6 py-2 rounded-lg transition-all font-medium text-sm ${
              activeTab === 'items'
                ? 'bg-[#2f3b2f] text-white shadow-md'
                : 'text-[#8a7a5a] hover:bg-[#faf7f2]'
            }`}
          >
            <MenuIcon className="w-4 h-4 inline mr-2" />
            Menu Items
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 px-6 py-2 rounded-lg transition-all font-medium text-sm ${
              activeTab === 'categories'
                ? 'bg-[#2f3b2f] text-white shadow-md'
                : 'text-[#8a7a5a] hover:bg-[#faf7f2]'
            }`}
          >
            <Coffee className="w-4 h-4 inline mr-2" />
            Categories
          </button>
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#f0ebe3]">
            <div className="flex items-center gap-2 mb-6">
              <Coffee className="w-5 h-5 text-[#c9a24b]" />
              <h2 className="font-semibold text-[#2f3b2f]">Manage Categories</h2>
            </div>

            {categoryError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {categoryError}
              </div>
            )}

            <div className="space-y-3 mb-6">
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  className="flex items-center gap-3 p-3 bg-[#faf7f2] rounded-lg hover:bg-[#f5f0ea] transition-colors"
                >
                  {editingCategoryId === cat.id ? (
                    <>
                      <input
                        type="text"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        className="flex-1 border border-[#e8e0d5] rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#c9a24b] focus:border-transparent outline-none"
                      />
                      <button
                        onClick={() => saveCategory(cat.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingCategoryId(null)}
                        className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 font-medium text-[#2f3b2f]">{cat.name}</span>
                      <span className="text-sm text-gray-400">
                        {items.filter(item => item.category_id === cat.id).length} items
                      </span>
                      <button
                        onClick={() => startEditCategory(cat)}
                        className="p-2 text-[#c9a24b] hover:bg-[#f5f0ea] rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={addCategory} className="flex gap-3">
              <input
                type="text"
                placeholder="New category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 border border-[#e8e0d5] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#c9a24b] focus:border-transparent outline-none transition-all"
              />
              <button 
                type="submit" 
                className="bg-[#2f3b2f] text-white px-6 py-2 rounded-lg hover:bg-[#3f4f3f] transition-all font-medium"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Category
              </button>
            </form>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <>
            {/* Menu Items List */}
            <div className="space-y-6 mb-8">
              {categories.map((cat) => {
                const categoryItems = items.filter((item) => item.category_id === cat.id)
                if (categoryItems.length === 0) return null

                return (
                  <div key={cat.id} className="bg-white rounded-2xl shadow-sm p-6 border border-[#f0ebe3]">
                    <h3 className="text-lg font-serif font-semibold text-[#2f3b2f] mb-4">
                      {cat.name}
                    </h3>

                    <div className="space-y-3">
                      {categoryItems.map((item) => (
                        <div key={item.id} className="border border-[#f0ebe3] rounded-xl p-4 hover:border-[#d8c9a3] transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            {/* Image with upload/change controls */}
                            <div className="flex-shrink-0">
                              {uploadingImageFor === item.id ? (
                                <div className="w-20 h-20 rounded-lg bg-[#faf7f2] flex items-center justify-center border-2 border-[#c9a24b]">
                                  <div className="w-6 h-6 border-2 border-[#c9a24b] border-t-transparent rounded-full animate-spin" />
                                </div>
                              ) : item.image_url ? (
                                <div className="relative group">
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-20 h-20 rounded-lg object-cover border-2 border-[#f0ebe3]"
                                  />
                                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => {
                                        const input = fileInputRefs.current[item.id]
                                        if (input) input.click()
                                      }}
                                      className="p-1.5 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                      title="Change photo"
                                    >
                                      <RefreshCw className="w-3 h-3 text-[#2f3b2f]" />
                                    </button>
                                    <button
                                      onClick={() => removeItemImage(item.id)}
                                      className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                                      title="Remove photo"
                                    >
                                      <X className="w-3 h-3 text-white" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  className="w-20 h-20 rounded-lg bg-[#faf7f2] flex items-center justify-center border-2 border-dashed border-[#e8e0d5] cursor-pointer hover:border-[#c9a24b] transition-colors group"
                                  onClick={() => {
                                    const input = fileInputRefs.current[item.id]
                                    if (input) input.click()
                                  }}
                                >
                                  <div className="text-center">
                                    <Image className="w-6 h-6 text-gray-300 group-hover:text-[#c9a24b] transition-colors mx-auto" />
                                    <span className="text-[8px] text-gray-400 group-hover:text-[#c9a24b] transition-colors">Add photo</span>
                                  </div>
                                </div>
                              )}
                              
                              {/* Hidden file input */}
                              <input
                                ref={(el) => {
                                  fileInputRefs.current[item.id] = el
                                }}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileSelect(item.id, e)}
                              />
                              
                              {/* Image upload status message */}
                              {imageUploadMessage?.id === item.id && (
                                <p className="text-xs mt-1 text-green-600 font-medium">
                                  {imageUploadMessage.text}
                                </p>
                              )}
                            </div>

                            {/* Item Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[#2f3b2f] truncate">{item.name}</p>
                              <div className="flex flex-wrap items-center gap-3 mt-1">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-medium text-[#8a7a5a]">birr</span>
                                  <input
                                    type="number"
                                    defaultValue={item.price}
                                    onBlur={(e) => updatePrice(item.id, Number(e.target.value))}
                                    className="w-20 border border-[#e8e0d5] rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-[#c9a24b] focus:border-transparent outline-none"
                                  />
                                </div>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={item.is_available}
                                    onChange={() => toggleAvailability(item.id, item.is_available)}
                                    className="w-4 h-4 accent-[#2f3b2f]"
                                  />
                                  {item.is_available ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" /> Available
                                    </span>
                                  ) : (
                                    <span className="text-red-500 flex items-center gap-1">
                                      <XCircle className="w-3 h-3" /> Unavailable
                                    </span>
                                  )}
                                                                </label>
                              </div>

                              {/* Size Options */}
                              <div className="mt-3 pl-2 border-l-2 border-[#e8e0d5] space-y-2">
                                <p className="text-xs font-semibold text-[#8a7a5a]">Size options</p>

                                {variants
                                  .filter((v) => v.item_id === item.id)
                                  .map((v) => (
                                    <div key={v.id} className="flex items-center gap-2 text-sm">
                                      <span className="flex-1">{v.label}</span>
                                      <input
                                        type="number"
                                        defaultValue={v.price}
                                        onBlur={(e) => updateVariantPrice(v.id, Number(e.target.value))}
                                        className="w-20 border border-[#e8e0d5] rounded px-2 py-1 text-sm"
                                      />
                                      <button
                                        onClick={() => deleteVariant(v.id)}
                                        className="text-red-500 text-xs underline"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ))}

                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Size name (e.g. Mini)"
                                    value={newVariantLabel[item.id] || ''}
                                    onChange={(e) =>
                                      setNewVariantLabel((prev) => ({ ...prev, [item.id]: e.target.value }))
                                    }
                                    className="flex-1 border border-[#e8e0d5] rounded px-2 py-1 text-sm"
                                  />
                                  <input
                                    type="number"
                                    placeholder="Price"
                                    value={newVariantPrice[item.id] || ''}
                                    onChange={(e) =>
                                      setNewVariantPrice((prev) => ({ ...prev, [item.id]: e.target.value }))
                                    }
                                    className="w-20 border border-[#e8e0d5] rounded px-2 py-1 text-sm"
                                  />
                                  <button
                                    onClick={() => addVariant(item.id)}
                                    className="text-xs bg-[#2f3b2f] text-white px-2 py-1 rounded"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {!item.image_url && (
                                <button
                                  onClick={() => {
                                    const input = fileInputRefs.current[item.id]
                                    if (input) input.click()
                                  }}
                                  className="px-3 py-1.5 text-xs bg-[#c9a24b] text-white rounded-lg hover:bg-[#b8923a] transition-colors flex items-center gap-1"
                                >
                                  <Upload className="w-3 h-3" />
                                  Add Photo
                                </button>
                              )}
                              {item.image_url && (
                                <button
                                  onClick={() => {
                                    const input = fileInputRefs.current[item.id]
                                    if (input) input.click()
                                  }}
                                  className="px-3 py-1.5 text-xs bg-[#2f3b2f] text-white rounded-lg hover:bg-[#3f4f3f] transition-colors flex items-center gap-1"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  Change
                                </button>
                              )}
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {categories.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-[#f0ebe3]">
                  <Coffee className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400">No categories yet. Add one to start building your menu!</p>
                </div>
              )}
            </div>

            {/* Add New Item Form */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#f0ebe3]">
              <div className="flex items-center gap-2 mb-6">
                <Plus className="w-5 h-5 text-[#c9a24b]" />
                <h2 className="font-semibold text-[#2f3b2f]">Add New Menu Item</h2>
              </div>

              <form onSubmit={addItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border border-[#e8e0d5] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#c9a24b] focus:border-transparent outline-none transition-all"
                  />

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#8a7a5a]">birr</span>
                    <input
                      type="number"
                      placeholder="Price"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full border border-[#e8e0d5] rounded-lg pl-12 pr-4 py-2 focus:ring-2 focus:ring-[#c9a24b] focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    className="border border-[#e8e0d5] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#c9a24b] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  <div className="border border-[#e8e0d5] rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-[#faf7f2] transition-colors">
                    <Image className="w-4 h-4 text-[#8a7a5a]" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
                      className="flex-1 text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#2f3b2f] file:text-white hover:file:bg-[#3f4f3f] transition-colors"
                    />
                    {newImageFile && (
                      <span className="text-xs text-green-600">✓ {newImageFile.name}</span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-[#2f3b2f] text-white rounded-lg px-6 py-3 hover:bg-[#3f4f3f] transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Menu Item
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}