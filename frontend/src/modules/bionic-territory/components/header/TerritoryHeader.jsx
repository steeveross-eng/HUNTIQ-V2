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
  Navigation, Crosshair, Edit2, Target, Home, CloudSun, Sprout, Activity, Flame, TreePine, Mountain
} from 'lucide-react';
import { SPECIES_IMAGES, THEMATIC_MODULES_CONFIG, getScoreRatingScientific } from '@/config/ProfessionalAssets';
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
 * Sélecteur espèce cible - Version Professionnelle avec photos réalistes
 */
const SpeciesSelector = memo(({ selectedEspece, onSelectEspece }) => {
  const speciesOptions = [
    { id: 'ORIGNAL', ...SPECIES_IMAGES.ORIGNAL },
    { id: 'CHEVREUIL', ...SPECIES_IMAGES.CHEVREUIL },
    { id: 'OURS_NOIR', ...SPECIES_IMAGES.OURS_NOIR },
    { id: 'DINDON', ...SPECIES_IMAGES.DINDON }
  ];
  
  const currentSpecies = speciesOptions.find(s => s.id === selectedEspece) || speciesOptions[0];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="bg-gray-900/80 hover:bg-gray-800 border border-gray-700 hover:border-[#f5a623]/50 rounded-md px-3 h-12 transition-all"
          data-testid="espece-cible-dropdown"
        >
          <div className="flex items-center gap-3">
            {/* Photo thumbnail */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-[#f5a623]/50 shadow-lg">
              <img 
                src={currentSpecies.thumbnail} 
                alt={currentSpecies.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">Espèce cible</span>
              <span className="text-sm font-semibold text-white">{currentSpecies.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 ml-1" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-900 border border-gray-700 w-72 p-0 z-[9999]" align="center">
        {/* Header du dropdown */}
        <div className="px-3 py-2 bg-gradient-to-r from-[#f5a623]/10 to-transparent border-b border-gray-700">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Sélectionner l'espèce cible</span>
        </div>
        
        {speciesOptions.map(species => (
          <DropdownMenuItem 
            key={species.id}
            onClick={() => onSelectEspece(species.id)}
            className={`cursor-pointer px-2 py-2 ${selectedEspece === species.id ? 'bg-[#f5a623]/15' : 'hover:bg-gray-800'}`}
          >
            <div className="flex items-center gap-3 w-full">
              {/* Photo de l'animal */}
              <div className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                selectedEspece === species.id ? 'border-[#f5a623] shadow-[0_0_10px_rgba(245,166,35,0.3)]' : 'border-gray-700'
              }`}>
                <img 
                  src={species.thumbnail} 
                  alt={species.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {selectedEspece === species.id && (
                  <div className="absolute inset-0 bg-[#f5a623]/20 flex items-center justify-center">
                    <div className="w-5 h-5 bg-[#f5a623] rounded-full flex items-center justify-center">
                      <span className="text-black text-xs font-bold">✓</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Informations */}
              <div className="flex-1">
                <div className={`text-sm font-semibold ${selectedEspece === species.id ? 'text-[#f5a623]' : 'text-white'}`}>
                  {species.name}
                </div>
                <div className="text-[10px] text-gray-500 italic font-mono">
                  {species.latinName}
                </div>
                <div className="text-[9px] text-gray-600 mt-0.5">
                  {species.description}
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        
        {/* Footer scientifique */}
        <div className="px-3 py-1.5 bg-gray-800/50 border-t border-gray-700">
          <span className="text-[8px] text-gray-500 font-mono">BIONIC™ Species Database v3.3</span>
        </div>
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
  onSelectEspece,
  
  // Habitat Score (nouveau)
  habitatScore = 63,
  habitatRating = { label: 'Bon', color: 'bg-yellow-500', textColor: 'text-yellow-400', emoji: '👍' },
  presenceProb = 95,
  bestTime = 'Crépuscule',
  thematicModules = [],
  onModuleToggle
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
            
            {/* Habitat Optimal Score avec Dropdown Modules */}
            <HabitatScoreDropdown
              score={habitatScore}
              rating={habitatRating}
              presenceProb={presenceProb}
              bestTime={bestTime}
              modules={thematicModules}
              onModuleToggle={onModuleToggle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Composant Habitat Score avec Dropdown des Modules Thématiques
 */
const HabitatScoreDropdown = memo(({
  score = 63,
  rating = { label: 'Bon', color: 'bg-yellow-500', textColor: 'text-yellow-400', emoji: '👍' },
  presenceProb = 95,
  bestTime = 'Crépuscule',
  modules = [],
  onModuleToggle
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Modules thématiques par défaut si non fournis
  const defaultModules = [
    { id: 'habitat', name: 'Habitat Optimal', icon: '🏠', enabled: true, score: 63 },
    { id: 'meteo', name: 'Analyse Météo', icon: '🌤️', enabled: true, score: 78 },
    { id: 'approche', name: 'Approche Optimale', icon: '🎯', enabled: true, score: 96 },
    { id: 'alimentation', name: 'Zones Alimentation', icon: '🍃', enabled: false, score: 73 },
    { id: 'comportement', name: 'Comportements', icon: '🦌', enabled: true, score: 85 },
    { id: 'hotspots', name: 'Hotspots IA', icon: '🔥', enabled: false, score: 91 }
  ];
  
  const activeModules = modules.length > 0 ? modules : defaultModules;
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="bg-gray-900/80 hover:bg-gray-800 border border-gray-700 hover:border-[#f5a623]/50 rounded-md px-3 h-10"
          data-testid="habitat-score-dropdown"
        >
          <div className="flex items-center gap-2">
            {/* Score principal */}
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-[#f5a623]">{score}</span>
              <span className="text-[10px] text-gray-500">/100</span>
            </div>
            
            {/* Emoji rating */}
            <span className="text-lg">{rating.emoji || '👍'}</span>
            
            {/* Label */}
            <div className="flex flex-col items-start">
              <span className={`text-[10px] font-semibold ${rating.textColor}`}>{rating.label?.toUpperCase()}</span>
              <span className="text-[8px] text-gray-500">Habitat Optimal</span>
            </div>
            
            {/* Flèche dropdown */}
            <ChevronDown className={`h-4 w-4 text-gray-400 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="bg-gray-900 border border-gray-700 w-72 p-0 z-[9999]" 
        align="end"
      >
        {/* En-tête du dropdown */}
        <div className="px-3 py-2 bg-gradient-to-r from-[#f5a623]/20 to-transparent border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[#f5a623]" />
              <span className="text-xs font-semibold text-white">MODULES THÉMATIQUES</span>
            </div>
            <Badge className="bg-green-500/20 text-green-400 text-[9px]">
              {activeModules.filter(m => m.enabled).length}/{activeModules.length}
            </Badge>
          </div>
        </div>
        
        {/* Résumé Habitat Optimal */}
        <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-700">
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Probabilité présence</span>
              <span className="text-green-400 font-bold">{presenceProb}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Meilleur moment</span>
              <span className="text-amber-400 font-medium">{bestTime}</span>
            </div>
          </div>
        </div>
        
        {/* Liste des modules */}
        <div className="max-h-[250px] overflow-y-auto">
          {activeModules.map((module) => (
            <div 
              key={module.id}
              className={`flex items-center justify-between px-3 py-2 hover:bg-gray-800/50 cursor-pointer border-b border-gray-800/50 transition-colors ${
                module.enabled ? '' : 'opacity-50'
              }`}
              onClick={() => onModuleToggle && onModuleToggle(module.id)}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{module.icon}</span>
                <div>
                  <div className="text-[11px] text-white font-medium">{module.name}</div>
                  <div className="text-[9px] text-gray-500">
                    Score: <span className={module.score >= 80 ? 'text-green-400' : module.score >= 60 ? 'text-yellow-400' : 'text-orange-400'}>
                      {module.score}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {module.enabled ? (
                  <Badge className="bg-green-500/20 text-green-400 text-[8px]">Actif</Badge>
                ) : (
                  <Badge className="bg-gray-700 text-gray-400 text-[8px]">Inactif</Badge>
                )}
                <div className={`w-2 h-2 rounded-full ${module.enabled ? 'bg-green-500' : 'bg-gray-600'}`} />
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="px-3 py-2 bg-gray-800/30 border-t border-gray-700">
          <div className="flex items-center justify-between text-[9px] text-gray-500">
            <span>Cliquez pour activer/désactiver</span>
            <span className="text-[#f5a623]">BIONIC™ v3.3</span>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

HabitatScoreDropdown.displayName = 'HabitatScoreDropdown';

export default memo(TerritoryHeader);
export { NotificationsPanel, WaypointCreationMenu, GroupsMenu, SpeciesSelector, HabitatScoreDropdown };
