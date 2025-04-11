// src/components/layout/navbar/vinyl-nav-dropdown.tsx
"use client"

import { useState } from "react"
import { clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Los tipos ayudan a entender la estructura de datos
type CategoryChild = {
  id: string
  name: string
  handle: string
}

type Category = {
  id: string
  name: string
  handle: string
  parent_category: any | null
  category_children?: CategoryChild[]
}

// Componente cliente que maneja la interactividad
export default function VinylNavDropdown({ 
  categories 
}: { 
  categories: Category[] 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeParent, setActiveParent] = useState<string | null>(null)

  // Filtramos solo las categorías padres (sin parent_category)
  const parentCategories = categories.filter(cat => !cat.parent_category)
  
  // Cuando el dropdown se abre por primera vez, activamos la primera categoría padre
  const handleOpenDropdown = () => {
    setIsOpen(true)
    if (!activeParent && parentCategories.length > 0) {
      setActiveParent(parentCategories[0].id)
    }
  }

  return (
    <div 
      className="relative"
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        className={clx(
          "flex items-center gap-1 px-4 py-2 text-ui-fg-base hover:text-ui-fg-subtle transition-colors",
          isOpen && "font-medium"
        )}
        onMouseEnter={handleOpenDropdown}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        Vinilos
        <svg 
          className={clx("w-4 h-4 transition-transform", isOpen && "rotate-180")}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 bg-white shadow-lg rounded-md border border-ui-border-base w-64 z-50">
          <div className="flex">
            {/* Panel izquierdo - Categorías padre */}
            <div className="w-1/2 border-r border-ui-border-base">
              <ul className="py-2">
                {parentCategories.map((parent) => (
                  <li key={parent.id}>
                    <button
                      className={clx(
                        "px-4 py-2 w-full text-left hover:bg-ui-bg-subtle transition-colors",
                        activeParent === parent.id && "bg-ui-bg-subtle font-medium"
                      )}
                      onMouseEnter={() => setActiveParent(parent.id)}
                    >
                      {parent.name}
                    </button>
                  </li>
                ))}
                <li>
                  <LocalizedClientLink
                    href="/categories/vinilos"
                    className="block px-4 py-2 text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle transition-colors text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Ver todos los vinilos
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Panel derecho - Categorías hijo */}
            <div className="w-1/2">
              {activeParent && (
                <ul className="py-2">
                  {parentCategories
                    .find(p => p.id === activeParent)?.category_children
                    ?.map((child) => (
                      <li key={child.id}>
                        <LocalizedClientLink
                          href={`/categories/${child.handle}`}
                          className="block px-4 py-2 hover:bg-ui-bg-subtle transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {child.name}
                        </LocalizedClientLink>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}