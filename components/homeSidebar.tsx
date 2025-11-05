"use client"
import { useState } from "react"
import { Calendar, Inbox, Home, Search, Settings,Folder,Users } from "lucide-react"
//todo : is selected and all
const items = [
  { title: "Home", icon: Home, url: "/" },
  { title: "Apps", icon: Folder, url: "/project" },
  { title: "Collaborators", icon: Users, url: "/collaborators" },

  { title: "Inbox", icon:Inbox, url: "/Inbox" },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={`h-screen bg-gray-900 text-white transition-all duration-300 w-16 lg:w-48
      }`}
    >
    
      <nav className="mt-4">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.title} >
            <a href={item.url}
                className="flex items-center px-3 py-2 rounded-md hover:bg-gray-800 lg:justify-start justify-center"
                >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="hidden lg:inline ml-3">{item.title}</span>
            </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}