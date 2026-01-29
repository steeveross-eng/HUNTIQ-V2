/**
 * BionicGeneratorPanel.jsx
 * 
 * Panneau d'affichage des résultats du GENERATEUR_CARTE_BIONIC v3.1
 * Affiche: Modules, Météo, Habitat, Approche, Simulation, Hotspots, Recommandations
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronDown, ChevronUp, Target, Thermometer, Wind, 
  Navigation, Brain, MapPin, ShoppingBag, AlertCircle,
  Clock, TrendingUp, Crosshair, Leaf, Sun, Moon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import genererCarteBIONIC, {
  MODULES_THEMATIQUES,
  CATALOGUE_PRODUITS_BIONIC
} from '@/services/BionicMapGenerator';

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════

const BionicGeneratorPanel = ({ 
  donnees = {},
  espece = 'orignal',
  meteo = null,
  onResultsGenerated = () => {},
  compact = false
}) => {
  const [resultats, setResultats] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sectionsOuvertes, setSectionsOuvertes] = useState({
    modules: true,
    meteo: false,
    habitat: true,
    approche: false,
    simulation: false,
    hotspots: true,
    recommandations: false,
    produits: false
  });

  // Générer la carte au montage ou changement d'espèce
  useEffect(() => {
    generer();
  }, [espece]);

  const generer = async () => {
    setIsGenerating(true);
    
    // Simuler un délai pour l'UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const donneesEntree = {
      ...donnees,
      meteo: meteo || {
        temperature: 12,
        vent_direction: 'NO',
        vent_force: 15,
        pression: 1018,
        precipitations: 0
      }
    };
    
    const results = genererCarteBIONIC(donneesEntree, espece);
    setResultats(results);
    onResultsGenerated(results);
    setIsGenerating(false);
  };

  const toggleSection = (section) => {
    setSectionsOuvertes(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!resultats && !isGenerating) {
    return (
      <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        <Button 
          onClick={generer}
          className="w-full bg-[#f5a623] hover:bg-[#e09612] text-black"
        >
          <Target className="h-4 w-4 mr-2" />
          Générer Carte BIONIC™
        </Button>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="p-4 bg-gray-900/50 rounded-lg border border-[#f5a623]/30">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-[#f5a623] border-t-transparent rounded-full" />
          <span className="text-[#f5a623] text-sm">Génération en cours...</span>
        </div>
        <Progress value={66} className="mt-3 h-1" />
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-[#f5a623]/10 rounded border border-[#f5a623]/30">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-[#f5a623]" />
          <span className="text-[#f5a623] font-medium text-[10px] uppercase">
            BIONIC Intelligence v3.1
          </span>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={generer}
          className="h-6 px-2 text-[10px] text-gray-400 hover:text-[#f5a623]"
        >
          Régénérer
        </Button>
      </div>

      {/* Score Global */}
      <ScoreGlobal 
        habitat={resultats.habitat_optimal}
        simulation={resultats.simulation_ia}
        compact={compact}
      />

      {/* Section Modules Thématiques */}
      <SectionCollapsible
        titre="Modules Thématiques"
        icon={<Leaf className="h-3 w-3" />}
        isOpen={sectionsOuvertes.modules}
        onToggle={() => toggleSection('modules')}
        badge={Object.keys(resultats.modules_thematiques).length}
      >
        <ModulesThematiques 
          modules={resultats.modules_thematiques} 
          compact={compact}
        />
      </SectionCollapsible>

      {/* Section Météo/Saison */}
      <SectionCollapsible
        titre="Analyse Météo"
        icon={<Thermometer className="h-3 w-3" />}
        isOpen={sectionsOuvertes.meteo}
        onToggle={() => toggleSection('meteo')}
        badge={resultats.analyse_meteo.score_meteo}
        badgeColor={resultats.analyse_meteo.conditions_globales === 'favorables' ? 'green' : 'orange'}
      >
        <AnalyseMeteo 
          analyse={resultats.analyse_meteo}
          compact={compact}
        />
      </SectionCollapsible>

      {/* Section Habitat Optimal */}
      <SectionCollapsible
        titre="Habitat Optimal"
        icon={<MapPin className="h-3 w-3" />}
        isOpen={sectionsOuvertes.habitat}
        onToggle={() => toggleSection('habitat')}
        badge={resultats.habitat_optimal.score_final}
        badgeColor={resultats.habitat_optimal.niveau.color}
      >
        <HabitatOptimal 
          habitat={resultats.habitat_optimal}
          compact={compact}
        />
      </SectionCollapsible>

      {/* Section Approche Optimale */}
      <SectionCollapsible
        titre="Approche Optimale"
        icon={<Navigation className="h-3 w-3" />}
        isOpen={sectionsOuvertes.approche}
        onToggle={() => toggleSection('approche')}
      >
        <ApprocheOptimale 
          approche={resultats.approche_optimale}
          compact={compact}
        />
      </SectionCollapsible>

      {/* Section Simulation IA */}
      <SectionCollapsible
        titre="Simulation IA"
        icon={<Brain className="h-3 w-3" />}
        isOpen={sectionsOuvertes.simulation}
        onToggle={() => toggleSection('simulation')}
        badge={`${resultats.simulation_ia.probabilite_presence}%`}
      >
        <SimulationIA 
          simulation={resultats.simulation_ia}
          compact={compact}
        />
      </SectionCollapsible>

      {/* Section Hotspots */}
      <SectionCollapsible
        titre="Hotspots & Points de Chasse"
        icon={<Crosshair className="h-3 w-3" />}
        isOpen={sectionsOuvertes.hotspots}
        onToggle={() => toggleSection('hotspots')}
        badge={resultats.hotspots.nombre_hotspots}
        badgeColor="#f5a623"
      >
        <Hotspots 
          hotspots={resultats.hotspots}
          compact={compact}
        />
      </SectionCollapsible>

      {/* Section Recommandations IA */}
      <SectionCollapsible
        titre="Recommandations IA"
        icon={<AlertCircle className="h-3 w-3" />}
        isOpen={sectionsOuvertes.recommandations}
        onToggle={() => toggleSection('recommandations')}
      >
        <RecommandationsIA 
          recommandations={resultats.recommandations_ia}
          compact={compact}
        />
      </SectionCollapsible>

      {/* Section Produits */}
      <SectionCollapsible
        titre="Produits Recommandés"
        icon={<ShoppingBag className="h-3 w-3" />}
        isOpen={sectionsOuvertes.produits}
        onToggle={() => toggleSection('produits')}
        highlight
      >
        <ProduitsBIONIC 
          produits={resultats.recommandations_produits}
          compact={compact}
        />
      </SectionCollapsible>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SOUS-COMPOSANTS
// ═══════════════════════════════════════════════════════════════

const SectionCollapsible = ({ 
  titre, 
  icon, 
  isOpen, 
  onToggle, 
  children, 
  badge,
  badgeColor,
  highlight 
}) => (
  <Collapsible open={isOpen} onOpenChange={onToggle}>
    <CollapsibleTrigger className={`w-full flex items-center justify-between p-2 rounded transition-all ${
      highlight ? 'bg-[#f5a623]/20 border border-[#f5a623]/40' : 'bg-gray-800/50 hover:bg-gray-700/50'
    }`}>
      <div className="flex items-center gap-2">
        <span className={highlight ? 'text-[#f5a623]' : 'text-gray-400'}>{icon}</span>
        <span className={`text-[10px] uppercase tracking-wider ${highlight ? 'text-[#f5a623]' : 'text-gray-300'}`}>
          {titre}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <Badge 
            className="text-[8px] px-1.5"
            style={{ 
              backgroundColor: badgeColor ? `${badgeColor}30` : '#4b556330',
              color: badgeColor || '#9ca3af'
            }}
          >
            {badge}
          </Badge>
        )}
        {isOpen ? <ChevronUp className="h-3 w-3 text-gray-500" /> : <ChevronDown className="h-3 w-3 text-gray-500" />}
      </div>
    </CollapsibleTrigger>
    <CollapsibleContent className="pt-2">
      {children}
    </CollapsibleContent>
  </Collapsible>
);

const ScoreGlobal = ({ habitat, simulation, compact }) => (
  <div className="p-3 bg-gradient-to-r from-[#f5a623]/20 to-transparent rounded-lg border border-[#f5a623]/30">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[9px] text-gray-400 uppercase">Habitat Optimal</div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">{habitat.score_final}</span>
          <span className="text-gray-500">/100</span>
          <span className="text-lg">{habitat.niveau.emoji}</span>
        </div>
        <Badge 
          className="text-[8px] mt-1"
          style={{ backgroundColor: `${habitat.niveau.color}30`, color: habitat.niveau.color }}
        >
          {habitat.niveau.label}
        </Badge>
      </div>
      <div className="text-right">
        <div className="text-[9px] text-gray-400 uppercase">Probabilité Présence</div>
        <div className="text-xl font-bold text-[#f5a623]">{simulation.probabilite_presence}%</div>
        <div className="text-[9px] text-gray-500">{simulation.periode_journee}</div>
      </div>
    </div>
  </div>
);

const ModulesThematiques = ({ modules, compact }) => (
  <div className="space-y-1">
    {Object.entries(modules).slice(0, compact ? 5 : 11).map(([key, module]) => (
      <div 
        key={key}
        className="flex items-center justify-between p-1.5 rounded bg-gray-800/30"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{module.icon}</span>
          <span className="text-[10px] text-gray-300">{module.nom}</span>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={module.score_brut} className="w-16 h-1" />
          <span className="text-[9px] text-gray-400 w-8 text-right">{Math.round(module.score_brut)}</span>
        </div>
      </div>
    ))}
  </div>
);

const AnalyseMeteo = ({ analyse, compact }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
      <span className="text-[10px] text-gray-400">Conditions globales</span>
      <Badge className={`text-[8px] ${
        analyse.conditions_globales === 'favorables' 
          ? 'bg-green-500/20 text-green-400' 
          : 'bg-orange-500/20 text-orange-400'
      }`}>
        {analyse.conditions_globales.toUpperCase()}
      </Badge>
    </div>
    <div className="grid grid-cols-2 gap-1">
      <div className="p-2 bg-gray-800/30 rounded">
        <div className="text-[9px] text-gray-500">Facteur Habitat</div>
        <div className="text-sm font-medium text-white">×{analyse.facteur_habitat.toFixed(2)}</div>
      </div>
      <div className="p-2 bg-gray-800/30 rounded">
        <div className="text-[9px] text-gray-500">Facteur Mouvement</div>
        <div className="text-sm font-medium text-white">×{analyse.facteur_mouvement.toFixed(2)}</div>
      </div>
    </div>
    {analyse.recommandations.slice(0, compact ? 2 : 5).map((rec, idx) => (
      <div key={idx} className={`p-2 rounded text-[10px] ${
        rec.important ? 'bg-red-500/20 border border-red-500/30 text-red-300' : 'bg-gray-800/30 text-gray-400'
      }`}>
        {rec.message}
      </div>
    ))}
  </div>
);

const HabitatOptimal = ({ habitat, compact }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 gap-1">
      <div className="p-2 bg-gray-800/30 rounded">
        <div className="text-[9px] text-gray-500">Score Base</div>
        <div className="text-sm font-medium text-white">{habitat.score_base}</div>
      </div>
      <div className="p-2 bg-gray-800/30 rounded">
        <div className="text-[9px] text-gray-500">Convergence</div>
        <div className="text-sm font-medium text-white">{habitat.convergence}</div>
      </div>
      <div className="p-2 bg-gray-800/30 rounded">
        <div className="text-[9px] text-gray-500">Rareté</div>
        <div className="text-sm font-medium text-white">{habitat.rarete}</div>
      </div>
      <div className="p-2 bg-gray-800/30 rounded">
        <div className="text-[9px] text-gray-500">Cohérence</div>
        <div className="text-sm font-medium text-white">{habitat.coherence}</div>
      </div>
    </div>
    
    {/* Analyse Alimentaire 200% */}
    <div className="p-2 bg-green-900/20 rounded border border-green-700/30">
      <div className="text-[9px] text-green-400 uppercase mb-1">Analyse Alimentaire 200%</div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-400">Qualité</span>
        <span className="text-[10px] text-white">{habitat.analyse_alimentaire.qualite_alimentaire}/100</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-400">Niveau</span>
        <Badge className="text-[8px] bg-green-500/20 text-green-400">
          {habitat.analyse_alimentaire.niveau.toUpperCase()}
        </Badge>
      </div>
      {habitat.analyse_alimentaire.carences.length > 0 && (
        <div className="mt-1 pt-1 border-t border-green-700/30">
          <div className="text-[8px] text-orange-400">Carences détectées:</div>
          {habitat.analyse_alimentaire.carences.map((c, idx) => (
            <div key={idx} className="text-[9px] text-gray-400">
              • {c.type} ({c.niveau})
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const ApprocheOptimale = ({ approche, compact }) => (
  <div className="space-y-2">
    <div className="p-2 bg-blue-900/20 rounded border border-blue-700/30">
      <div className="flex items-center gap-2 mb-2">
        <Navigation className="h-4 w-4 text-blue-400" />
        <span className="text-[10px] text-blue-400 uppercase">Direction d&apos;approche</span>
      </div>
      <div className="text-lg font-bold text-white">{approche.direction_approche}</div>
      <div className="text-[9px] text-gray-400">
        Vent: {approche.vent.direction} à {approche.vent.force} km/h
      </div>
    </div>
    
    <div className="p-2 bg-gray-800/30 rounded">
      <div className="text-[9px] text-gray-500 uppercase mb-1">Position Affût</div>
      <div className="text-[10px] text-white">{approche.position_affut_optimale.description}</div>
      <div className="text-[9px] text-gray-400">Hauteur: {approche.position_affut_optimale.hauteur_m}m</div>
    </div>
    
    <div className="text-[9px] text-[#f5a623]">
      🕐 Heure optimale: {approche.heure_optimale}
    </div>
    
    {approche.conseils.slice(0, compact ? 3 : 5).map((conseil, idx) => (
      <div key={idx} className="flex items-start gap-2 p-1.5 bg-gray-800/30 rounded">
        <span>{conseil.icon}</span>
        <span className="text-[10px] text-gray-300">{conseil.conseil}</span>
      </div>
    ))}
  </div>
);

const SimulationIA = ({ simulation, compact }) => (
  <div className="space-y-2">
    <div className="p-3 bg-purple-900/20 rounded border border-purple-700/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-400" />
          <span className="text-[10px] text-purple-400 uppercase">Moteur IA</span>
        </div>
        <Badge className="bg-purple-500/20 text-purple-400 text-[8px]">ACTIF</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-[9px] text-gray-500">Période</div>
          <div className="text-sm font-medium text-white capitalize">{simulation.periode_journee}</div>
        </div>
        <div>
          <div className="text-[9px] text-gray-500">Prob. Présence</div>
          <div className="text-sm font-medium text-[#f5a623]">{simulation.probabilite_presence}%</div>
        </div>
      </div>
    </div>
    
    {simulation.fenetres_tir.length > 0 && (
      <div className="p-2 bg-red-900/20 rounded border border-red-700/30">
        <div className="text-[9px] text-red-400 uppercase mb-1">🎯 Fenêtres de Tir</div>
        {simulation.fenetres_tir.map((f, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="text-[10px] text-white">{f.debut} - {f.fin}</span>
            <Badge className={`text-[8px] ${
              f.qualite === 'excellente' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {f.probabilite}%
            </Badge>
          </div>
        ))}
      </div>
    )}
    
    {simulation.commentaires.map((c, idx) => (
      <div key={idx} className="text-[10px] text-gray-400 p-1.5 bg-gray-800/30 rounded">
        {c}
      </div>
    ))}
  </div>
);

const Hotspots = ({ hotspots, compact }) => (
  <div className="space-y-2">
    <div className="text-[9px] text-gray-500">
      {hotspots.nombre_hotspots} hotspots détectés (seuil: {hotspots.seuil_utilise})
    </div>
    
    {hotspots.meilleurs_points_chasse.slice(0, compact ? 3 : 5).map((point, idx) => (
      <div 
        key={idx}
        className={`p-2 rounded border ${
          idx === 0 
            ? 'bg-[#f5a623]/20 border-[#f5a623]/40' 
            : 'bg-gray-800/30 border-gray-700/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{point.icon}</span>
            <div>
              <div className={`text-[10px] font-medium ${idx === 0 ? 'text-[#f5a623]' : 'text-white'}`}>
                {point.recommandation}
              </div>
              <div className="text-[9px] text-gray-400">{point.nom}</div>
            </div>
          </div>
          <Badge className={`text-[8px] ${
            point.priorite === 'haute' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
          }`}>
            {point.score}
          </Badge>
        </div>
      </div>
    ))}
  </div>
);

const RecommandationsIA = ({ recommandations, compact }) => {
  const categories = [
    { key: 'fenetres_tir', label: 'Fenêtres de Tir', icon: '🎯' },
    { key: 'approche', label: 'Approche', icon: '🧭' },
    { key: 'affut', label: 'Affût', icon: '🏠' },
    { key: 'nutritionnelles', label: 'Nutrition', icon: '🌿' },
    { key: 'saison', label: 'Saison', icon: '🍂' }
  ];
  
  return (
    <div className="space-y-2">
      {categories.map(cat => {
        const recs = recommandations[cat.key] || [];
        if (recs.length === 0) return null;
        
        return (
          <div key={cat.key} className="p-2 bg-gray-800/30 rounded">
            <div className="text-[9px] text-gray-500 uppercase mb-1">
              {cat.icon} {cat.label}
            </div>
            {recs.slice(0, compact ? 1 : 3).map((rec, idx) => (
              <div key={idx} className={`text-[10px] p-1 rounded mt-1 ${
                rec.priorite === 'haute' ? 'bg-red-500/10 text-red-300' : 'text-gray-400'
              }`}>
                {rec.message}
                {rec.details && <span className="text-gray-500"> ({rec.details})</span>}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

const ProduitsBIONIC = ({ produits, compact }) => (
  <div className="space-y-2">
    {produits.produits.slice(0, compact ? 2 : 4).map((produit, idx) => (
      <div 
        key={idx}
        className={`p-2 rounded border ${
          produit.highlight 
            ? 'bg-[#f5a623]/20 border-[#f5a623] shadow-lg shadow-[#f5a623]/20' 
            : 'bg-gray-800/30 border-gray-700/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-[10px] font-medium ${produit.highlight ? 'text-[#f5a623]' : 'text-white'}`}>
              {produit.nom}
            </div>
            <div className="text-[9px] text-gray-400">{produit.description}</div>
            <div className="text-[8px] text-gray-500 mt-1">{produit.raison}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-white">{produit.prix}$</div>
            {produit.highlight && (
              <Badge className="bg-[#f5a623] text-black text-[7px]">RECOMMANDÉ</Badge>
            )}
          </div>
        </div>
      </div>
    ))}
    
    <Button 
      className="w-full bg-[#f5a623] hover:bg-[#e09612] text-black text-[10px] h-8"
    >
      <ShoppingBag className="h-3 w-3 mr-1" />
      Voir tous les produits
    </Button>
  </div>
);

export default BionicGeneratorPanel;
