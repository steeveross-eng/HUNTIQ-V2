/**
 * TerritoryHeader.jsx
 * 
 * Header principal de la page Mon Territoire BIONIC™
 * Contient: Navigation, Mode LIVE, Sync Status, Notifications, Groupes, Tabs
 * 
 * Architecture: Micro-Frontend Ready
 */

import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, ArrowLeft, Zap, Wifi, WifiOff, RefreshCw, Cloud, 
  Users, Plus, ChevronDown, Map, MapPin, BookMarked, X,
  Navigation, Crosshair, Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { ShareWaypointDialog, CreateGroupDialog, NotificationBell } from '@/components/territoire/ShareComponents';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════
// SOUS-COMPOSANTS
// ═══════════════════════════════════════════════════════════════

/**
 * Panneau de notifications déroulant
 */
const NotificationsPanel = memo(({ 
  notifications, 
  unreadCount, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onClose 
}) => {
  return (
    <div className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
      <div className="p-3 border-b border-gray-700 flex items-center justify-between">
        <span className="text-sm font-medium text-white">Notifications</span>
        {unreadCount > 0 && (
          <button 
            onClick={onMarkAllAsRead}
            className="text-xs text-[#f5a623] hover:underline"
          >
            Tout marquer lu
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Aucune notification
          </div>
        ) : (
          notifications.slice(0, 10).map(notif => (
            <div 
              key={notif.id}
              className={`p-3 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer ${!notif.read ? 'bg-[#f5a623]/5' : ''}`}
              onClick={() => onMarkAsRead(notif.id)}
            >
              <div className="flex items-start gap-2">
                {!notif.read && (
                  <span className="w-2 h-2 bg-[#f5a623] rounded-full mt-1.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{notif.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{notif.message}</p>
                  <p className="text-[10px] text-gray-600 mt-1">
                    {new Date(notif.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

NotificationsPanel.displayName = 'NotificationsPanel';

/**
 * Menu de création de waypoint
 */
const WaypointCreationMenu = memo(({
  mapClickMode,
  quickWaypointMode,
  onQuickWaypointFromGPS,
  onEnableMapClickMode,
  onShowAddDialog,
  onCancelMode
}) => {
  const isActive = mapClickMode || quickWaypointMode;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={`${isActive ? 'bg-green-500 hover:bg-green-600 animate-pulse' : 'bg-[#f5a623] hover:bg-[#f5a623]/80'} text-black font-medium px-4`}
          data-testid="add-waypoint-quick-btn"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isActive ? 'Cliquez sur la carte...' : 'Enregistrer un Waypoint'}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-900 border-gray-700 w-64 z-[9999]">
        {/* Enregistrement GPS instantané */}
        <DropdownMenuItem 
          onClick={onQuickWaypointFromGPS}
          className="text-white hover:bg-gray-800 cursor-pointer py-3"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Navigation className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <div className="font-medium">Ma position GPS</div>
              <div className="text-xs text-gray-400">Enregistrement instantané</div>
            </div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-gray-700" />
        
        {/* Mode clic sur la carte */}
        <DropdownMenuItem 
          onClick={onEnableMapClickMode}
          className="text-white hover:bg-gray-800 cursor-pointer py-3"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Crosshair className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <div className="font-medium">Cliquer sur la carte</div>
              <div className="text-xs text-gray-400">Sélectionner un point</div>
            </div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-gray-700" />
        
        {/* Saisie manuelle des coordonnées */}
        <DropdownMenuItem 
          onClick={onShowAddDialog}
          className="text-white hover:bg-gray-800 cursor-pointer py-3"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 rounded-lg bg-[#f5a623]/20 flex items-center justify-center">
              <Edit2 className="h-4 w-4 text-[#f5a623]" />
            </div>
            <div>
              <div className="font-medium">Saisir les coordonnées</div>
              <div className="text-xs text-gray-400">Entrée manuelle</div>
            </div>
          </div>
        </DropdownMenuItem>
        
        {/* Option annulation si mode actif */}
        {isActive && (
          <>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem 
              onClick={onCancelMode}
              className="text-red-400 hover:bg-gray-800 cursor-pointer py-2"
            >
              <X className="h-4 w-4 mr-2" />
              Annuler le mode clic
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

WaypointCreationMenu.displayName = 'WaypointCreationMenu';

/**
 * Menu des groupes de chasse
 */
const GroupsMenu = memo(({ 
  groups, 
  onCreateGroup, 
  onSelectGroup 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-[#f5a623]/50 text-[#f5a623] hover:bg-[#f5a623]/10"
          data-testid="group-menu-btn"
        >
          <Users className="h-4 w-4 mr-1" />
          Groupe
          {groups.length > 0 && (
            <Badge className="ml-1 bg-[#f5a623] text-black text-[10px]">{groups.length}</Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-900 border-gray-700 min-w-[200px]">
        <DropdownMenuItem 
          onClick={onCreateGroup}
          className="text-[#f5a623] cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Créer un groupe
        </DropdownMenuItem>
        
        {groups.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-gray-700" />
            <div className="px-2 py-1 text-xs text-gray-500">Mes groupes</div>
            {groups.map(group => (
              <DropdownMenuItem 
                key={group.id}
                onClick={() => onSelectGroup(group)}
                className="text-white cursor-pointer hover:bg-gray-800"
              >
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                <span className="flex-1 truncate">{group.name}</span>
                {group.member_count && (
                  <Badge className="ml-1 bg-gray-700 text-gray-300 text-[10px]">{group.member_count}</Badge>
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        {groups.length === 0 && (
          <div className="px-3 py-2 text-xs text-gray-500 text-center">
            Aucun groupe pour le moment
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

GroupsMenu.displayName = 'GroupsMenu';

/**
 * Sélecteur espèce cible
 */
const SpeciesSelector = memo(({ selectedEspece, onSelectEspece }) => {
  const speciesOptions = [
    { id: 'ORIGNAL', label: '🦌 Orignal' },
    { id: 'CHEVREUIL', label: '🦌 Chevreuil' },
    { id: 'OURS_NOIR', label: '🐻 Ours Noir' },
    { id: 'DINDON', label: '🦃 Dindon' }
  ];
  
  const currentLabel = speciesOptions.find(s => s.id === selectedEspece)?.label || selectedEspece;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="bg-gray-900/80 hover:bg-gray-800 border border-gray-700 hover:border-[#f5a623]/50 rounded-md px-4 h-10"
          data-testid="espece-cible-dropdown"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Espèce cible</span>
            <span className="text-sm font-medium text-white">{currentLabel}</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-900 border border-gray-700 w-56 z-[9999]" align="center">
        {speciesOptions.map(option => (
          <DropdownMenuItem 
            key={option.id}
            onClick={() => onSelectEspece(option.id)}
            className={`cursor-pointer ${selectedEspece === option.id ? 'bg-[#f5a623]/20 text-[#f5a623]' : 'text-white hover:bg-gray-800'}`}
          >
            {option.label}
            {selectedEspece === option.id && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

SpeciesSelector.displayName = 'SpeciesSelector';

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════

const TerritoryHeader = ({
  // Onglet actif
  activeTab,
  onTabChange,
  
  // Mode LIVE
  liveMode,
  onLiveModeChange,
  
  // Sync Status
  isOnline,
  syncing,
  
  // Notifications
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  
  // Groupes
  groups = [],
  onCreateGroup,
  onSelectGroup,
  
  // Waypoints counts
  activeWaypointsCount = 0,
  savedPlacesCount = 0,
  
  // Waypoint Creation
  mapClickMode,
  quickWaypointMode,
  onQuickWaypointFromGPS,
  onEnableMapClickMode,
  onShowAddWaypointDialog,
  onCancelWaypointMode,
  
  // Espèce
  selectedEspece,
  onSelectEspece
}) => {
  const navigate = useNavigate();
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  
  const handleToggleNotifications = useCallback(() => {
    setShowNotificationsPanel(prev => !prev);
  }, []);
  
  return (
    <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-[#f5a623]/30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left section - Navigation & Title */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')} 
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="h-6 w-px bg-gray-700" />
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-[#f5a623]" />
              <div>
                <h1 className="text-lg font-bold text-white">Mon Territoire BIONIC™</h1>
                <p className="text-[10px] text-gray-400">Analyse • Waypoints • Lieux</p>
              </div>
            </div>
          </div>
          
          {/* Right section - Controls */}
          <div className="flex items-center gap-3">
            {/* Mode LIVE */}
            <div className="flex items-center gap-2 bg-gray-900/80 rounded-lg px-3 py-1.5 border border-gray-700">
              <Zap className={`h-4 w-4 ${liveMode ? 'text-green-400' : 'text-gray-500'}`} />
              <span className="text-xs text-gray-400">LIVE</span>
              <Switch 
                checked={liveMode} 
                onCheckedChange={onLiveModeChange} 
                className="data-[state=checked]:bg-green-500" 
              />
            </div>
            
            {/* Statut Sync */}
            <div className={`flex items-center gap-2 bg-gray-900/80 rounded-lg px-3 py-1.5 border ${isOnline ? 'border-green-700/50' : 'border-red-700/50'}`}>
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-400" />
              )}
              {syncing ? (
                <RefreshCw className="h-3 w-3 text-blue-400 animate-spin" />
              ) : (
                <Cloud className={`h-3 w-3 ${isOnline ? 'text-green-400' : 'text-red-400'}`} />
              )}
              <span className="text-[10px] text-gray-400">
                {syncing ? 'Sync...' : isOnline ? 'Sync' : 'Offline'}
              </span>
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <NotificationBell 
                count={unreadCount} 
                onClick={handleToggleNotifications}
              />
              {showNotificationsPanel && (
                <NotificationsPanel
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={onMarkAsRead}
                  onMarkAllAsRead={onMarkAllAsRead}
                  onClose={() => setShowNotificationsPanel(false)}
                />
              )}
            </div>
            
            {/* Groupes de Chasse */}
            <GroupsMenu
              groups={groups}
              onCreateGroup={onCreateGroup}
              onSelectGroup={onSelectGroup}
            />
          </div>
        </div>
        
        {/* Tabs & Actions Row */}
        <div className="mt-3">
          <div className="flex items-center gap-3">
            <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
              <TabsList className="bg-gray-900/50 border border-gray-800">
                <TabsTrigger 
                  value="carte" 
                  className="data-[state=active]:bg-[#f5a623]/20 data-[state=active]:text-[#f5a623]"
                >
                  <Map className="h-4 w-4 mr-2" />
                  Carte BIONIC™
                </TabsTrigger>
                <TabsTrigger 
                  value="waypoints" 
                  className="data-[state=active]:bg-[#f5a623]/20 data-[state=active]:text-[#f5a623]"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Waypoints actifs
                  {activeWaypointsCount > 0 && (
                    <Badge className="ml-2 bg-[#f5a623] text-black text-[10px]">{activeWaypointsCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="lieux" 
                  className="data-[state=active]:bg-[#f5a623]/20 data-[state=active]:text-[#f5a623]"
                >
                  <BookMarked className="h-4 w-4 mr-2" />
                  Lieux enregistrés
                  {savedPlacesCount > 0 && (
                    <Badge className="ml-2 bg-blue-500 text-white text-[10px]">{savedPlacesCount}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Waypoint Creation Menu */}
            <WaypointCreationMenu
              mapClickMode={mapClickMode}
              quickWaypointMode={quickWaypointMode}
              onQuickWaypointFromGPS={onQuickWaypointFromGPS}
              onEnableMapClickMode={onEnableMapClickMode}
              onShowAddDialog={onShowAddWaypointDialog}
              onCancelMode={onCancelWaypointMode}
            />
            
            {/* Species Selector */}
            <SpeciesSelector
              selectedEspece={selectedEspece}
              onSelectEspece={onSelectEspece}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(TerritoryHeader);
export { NotificationsPanel, WaypointCreationMenu, GroupsMenu, SpeciesSelector };
