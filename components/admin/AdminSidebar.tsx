import React from 'react'
import { Home, Folder, PlusCircle, Clock, CheckCircle, XCircle, Settings, LogOut } from 'lucide-react'

export default function AdminSidebar() {
  return (
    <aside className="w-44 bg-[#173B8C] min-h-screen border-r shadow-sm flex-shrink-0">
      <div className="h-full flex flex-col justify-between text-white">
        <div>
          <div className="px-3 py-4 flex flex-col items-start gap-3">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-[#173B8C] font-bold text-sm">PE</div>
          </div>

          <nav className="px-2 mt-2">
            <ul className="space-y-1 text-sm">
              <li className="px-2 py-2 rounded hover:bg-white/10 cursor-pointer flex items-center gap-3"><Home size={16} /> <span className="hidden md:inline">Tableau</span></li>
              <li className="px-2 py-2 rounded hover:bg-white/10 cursor-pointer flex items-center gap-3"><Folder size={16} /> <span className="hidden md:inline">Dossiers</span></li>
              <li className="px-2 py-2 rounded hover:bg-white/10 cursor-pointer flex items-center gap-3"><PlusCircle size={16} /> <span className="hidden md:inline">Nouveaux</span></li>
              <li className="px-2 py-2 rounded hover:bg-white/10 cursor-pointer flex items-center gap-3"><Clock size={16} /> <span className="hidden md:inline">En cours</span></li>
              <li className="px-2 py-2 rounded hover:bg-white/10 cursor-pointer flex items-center gap-3"><CheckCircle size={16} /> <span className="hidden md:inline">Terminés</span></li>
              <li className="px-2 py-2 rounded hover:bg-white/10 cursor-pointer flex items-center gap-3"><XCircle size={16} /> <span className="hidden md:inline">Refusés</span></li>
            </ul>
          </nav>
        </div>

        <div className="px-2 py-4 text-sm">
          <div className="flex items-center justify-start text-white/90 mb-3"><Settings size={16} /> <span className="hidden md:inline ml-2">Paramètres</span></div>
          <div className="flex items-center gap-2 cursor-pointer"><LogOut size={16} /> <span className="hidden md:inline ml-2">Déconnexion</span></div>
        </div>
      </div>
    </aside>
  )
}

