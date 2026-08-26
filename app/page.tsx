'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Category = {
  id: number
  name: string
}

type MenuItem = {
  id: number
  category_id: number
  name: string
  price: number
  is_available: boolean
  image_url: string | null
}

export default function HomePage() {
  const [menuTitle, setMenuTitle] = useState('DESSERT MENU')
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: settings } = await supabase
      .from('site_settings')
      .select('menu_title')
      .limit(1)
      .single()

    if (settings?.menu_title) setMenuTitle(settings.menu_title)

    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .order('id')

    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('id')

    setCategories(cats || [])
    setItems(menuItems || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c9a24b] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-serif">Loading menu...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] pb-20">
      {/* Decorative Top Border */}
      <div className="h-1.5 bg-gradient-to-r from-[#c9a24b] via-[#e8d5b5] to-[#c9a24b]" />

      {/* Header - Bold & Prominent */}
      <div className="relative text-center pt-12 pb-8 px-6">
        {/* Background decorative circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-[#d8c9a3]/20 pointer-events-none" />
        
        <div className="relative z-10">
          {/* DIWAN - Bold & Large */}
          <div className="inline-block">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-black tracking-wider text-[#2f3b2f] leading-none">
              DIWAN
            </h1>
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#c9a24b] to-transparent mt-2" />
          </div>
          
          {/* Coffee • Dessert - Bold & Clear */}
          <p className="text-base md:text-lg font-bold uppercase tracking-[0.4em] text-[#5a4a3a] mt-4">
            Coffee <span className="text-[#c9a24b] mx-2">•</span> Dessert
          </p>
          
          {/* Diwan Coffee Menu - Bold */}
          <h2 className="text-2xl md:text-3xl font-bold text-[#2f3b2f] mt-2 tracking-wide">
            Diwan Coffee Menu
          </h2>
          
          {/* Decorative line with ✦ */}
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="h-px w-12 bg-[#c9a24b]" />
            <span className="text-[#c9a24b] text-xl font-bold">✦</span>
            <div className="h-px w-12 bg-[#c9a24b]" />
          </div>
          
          {/* Sweet Moments, Made Fresh - Bold & Elegant */}
          <p className="text-base md:text-lg font-semibold text-[#8a7a5a] mt-2 tracking-wide">
            Sweet Moments, Made Fresh
          </p>
          
          {/* Bottom decorative ✦ */}
          <div className="mt-2">
            <span className="text-[#c9a24b] text-lg font-bold">✦</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {categories.map((cat) => {
          const categoryItems = items.filter((item) => item.category_id === cat.id)
          if (categoryItems.length === 0) return null

          return (
            <div key={cat.id} className="mb-14">
              {/* Category Header with decorative elements */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#d8c9a3]" />
                <div className="relative">
                  <h2 className="text-xl md:text-2xl font-bold text-[#2f3b2f] tracking-wide px-4">
                    {cat.name}
                  </h2>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#c9a24b]" />
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d8c9a3]" />
              </div>

              {/* Grid with circular images */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="group flex flex-col items-center text-center transition-all duration-300 hover:transform hover:-translate-y-1"
                  >
                    {/* Circular Image Container */}
                    <div className="relative w-28 h-28 md:w-32 md:h-32 mb-3">
                      {item.image_url ? (
                        <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-[#faf7f2] shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#f0ebe3] to-[#e8e0d5] ring-4 ring-[#faf7f2] shadow-lg flex items-center justify-center">
                          <span className="text-3xl opacity-40">🍰</span>
                        </div>
                      )}
                      {/* Decorative ring on hover */}
                      <div className="absolute inset-0 rounded-full ring-2 ring-[#c9a24b]/0 group-hover:ring-[#c9a24b]/40 transition-all duration-300" />
                    </div>

                    {/* Item Name - Bold */}
                    <p className="font-semibold text-sm md:text-base text-[#2f3b2f] leading-tight min-h-[2.5rem] flex items-center">
                      {item.name}
                    </p>

                    {/* Price Badge */}
                    <span className="mt-1.5 inline-block bg-[#2f3b2f] text-[#f4e9d0] text-xs font-bold font-serif px-4 py-1.5 rounded-full shadow-sm group-hover:bg-[#c9a24b] group-hover:text-[#2f3b2f] transition-colors duration-300">
                      {item.price} birr
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer - Thank You Message */}
      <div className="mt-12 pt-8 border-t border-[#d8c9a3]/30 max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-[#d8c9a3]" />
            <span className="text-[#c9a24b] text-sm font-bold">✦</span>
            <div className="h-px w-8 bg-[#d8c9a3]" />
          </div>
          
          <div className="text-center space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8a7a5a] font-semibold">
              Premium Ingredients &bull; Freshly Made
            </p>
            <p className="text-sm text-[#8a7a5a] font-serif font-medium italic">
              Made fresh, made with love <span className="text-red-400">♥</span>
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-1">
            <div className="h-px w-6 bg-[#d8c9a3]" />
            <p className="text-[8px] uppercase tracking-[0.3em] text-[#b8a88a] font-semibold">
              Thank You For Choosing Us
            </p>
            <div className="h-px w-6 bg-[#d8c9a3]" />
          </div>
        </div>
      </div>
    </main>
  )
}