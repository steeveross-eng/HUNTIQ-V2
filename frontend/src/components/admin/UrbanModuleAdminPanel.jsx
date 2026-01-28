/**
 * UrbanModuleAdminPanel.jsx
 * 
 * Panneau d'administration pour le module urbain BIONIC™
 * 
 * Fonctionnalités:
 * - Visualisation des rapports QA urbains
 * - Configuration des paramètres (buffer, rayon de recherche)
 * - Statistiques de relocalisation en temps réel
 * - Activation/désactivation des règles
 * - Export des rapports QA
 */

import React, { useState, useEffect, memo, useCallback } from 'react';
import { 
  Building2, Settings, Shield, CheckCircle, AlertTriangle,
  ChevronDown, ChevronUp, RefreshCw, Download, MapPin,
  Sliders, Eye, EyeOff, Info, Zap, Target, Map
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

// Import de la configuration du module urbain
import { URBAN_CONFIG, URBAIN_FULL } from '@/services/UrbanExclusionService';

/**
 * Composant de configuration d'un paramètre avec slider
 */
const ParameterSlider = memo(function ParameterSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  description,
  onChange,
  disabled = false
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">{label}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 border-gray-700 max-w-xs">
                <p className="text-xs">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="text-sm font-medium text-[#f5a623]">
          {value}{unit}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
        disabled={disabled}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] text-gray-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
});

/**
 * Composant d'affichage d'une règle QA
 */
const QACheckItem = memo(function QACheckItem({ check, index }) {
  const isPassed = check.passed;
  
  return (
    <div className={`flex items-center justify-between p-2 rounded ${
      isPassed ? 'bg-green-900/20' : 'bg-red-900/20'
    }`}>
      <div className="flex items-center gap-2">
        {isPassed ? (
          <CheckCircle className="h-4 w-4 text-green-400" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-red-400" />
        )}
        <span className={`text-xs ${isPassed ? 'text-green-300' : 'text-red-300'}`}>
          {check.id}
        </span>
      </div>
      <Badge className={`text-[9px] ${
        isPassed ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'
      }`}>
        {isPassed ? 'PASS' : 'FAIL'}
      </Badge>
    </div>
  );
});

/**
 * Composant d'affichage d'une zone urbaine
 */
const UrbanZoneItem = memo(function UrbanZoneItem({ zoneName, polygon, isActive, onToggle }) {
  const pointCount = polygon?.length || 0;
  
  return (
    <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
      <div className="flex items-center gap-2">
        <MapPin className={`h-3.5 w-3.5 ${isActive ? 'text-purple-400' : 'text-gray-500'}`} />
        <span className={`text-xs ${isActive ? 'text-white' : 'text-gray-500'}`}>
          {zoneName.replace(/_/g, ' ')}
        </span>
        <Badge className="bg-gray-700 text-gray-400 text-[8px]">
          {pointCount} pts
        </Badge>
      </div>
      <Switch
        checked={isActive}
        onCheckedChange={onToggle}
        className="scale-75"
      />
    </div>
  );
});

/**
 * Panneau principal d'administration du module urbain
 */
const UrbanModuleAdminPanel = memo(function UrbanModuleAdminPanel({
  onConfigChange,
  currentStats,
  qaReport
}) {
  // État de la configuration
  const [config, setConfig] = useState({
    enabled: true,
    bufferDistance: URBAN_CONFIG.BUFFER_DISTANCE_M,
    searchRadius: URBAN_CONFIG.RELOCATION_SEARCH_RADIUS_M,
    minDistance: URBAN_CONFIG.MIN_DISTANCE_FROM_URBAN_M,
    candidatePoints: URBAN_CONFIG.CANDIDATE_POINTS_COUNT,
    enableQA: true,
    debugMode: URBAN_CONFIG.DEBUG
  });
  
  // État des sections expansées
  const [expandedSections, setExpandedSections] = useState({
    parameters: true,
    qa: true,
    zones: false,
    stats: true
  });
  
  // État des zones actives
  const [activeZones, setActiveZones] = useState(
    Object.keys(URBAIN_FULL).reduce((acc, zone) => ({ ...acc, [zone]: true }), {})
  );
  
  // Gestion de l'expansion des sections
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);
  
  // Mise à jour d'un paramètre
  const updateConfig = useCallback((key, value) => {
    setConfig(prev => {
      const newConfig = { ...prev, [key]: value };
      onConfigChange?.(newConfig);
      return newConfig;
    });
  }, [onConfigChange]);
  
  // Toggle d'une zone urbaine
  const toggleZone = useCallback((zoneName) => {
    setActiveZones(prev => ({
      ...prev,
      [zoneName]: !prev[zoneName]
    }));
  }, []);
  
  // Export du rapport QA
  const exportQAReport = useCallback(() => {
    if (!qaReport) {
      toast.error('Aucun rapport QA disponible');
      return;
    }
    
    const reportJson = JSON.stringify(qaReport, null, 2);
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bionic_qa_urban_report_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Rapport QA exporté');
  }, [qaReport]);
  
  // Réinitialisation des paramètres
  const resetConfig = useCallback(() => {
    setConfig({
      enabled: true,
      bufferDistance: 2000,
      searchRadius: 5000,
      minDistance: 2000,
      candidatePoints: 36,
      enableQA: true,
      debugMode: false
    });
    toast.info('Paramètres réinitialisés');
  }, []);
  
  // Compteurs
  const activeZoneCount = Object.values(activeZones).filter(Boolean).length;
  const totalZoneCount = Object.keys(URBAIN_FULL).length;
  const stats = currentStats || {};
  
  return (
    <Card className="bg-gray-900/80 border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Building2 className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                Module Urbain BIONIC™
                <Badge className="bg-purple-500/30 text-purple-300 text-[10px]">v7</Badge>
              </CardTitle>
              <p className="text-xs text-gray-400">
                Exclusion et relocalisation intelligente
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
              config.enabled 
                ? 'bg-green-900/30 border border-green-500/30' 
                : 'bg-red-900/30 border border-red-500/30'
            }`}>
              <Zap className={`h-4 w-4 ${config.enabled ? 'text-green-400' : 'text-red-400'}`} />
              <span className={`text-sm font-medium ${config.enabled ? 'text-green-400' : 'text-red-400'}`}>
                {config.enabled ? 'ACTIF' : 'INACTIF'}
              </span>
              <Switch
                checked={config.enabled}
                onCheckedChange={(v) => updateConfig('enabled', v)}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Section Paramètres */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div 
            className="flex items-center justify-between p-3 bg-gray-800/50 cursor-pointer hover:bg-gray-800/70"
            onClick={() => toggleSection('parameters')}
          >
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#f5a623]" />
              <span className="text-sm font-medium text-white">Paramètres de Relocalisation</span>
            </div>
            {expandedSections.parameters ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
          
          {expandedSections.parameters && (
            <div className="p-4 space-y-4 bg-gray-800/30">
              <ParameterSlider
                label="Buffer urbain"
                value={config.bufferDistance}
                min={500}
                max={5000}
                step={100}
                unit="m"
                description="Distance de sécurité autour des zones urbaines. Les zones dans ce buffer seront relocalisées."
                onChange={(v) => updateConfig('bufferDistance', v)}
                disabled={!config.enabled}
              />
              
              <ParameterSlider
                label="Rayon de recherche"
                value={config.searchRadius}
                min={1000}
                max={10000}
                step={500}
                unit="m"
                description="Rayon maximal pour trouver une position de relocalisation avec le meilleur score."
                onChange={(v) => updateConfig('searchRadius', v)}
                disabled={!config.enabled}
              />
              
              <ParameterSlider
                label="Distance minimale"
                value={config.minDistance}
                min={500}
                max={5000}
                step={100}
                unit="m"
                description="Distance minimale de l'urbain après relocalisation. Garantit une marge de sécurité."
                onChange={(v) => updateConfig('minDistance', v)}
                disabled={!config.enabled}
              />
              
              <ParameterSlider
                label="Points candidats"
                value={config.candidatePoints}
                min={8}
                max={72}
                step={4}
                unit=""
                description="Nombre de directions à évaluer pour la relocalisation. Plus = plus précis mais plus lent."
                onChange={(v) => updateConfig('candidatePoints', v)}
                disabled={!config.enabled}
              />
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.enableQA}
                      onCheckedChange={(v) => updateConfig('enableQA', v)}
                      disabled={!config.enabled}
                      className="scale-75"
                    />
                    <span className="text-xs text-gray-300">Contrôle QA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.debugMode}
                      onCheckedChange={(v) => updateConfig('debugMode', v)}
                      disabled={!config.enabled}
                      className="scale-75"
                    />
                    <span className="text-xs text-gray-300">Mode debug</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetConfig}
                  className="text-xs border-gray-600"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Section Rapport QA */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div 
            className="flex items-center justify-between p-3 bg-gray-800/50 cursor-pointer hover:bg-gray-800/70"
            onClick={() => toggleSection('qa')}
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-white">Rapport QA Urbain</span>
              {qaReport && (
                <Badge className={`text-[9px] ${
                  qaReport.allPassed 
                    ? 'bg-green-500/30 text-green-300' 
                    : 'bg-orange-500/30 text-orange-300'
                }`}>
                  {qaReport.allPassed ? 'PASS' : `${qaReport.failedCount} FAIL`}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {qaReport && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); exportQAReport(); }}
                  className="h-7 px-2 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              )}
              {expandedSections.qa ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
          
          {expandedSections.qa && (
            <div className="p-4 bg-gray-800/30">
              {qaReport ? (
                <div className="space-y-3">
                  {/* Résumé QA */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-800/50 rounded p-2 text-center">
                      <div className="text-lg font-bold text-white">{qaReport.totalZones}</div>
                      <div className="text-[10px] text-gray-400">Zones analysées</div>
                    </div>
                    <div className="bg-green-900/30 rounded p-2 text-center">
                      <div className="text-lg font-bold text-green-400">{qaReport.passedCount}</div>
                      <div className="text-[10px] text-green-300">Validées</div>
                    </div>
                    <div className={`rounded p-2 text-center ${
                      qaReport.failedCount > 0 ? 'bg-red-900/30' : 'bg-gray-800/50'
                    }`}>
                      <div className={`text-lg font-bold ${
                        qaReport.failedCount > 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {qaReport.failedCount}
                      </div>
                      <div className={`text-[10px] ${
                        qaReport.failedCount > 0 ? 'text-red-300' : 'text-gray-400'
                      }`}>
                        Non conformes
                      </div>
                    </div>
                  </div>
                  
                  {/* Liste des contrôles */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    <div className="text-[10px] text-gray-500 uppercase mb-2">
                      Contrôles effectués
                    </div>
                    {qaReport.results?.slice(0, 10).map((result, idx) => (
                      <div key={idx} className="space-y-1">
                        {result.checks?.map((check, checkIdx) => (
                          <QACheckItem key={checkIdx} check={check} index={checkIdx} />
                        ))}
                      </div>
                    ))}
                  </div>
                  
                  {/* Timestamp */}
                  <div className="text-[9px] text-gray-500 text-right">
                    Rapport généré: {new Date(qaReport.timestamp).toLocaleString('fr-CA')}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Shield className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Aucun rapport QA disponible</p>
                  <p className="text-xs text-gray-500">Les rapports sont générés lors du filtrage des zones</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Section Statistiques */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div 
            className="flex items-center justify-between p-3 bg-gray-800/50 cursor-pointer hover:bg-gray-800/70"
            onClick={() => toggleSection('stats')}
          >
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Statistiques de Relocalisation</span>
            </div>
            {expandedSections.stats ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
          
          {expandedSections.stats && (
            <div className="p-4 bg-gray-800/30">
              {stats.total > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 rounded p-3">
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                    <div className="text-xs text-gray-400">Zones analysées</div>
                  </div>
                  <div className="bg-purple-900/30 rounded p-3">
                    <div className="text-2xl font-bold text-purple-400">{stats.fromUrban || 0}</div>
                    <div className="text-xs text-purple-300">Relocalisées (urbain)</div>
                  </div>
                  <div className="bg-cyan-900/30 rounded p-3">
                    <div className="text-2xl font-bold text-cyan-400">{stats.fromWater || 0}</div>
                    <div className="text-xs text-cyan-300">Relocalisées (eau)</div>
                  </div>
                  <div className="bg-green-900/30 rounded p-3">
                    <div className="text-2xl font-bold text-green-400">{stats.unchanged || stats.kept || 0}</div>
                    <div className="text-xs text-green-300">Conformes</div>
                  </div>
                  <div className={`rounded p-3 ${
                    stats.excluded > 0 ? 'bg-red-900/30' : 'bg-gray-800/50'
                  }`}>
                    <div className={`text-2xl font-bold ${
                      stats.excluded > 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {stats.excluded || 0}
                    </div>
                    <div className={`text-xs ${
                      stats.excluded > 0 ? 'text-red-300' : 'text-gray-400'
                    }`}>
                      Exclues
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded p-3">
                    <div className="text-2xl font-bold text-white">{stats.kept || 0}</div>
                    <div className="text-xs text-gray-400">Total conservées</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Map className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Aucune statistique disponible</p>
                  <p className="text-xs text-gray-500">Activez des waypoints pour générer des zones</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Section Zones Urbaines */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div 
            className="flex items-center justify-between p-3 bg-gray-800/50 cursor-pointer hover:bg-gray-800/70"
            onClick={() => toggleSection('zones')}
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Zones Urbaines</span>
              <Badge className="bg-purple-500/30 text-purple-300 text-[9px]">
                {activeZoneCount}/{totalZoneCount}
              </Badge>
            </div>
            {expandedSections.zones ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
          
          {expandedSections.zones && (
            <div className="p-4 bg-gray-800/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">
                  {activeZoneCount} zones actives sur {totalZoneCount}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveZones(
                      Object.keys(URBAIN_FULL).reduce((acc, z) => ({ ...acc, [z]: true }), {})
                    )}
                    className="h-6 px-2 text-[10px]"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Tout activer
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveZones(
                      Object.keys(URBAIN_FULL).reduce((acc, z) => ({ ...acc, [z]: false }), {})
                    )}
                    className="h-6 px-2 text-[10px]"
                  >
                    <EyeOff className="h-3 w-3 mr-1" />
                    Tout désactiver
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {Object.entries(URBAIN_FULL).map(([zoneName, polygon]) => (
                  <UrbanZoneItem
                    key={zoneName}
                    zoneName={zoneName}
                    polygon={polygon}
                    isActive={activeZones[zoneName]}
                    onToggle={() => toggleZone(zoneName)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer avec infos */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
          <div className="text-[10px] text-gray-500">
            Ruleset: BIONIC_URBAN_MODULE v7
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-cyan-900/50 text-cyan-400 text-[8px]">WATER_5M</Badge>
            <Badge className="bg-purple-900/50 text-purple-400 text-[8px]">URBAN_{config.bufferDistance}M</Badge>
            {config.enableQA && (
              <Badge className="bg-green-900/50 text-green-400 text-[8px]">QA_CHECK</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

UrbanModuleAdminPanel.displayName = 'UrbanModuleAdminPanel';

export default UrbanModuleAdminPanel;
