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
  category_children?: CategoryChild[]
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
  const [activeParent, setActiveParent] = useState<string | null>(null)

  // Filtramos solo las categorías padres (sin parent_category)
  const parentCategories = categories.filter(cat => !cat.parent_category)
  
  return (
    <nav className="relative">
      <ul className="flex items-center gap-8">
        {parentCategories.map((parent) => (
          <li 
            key={parent.id}
            className="relative"
            onMouseLeave={() => setActiveParent(null)}
          >
            <LocalizedClientLink
              href={`/categories/${parent.handle}`}
              className={clx(
                "block py-4 px-2 text-ui-fg-base hover:text-ui-fg-subtle transition-colors",
                activeParent === parent.id && "font-medium"
              )}
              onMouseEnter={() => setActiveParent(parent.id)}
            >
              {parent.name}
              {parent.category_children && parent.category_children.length > 0 && (
                <svg 
                  className="w-3 h-3 ml-1 inline-block"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              )}
            </LocalizedClientLink>
            
            {/* Dropdown para categorías hijas */}
            {activeParent === parent.id && parent.category_children && parent.category_children.length > 0 && (
              <div className="absolute left-0 mt-2 bg-white shadow-lg rounded-md border border-ui-border-base min-w-64 z-50">
                <ul className="py-3">
                  {parent.category_children.map((child) => (
                    <li key={child.id} className="relative group">
                      <div className="flex items-center justify-between">
                        <LocalizedClientLink
                          href={`/categories/${child.handle}`}
                          className="block px-6 py-3 hover:bg-ui-bg-subtle transition-colors w-full"
                          onClick={() => setActiveParent(null)}
                        >
                          {child.name}
                        </LocalizedClientLink>
                        
                        {/* Flecha para categorías nietas si existen */}
                        {child.category_children && child.category_children.length > 0 && (
                          <span className="mr-4 text-ui-fg-subtle">
                            <svg 
                              className="w-3 h-3"
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                          </span>
                        )}
                      </div>
                      
                      {/* Sub-dropdown para nietas (si existen) */}
                      {child.category_children && child.category_children.length > 0 && (
                        <div className="absolute left-full top-0 hidden group-hover:block bg-white shadow-lg rounded-md border border-ui-border-base min-w-56 z-50">
                          <ul className="py-3">
                            {child.category_children.map((grandchild) => (
                              <li key={grandchild.id}>
                                <LocalizedClientLink
                                  href={`/categories/${grandchild.handle}`}
                                  className="block px-6 py-3 hover:bg-ui-bg-subtle transition-colors"
                                  onClick={() => setActiveParent(null)}
                                >
                                  {grandchild.name}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                  
                  <li className="border-t border-ui-border-base mt-2 pt-2">
                    <LocalizedClientLink
                      href={`/categories/${parent.handle}`}
                      className="block px-6 py-3 text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle transition-colors text-sm"
                      onClick={() => setActiveParent(null)}
                    >
                      Ver todo en {parent.name}
                    </LocalizedClientLink>
                  </li>
                </ul>
              </div>
            )}
          </li>
        ))}
        
        {/* Opción "Ver todos" */}
        <li>
          <LocalizedClientLink
            href="/categories/vinilos"
            className="block py-4 px-2 text-ui-fg-base hover:text-ui-fg-subtle transition-colors"
          >
            Ver todos
          </LocalizedClientLink>
        </li>
      </ul>
    </nav>
  )
}