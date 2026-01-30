/**
 * ForestStandLegendMicro.jsx
 * 
 * MICRO-LÉGENDE PEUPLEMENTS FORESTIERS
 * Version compacte pour affichage sur carte
 */

import React, { memo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Données compactes
const MICRO_DATA = {
  types: [
    { id: 'C', name: 'Résineux', color: '#339957', icon: '🌲' },
    { id: 'M', name: 'Mixte', color: '#8a9840', icon: '🌲🌳' },
    { id: 'F', name: 'Feuillu', color: '#c48a28', icon: '🌳' }
  ],
  species: {
    C: [
      { code: 'EPN', name: 'Ép. noire', color: '#267343' },
      { code: 'SAB', name: 'Sapin', color: '#308d4e' },
      { code: 'PIB', name: 'Pin blanc', color: '#3d9658' },
      { code: 'THO', name: 'Cèdre', color: '#2a8f4d' }
    ],
    F: [
      { code: 'ERS', name: 'Érable sucre', color: '#a6751f' },
      { code: 'BOJ', name: 'Bouleau j.', color: '#9c7e30' },
      { code: 'PET', name: 'Peuplier', color: '#b5b855' }
    ],
    M: [
      { code: 'MIS', name: 'Mixte rés.', color: '#658838' },
      { code: 'MIF', name: 'Mixte feu.', color: '#7e7432' }
    ]
  }
};

const ForestStandLegendMicro = memo(({ 
  collapsed = false, 
  onToggleCollapse,
  position = 'bottomRight'
}) => {
  const [expanded, setExpanded] = useState(false);

  const positionStyles = {
    bottomRight: 'absolute bottom-4 right-4 z-[1000]',
    bottomLeft: 'absolute bottom-4 left-4 z-[1000]',
    topRight: 'absolute top-20 right-4 z-[1000]',
    sidebar: 'relative'
  };

  if (collapsed) {
    return (
      <div 
        className={`${positionStyles[position]} bg-gray-900/90 backdrop-blur-sm rounded px-2 py-1 border border-gray-700 cursor-pointer hover:bg-gray-800/90 transition-colors`}
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[9px]">🌲</span>
          <span className="text-[9px] text-gray-400">Peuplements</span>
          <ChevronDown className="h-3 w-3 text-gray-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${positionStyles[position]} bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden`}>
      {/* Header compact */}
      <div 
        className="flex items-center justify-between px-2 py-1.5 bg-gray-800/80 cursor-pointer border-b border-gray-700/50"
        onClick={onToggleCollapse}
      >
        <span className="text-[9px] font-semibold text-white uppercase tracking-wide">Peuplements</span>
        <ChevronUp className="h-3 w-3 text-gray-400" />
      </div>

      {/* Types principaux - toujours visibles */}
      <div className="px-2 py-1.5 space-y-0.5">
        {MICRO_DATA.types.map(type => (
          <div key={type.id} className="flex items-center gap-1.5">
            <div 
              className="w-3 h-3 rounded-sm border border-gray-600"
              style={{ backgroundColor: type.color }}
            />
            <span className="text-[9px] text-gray-300">{type.name}</span>
            <span className="text-[8px] text-gray-500 ml-auto">{type.id}</span>
          </div>
        ))}
      </div>

      {/* Toggle détails */}
      <div 
        className="px-2 py-1 bg-gray-800/50 cursor-pointer hover:bg-gray-700/50 transition-colors border-t border-gray-700/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <span className="text-[8px] text-gray-500">Essences</span>
          {expanded ? (
            <ChevronUp className="h-2.5 w-2.5 text-gray-500" />
          ) : (
            <ChevronDown className="h-2.5 w-2.5 text-gray-500" />
          )}
        </div>
      </div>

      {/* Essences détaillées */}
      {expanded && (
        <div className="px-2 py-1.5 space-y-1.5 max-h-32 overflow-y-auto">
          {/* Conifères */}
          <div>
            <div className="text-[7px] text-green-500 uppercase mb-0.5">Conifères</div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              {MICRO_DATA.species.C.map(sp => (
                <div key={sp.code} className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: sp.color }}
                  />
                  <span className="text-[8px] text-gray-400 truncate">{sp.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Feuillus */}
          <div>
            <div className="text-[7px] text-amber-500 uppercase mb-0.5">Feuillus</div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              {MICRO_DATA.species.F.map(sp => (
                <div key={sp.code} className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: sp.color }}
                  />
                  <span className="text-[8px] text-gray-400 truncate">{sp.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mixtes */}
          <div>
            <div className="text-[7px] text-lime-500 uppercase mb-0.5">Mixtes</div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              {MICRO_DATA.species.M.map(sp => (
                <div key={sp.code} className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: sp.color }}
                  />
                  <span className="text-[8px] text-gray-400 truncate">{sp.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer micro */}
      <div className="px-2 py-0.5 bg-gray-800/30 border-t border-gray-700/30">
        <div className="text-[7px] text-gray-600 text-center">80-100% • MFFP</div>
      </div>
    </div>
  );
});

ForestStandLegendMicro.displayName = 'ForestStandLegendMicro';

export default ForestStandLegendMicro;
export { ForestStandLegendMicro };
