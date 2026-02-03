/**
 * ForestStandLegend.jsx
 * 
 * LÉGENDE CARTOGRAPHIQUE PEUPLEMENTS FORESTIERS
 * Utilise la palette MFFP complète
 * 
 * Affiche les types de couvert, essences, hauteurs, densités et stades
 * de manière hiérarchique et intuitive.
 */

import React, { memo, useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, TreePine, Trees, Leaf, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  FOREST_LEGEND_SIMPLIFIED,
  FOREST_STAND_REFERENCE 
} from '@/config/ForestStandReferenceTable';
import { 
  COVER_TYPE_BASE,
  CONIFER_SPECIES,
  DECIDUOUS_SPECIES,
  MIXED_SPECIES,
  HEIGHT_CLASSES,
  DENSITY_CLASSES,
  DEVELOPMENT_STAGES,
  getStandStyle
} from '@/config/ForestStandPalette';

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL - Légende Forestière
// ═══════════════════════════════════════════════════════════════

const ForestStandLegend = memo(({ 
  collapsed = false, 
  onToggleCollapse,
  showDetails = false,
  minDensity = 'D', // A, B, C, D - filtre minimum
  position = 'bottomRight' // ou 'sidebar'
}) => {
  const [expandedSection, setExpandedSection] = useState('types');
  const [hoveredStand, setHoveredStand] = useState(null);

  // Styles de position
  const positionStyles = {
    bottomRight: 'absolute bottom-4 right-4 z-[1000]',
    bottomLeft: 'absolute bottom-4 left-4 z-[1000]',
    sidebar: 'relative'
  };

  // Section dépliable
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div 
      className={`${positionStyles[position]} bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl overflow-hidden`}
      style={{ maxWidth: position === 'sidebar' ? '100%' : '280px' }}
    >
      {/* En-tête */}
      <div 
        className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-900 cursor-pointer border-b border-gray-700"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2">
          <TreePine className="h-4 w-4 text-green-500" />
          <span className="text-xs font-bold text-white uppercase tracking-wide">
            Peuplements Forestiers
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/20 text-green-400 text-[9px]">MFFP</Badge>
          {collapsed ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="max-h-[400px] overflow-y-auto">
          {/* Section: Types de couvert */}
          <SectionHeader 
            title="Type de couvert" 
            subtitle="Couleur principale"
            expanded={expandedSection === 'types'}
            onClick={() => toggleSection('types')}
          />
          {expandedSection === 'types' && (
            <div className="px-3 py-2 space-y-1.5 bg-gray-800/30">
              {FOREST_LEGEND_SIMPLIFIED.types.map(type => (
                <div 
                  key={type.id}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-700/50 transition-colors"
                >
                  <div 
                    className="w-5 h-5 rounded shadow-inner border border-gray-600"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="text-lg">{type.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white">{type.name}</div>
                    <div className="text-[9px] text-gray-400">{type.description}</div>
                  </div>
                  <Badge className="bg-gray-700 text-gray-300 text-[8px]">{type.id}</Badge>
                </div>
              ))}
            </div>
          )}

          {/* Section: Essences principales */}
          <SectionHeader 
            title="Essences dominantes" 
            subtitle="Variation de teinte"
            expanded={expandedSection === 'species'}
            onClick={() => toggleSection('species')}
          />
          {expandedSection === 'species' && (
            <div className="px-3 py-2 bg-gray-800/30">
              {/* Conifères */}
              <div className="text-[9px] text-green-400 uppercase mb-1 font-semibold">Conifères</div>
              <div className="grid grid-cols-2 gap-1 mb-2">
                {FOREST_LEGEND_SIMPLIFIED.conifers.map(sp => (
                  <SpeciesItem key={sp.code} species={sp} />
                ))}
              </div>
              
              {/* Feuillus */}
              <div className="text-[9px] text-amber-400 uppercase mb-1 font-semibold">Feuillus</div>
              <div className="grid grid-cols-2 gap-1 mb-2">
                {FOREST_LEGEND_SIMPLIFIED.deciduous.map(sp => (
                  <SpeciesItem key={sp.code} species={sp} />
                ))}
              </div>
              
              {/* Mixtes */}
              <div className="text-[9px] text-lime-400 uppercase mb-1 font-semibold">Mixtes</div>
              <div className="grid grid-cols-2 gap-1">
                {FOREST_LEGEND_SIMPLIFIED.mixed.map(sp => (
                  <SpeciesItem key={sp.code} species={sp} />
                ))}
              </div>
            </div>
          )}

          {/* Section: Hauteur */}
          <SectionHeader 
            title="Classe de hauteur" 
            subtitle="Luminosité (clair→foncé)"
            expanded={expandedSection === 'height'}
            onClick={() => toggleSection('height')}
          />
          {expandedSection === 'height' && (
            <div className="px-3 py-2 bg-gray-800/30">
              <div className="space-y-1">
                {FOREST_LEGEND_SIMPLIFIED.heights.map((h, idx) => (
                  <HeightClassItem 
                    key={h.class} 
                    height={h} 
                    index={idx}
                    total={FOREST_LEGEND_SIMPLIFIED.heights.length}
                  />
                ))}
              </div>
              <div className="mt-2 text-[9px] text-gray-500 text-center italic">
                Plus clair = plus bas • Plus foncé = plus haut
              </div>
            </div>
          )}

          {/* Section: Densité */}
          <SectionHeader 
            title="Densité du couvert" 
            subtitle="Saturation"
            expanded={expandedSection === 'density'}
            onClick={() => toggleSection('density')}
          />
          {expandedSection === 'density' && (
            <div className="px-3 py-2 bg-gray-800/30">
              <div className="space-y-1">
                {FOREST_LEGEND_SIMPLIFIED.densities.map((d, idx) => (
                  <DensityClassItem 
                    key={d.class} 
                    density={d} 
                    index={idx}
                    total={FOREST_LEGEND_SIMPLIFIED.densities.length}
                  />
                ))}
              </div>
              <div className="mt-2 text-[9px] text-gray-500 text-center italic">
                Saturé = dense • Désaturé = ouvert
              </div>
            </div>
          )}

          {/* Section: Stade de développement */}
          <SectionHeader 
            title="Stade de développement" 
            subtitle="Texture/contour"
            expanded={expandedSection === 'stage'}
            onClick={() => toggleSection('stage')}
          />
          {expandedSection === 'stage' && (
            <div className="px-3 py-2 bg-gray-800/30">
              <div className="space-y-1">
                {FOREST_LEGEND_SIMPLIFIED.stages.map(s => (
                  <StageItem key={s.code} stage={s} />
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-3 py-2 bg-gray-800/50 border-t border-gray-700">
            <div className="flex items-center justify-between text-[9px] text-gray-500">
              <span>Source: MFFP Québec</span>
              <span>Zones ≥{minDensity === 'A' ? '80' : minDensity === 'B' ? '60' : minDensity === 'C' ? '40' : '25'}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════
// SOUS-COMPOSANTS
// ═══════════════════════════════════════════════════════════════

const SectionHeader = memo(({ title, subtitle, expanded, onClick }) => (
  <div 
    className="flex items-center justify-between px-3 py-1.5 bg-gray-800/50 cursor-pointer hover:bg-gray-700/50 transition-colors border-t border-gray-700/50"
    onClick={onClick}
  >
    <div>
      <div className="text-[10px] font-medium text-white">{title}</div>
      <div className="text-[8px] text-gray-500">{subtitle}</div>
    </div>
    {expanded ? (
      <ChevronUp className="h-3 w-3 text-gray-400" />
    ) : (
      <ChevronDown className="h-3 w-3 text-gray-400" />
    )}
  </div>
));

const SpeciesItem = memo(({ species }) => (
  <div className="flex items-center gap-1.5 p-1 rounded bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
    <div 
      className="w-3 h-3 rounded-sm shadow-inner"
      style={{ backgroundColor: species.color }}
    />
    <span className="text-[9px] text-gray-300 truncate flex-1">{species.name}</span>
    <span className="text-[8px] text-gray-500">{species.coverage}</span>
  </div>
));

const HeightClassItem = memo(({ height, index, total }) => {
  // Calculer la luminosité pour la démo visuelle
  const luminosity = 75 - (index * 10);
  const demoColor = `hsl(145, 65%, ${luminosity}%)`;
  
  return (
    <div className="flex items-center gap-2 p-1 rounded hover:bg-gray-700/30 transition-colors">
      <div 
        className="w-4 h-4 rounded shadow-inner border border-gray-600"
        style={{ backgroundColor: demoColor }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[9px] text-white">{height.range}</div>
        <div className="text-[8px] text-gray-500">{height.description}</div>
      </div>
      <Badge className="bg-gray-700 text-gray-400 text-[7px]">{height.class}</Badge>
    </div>
  );
});

const DensityClassItem = memo(({ density, index, total }) => {
  // Calculer la saturation pour la démo visuelle
  const saturation = 80 - (index * 20);
  const demoColor = `hsl(145, ${saturation}%, 40%)`;
  
  return (
    <div className="flex items-center gap-2 p-1 rounded hover:bg-gray-700/30 transition-colors">
      <div 
        className="w-4 h-4 rounded shadow-inner border border-gray-600"
        style={{ backgroundColor: demoColor }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[9px] text-white">{density.range}</div>
        <div className="text-[8px] text-gray-500">{density.description}</div>
      </div>
      <Badge className="bg-gray-700 text-gray-400 text-[7px]">{density.class}</Badge>
    </div>
  );
});

const StageItem = memo(({ stage }) => {
  // Pattern visuel selon le stade
  const getPatternStyle = () => {
    switch (stage.code) {
      case 'REG':
        return { background: 'radial-gradient(circle, #339957 1px, transparent 1px)', backgroundSize: '4px 4px' };
      case 'JEU':
        return { background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(51, 153, 87, 0.3) 2px, rgba(51, 153, 87, 0.3) 3px)' };
      case 'MAT':
        return { backgroundColor: '#339957' };
      case 'SUR':
        return { backgroundColor: '#339957', border: '2px solid #1a5c34' };
      case 'VIN':
        return { backgroundColor: '#267343', border: '3px double #0d3d20' };
      default:
        return { backgroundColor: '#339957' };
    }
  };
  
  return (
    <div className="flex items-center gap-2 p-1 rounded hover:bg-gray-700/30 transition-colors">
      <div 
        className="w-4 h-4 rounded shadow-inner"
        style={getPatternStyle()}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[9px] text-white">{stage.name}</div>
        <div className="text-[8px] text-gray-500">{stage.texture} • {stage.age}</div>
      </div>
      <Badge className="bg-gray-700 text-gray-400 text-[7px]">{stage.code}</Badge>
    </div>
  );
});

ForestStandLegend.displayName = 'ForestStandLegend';
SectionHeader.displayName = 'SectionHeader';
SpeciesItem.displayName = 'SpeciesItem';
HeightClassItem.displayName = 'HeightClassItem';
DensityClassItem.displayName = 'DensityClassItem';
StageItem.displayName = 'StageItem';

export default ForestStandLegend;
export { ForestStandLegend };
