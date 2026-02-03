/**
 * HabitatSynthesePanel.jsx
 * 
 * Panneau de synthèse HABITAT_OPTIMAL pour Mon Territoire BIONIC™
 * 
 * Fonctionnalités:
 * - Sélection de l'espèce cible
 * - Affichage des pondérations par module
 * - Statistiques de synthèse
 * - Meilleurs points de chasse
 * - Détails analyse alimentaire 200%
 */

import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { 
  Target, ChevronDown, ChevronUp, Zap, TreePine, Droplets,
  Leaf, Navigation, Moon, Heart, MapPin, Waves, Sun, Compass,
  Trees, Award, TrendingUp, BarChart3, Info, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Import du service
import { 
  ESPECES, 
  MODULES_THEMATIQUES, 
  PONDERATIONS,
  genererCarteBionic 
} from '@/services/HabitatOptimalService';

// Icônes pour les modules
const MODULE_ICONS = {
  ZONES_DE_REFUGE: TreePine,
  ZONES_DE_FRAICHEUR: Droplets,
  ZONES_D_ALIMENTATION: Leaf,
  ZONES_DE_DEPLACEMENTS: Navigation,
  ZONES_DORTOIR: Moon,
  RUT_POTENTIEL: Heart,
  SALINES_POTENTIELLES: MapPin,
  AFFUTS_POTENTIELS: Target,
  HYDROGRAPHIE_AVANCEE: Waves,
  ENSOLEILLEMENT: Sun,
  ORIENTATION: Compass,
  PEUPLEMENTS_FORESTIERS: Trees,
  ANALYSE_ALIMENTAIRE_200: Sparkles
};

/**
 * Composant d'affichage d'une pondération de module
 */
const PonderationItem = memo(function PonderationItem({ moduleId, poids, nom, couleur }) {
  const Icon = MODULE_ICONS[moduleId] || Target;
  const pourcentage = Math.round(poids * 100);
  
  if (poids === 0) return null;
  
  return (
    <div className="flex items-center gap-2 py-1">
      <div 
        className="w-6 h-6 rounded flex items-center justify-center"
        style={{ backgroundColor: `${couleur}20` }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color: couleur }} />
      </div>
      <span className="text-xs text-gray-300 flex-1 truncate">{nom}</span>
      <div className="w-16">
        <Progress value={pourcentage} className="h-1.5" />
      </div>
      <span className="text-xs text-[#f5a623] w-8 text-right">{pourcentage}%</span>
    </div>
  );
});

/**
 * Composant de statistique
 */
const StatCard = memo(function StatCard({ label, value, icon: Icon, color = '#f5a623', subLabel }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4" style={{ color }} />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      {subLabel && <div className="text-[10px] text-gray-500">{subLabel}</div>}
    </div>
  );
});

/**
 * Composant de meilleur point de chasse
 */
const MeilleurPointItem = memo(function MeilleurPointItem({ point, rang }) {
  const isTop3 = rang <= 3;
  
  return (
    <div className={`flex items-center gap-2 p-2 rounded ${
      isTop3 ? 'bg-[#f5a623]/10 border border-[#f5a623]/30' : 'bg-gray-800/50'
    }`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
        rang === 1 ? 'bg-yellow-500 text-black' :
        rang === 2 ? 'bg-gray-400 text-black' :
        rang === 3 ? 'bg-amber-700 text-white' :
        'bg-gray-700 text-gray-300'
      }`}>
        {rang}
      </div>
      <div className="flex-1">
        <div className="text-xs text-white font-medium">
          Point #{rang}
        </div>
        <div className="text-[10px] text-gray-400">
          {point.niveauHabitat}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-[#f5a623]">{Math.round(point.habitatOptimal)}%</div>
      </div>
    </div>
  );
});

/**
 * Panneau principal de synthèse Habitat Optimal
 */
const HabitatSynthesePanel = memo(function HabitatSynthesePanel({
  zones = [],
  onEspeceChange,
  onCarteBionicGenerated,
  initialEspece = 'ORIGNAL'
}) {
  // État
  const [espece, setEspece] = useState(initialEspece);
  const [carteBionic, setCarteBionic] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    ponderations: true,
    stats: true,
    points: true,
    alimentaire: false
  });
  
  // Pondérations de l'espèce sélectionnée
  const ponderationsEspece = useMemo(() => {
    return PONDERATIONS[espece] || PONDERATIONS.ORIGNAL;
  }, [espece]);
  
  // Info espèce
  const especeInfo = ESPECES[espece];
  
  // Toggle section
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);
  
  // Changer d'espèce
  const handleEspeceChange = useCallback((newEspece) => {
    setEspece(newEspece);
    onEspeceChange?.(newEspece);
  }, [onEspeceChange]);
  
  // Générer la carte BIONIC
  const genererCarte = useCallback(async () => {
    if (!zones || zones.length === 0) return;
    
    setIsCalculating(true);
    
    try {
      // Simuler un délai pour le feedback visuel
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const carte = genererCarteBionic(zones, espece, {
        nombreMeilleursPoints: 10,
        seuilAffichage: 30
      });
      
      setCarteBionic(carte);
      onCarteBionicGenerated?.(carte);
      
    } catch (error) {
      console.error('[HABITAT_OPTIMAL] Erreur génération:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [zones, espece, onCarteBionicGenerated]);
  
  // Regénérer quand l'espèce ou les zones changent
  useEffect(() => {
    if (zones && zones.length > 0) {
      genererCarte();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [espece, zones.length]);
  
  // Stats
  const stats = carteBionic?.stats || null;
  const meilleursPoints = carteBionic?.meilleursPoints || [];
  
  return (
    <div className="space-y-3">
      {/* Header avec sélecteur d'espèce */}
      <div className="bg-gradient-to-r from-[#f5a623]/20 to-purple-500/20 rounded-lg p-3 border border-[#f5a623]/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#f5a623]" />
            <span className="text-sm font-bold text-white">HABITAT_OPTIMAL_SYNTHÈSE</span>
            <Badge className="bg-purple-500/30 text-purple-300 text-[9px]">v2.0</Badge>
          </div>
        </div>
        
        {/* Sélecteur d'espèce */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Espèce cible:</span>
          <Select value={espece} onValueChange={handleEspeceChange}>
            <SelectTrigger className="w-48 h-8 bg-gray-800/80 border-gray-700 text-sm">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span>{especeInfo?.icon}</span>
                  <span>{especeInfo?.nom}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {Object.values(ESPECES).map(esp => (
                <SelectItem 
                  key={esp.id} 
                  value={esp.id.toUpperCase()}
                  className="text-white hover:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <span>{esp.icon}</span>
                    <span>{esp.nom}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {isCalculating && (
            <div className="flex items-center gap-1 text-xs text-[#f5a623]">
              <div className="animate-spin h-3 w-3 border-2 border-[#f5a623] border-t-transparent rounded-full" />
              Calcul...
            </div>
          )}
        </div>
        
        {/* Description espèce */}
        {especeInfo && (
          <div className="mt-2 text-[10px] text-gray-500 italic">
            {especeInfo.nomScientifique} - {especeInfo.description}
          </div>
        )}
      </div>
      
      {/* Section Pondérations */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
        <div 
          className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-700/30"
          onClick={() => toggleSection('ponderations')}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-medium text-white">Pondérations Inter-Modules</span>
          </div>
          {expandedSections.ponderations ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
        
        {expandedSections.ponderations && (
          <div className="px-3 pb-3 space-y-1">
            {Object.entries(ponderationsEspece)
              .filter(([_, poids]) => poids > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([moduleId, poids]) => {
                const moduleInfo = MODULES_THEMATIQUES[moduleId] || {
                  nom: moduleId === 'ANALYSE_ALIMENTAIRE_200' ? 'Analyse Alimentaire 200%' : moduleId,
                  couleur: '#f5a623'
                };
                return (
                  <PonderationItem
                    key={moduleId}
                    moduleId={moduleId}
                    poids={poids}
                    nom={moduleInfo.nom}
                    couleur={moduleInfo.couleur}
                  />
                );
              })}
          </div>
        )}
      </div>
      
      {/* Section Statistiques */}
      {stats && (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
          <div 
            className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-700/30"
            onClick={() => toggleSection('stats')}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-xs font-medium text-white">Statistiques de Synthèse</span>
            </div>
            {expandedSections.stats ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
          
          {expandedSections.stats && (
            <div className="px-3 pb-3">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <StatCard
                  label="Zones analysées"
                  value={stats.totalZones}
                  icon={MapPin}
                  color="#3498DB"
                />
                <StatCard
                  label="Score moyen"
                  value={`${Math.round(stats.scoresMoyens.global)}%`}
                  icon={TrendingUp}
                  color="#2ECC71"
                />
              </div>
              
              {/* Distribution des niveaux */}
              <div className="text-[10px] text-gray-500 mb-2">Distribution des habitats:</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-[10px] text-gray-300 flex-1">Excellent</span>
                  <span className="text-[10px] text-green-400">{stats.distribution.excellent}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-lime-500" />
                  <span className="text-[10px] text-gray-300 flex-1">Très bon</span>
                  <span className="text-[10px] text-lime-400">{stats.distribution.tresBon}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-500" />
                  <span className="text-[10px] text-gray-300 flex-1">Bon</span>
                  <span className="text-[10px] text-yellow-400">{stats.distribution.bon}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-orange-500" />
                  <span className="text-[10px] text-gray-300 flex-1">Moyen</span>
                  <span className="text-[10px] text-orange-400">{stats.distribution.moyen}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span className="text-[10px] text-gray-300 flex-1">Faible</span>
                  <span className="text-[10px] text-red-400">{stats.distribution.faible}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Section Meilleurs Points */}
      {meilleursPoints.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
          <div 
            className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-700/30"
            onClick={() => toggleSection('points')}
          >
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#f5a623]" />
              <span className="text-xs font-medium text-white">Meilleurs Points de Chasse</span>
              <Badge className="bg-[#f5a623]/30 text-[#f5a623] text-[9px]">
                Top {meilleursPoints.length}
              </Badge>
            </div>
            {expandedSections.points ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
          
          {expandedSections.points && (
            <div className="px-3 pb-3 space-y-1.5 max-h-48 overflow-y-auto">
              {meilleursPoints.map((point, idx) => (
                <MeilleurPointItem 
                  key={idx} 
                  point={point} 
                  rang={point.rang || idx + 1} 
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Footer */}
      <div className="text-center">
        <span className="text-[9px] text-gray-600">
          BIONIC™ HABITAT_OPTIMAL_SYNTHÈSE v2.0 • {zones.length} zones
        </span>
      </div>
    </div>
  );
});

HabitatSynthesePanel.displayName = 'HabitatSynthesePanel';

export default HabitatSynthesePanel;
