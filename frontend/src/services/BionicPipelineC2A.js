/**
 * BIONIC_PIPELINE_TOTAL_C2A
 * Pipeline total BIONIC™ optimisé performance (C2-A)
 * 
 * Intègre:
 * - Hydrique + Urbain
 * - Relocalisation intelligente
 * - QA essentiels
 * - Autocorrection hydrique
 * - Output final unique: Z_AFFICHAGE_FINAL
 */

// ─────────────────────────────────────────────
// 1. INPUTS — Nomenclature stricte BIONIC™
// ─────────────────────────────────────────────
export const BIONIC_INPUTS = {
  layers: {
    Z_SOURCE: {
      id: 'Z',
      geometry_types: ['point', 'polygon'],
      attributes: ['score']
    },
    // Couches hydriques
    HYDRO_POLY_OFF: { id: 'H_POLY' },
    HYDRO_LINE_OFF: { id: 'H_LINE' },
    HYDRO_WETLANDS: { id: 'H_WET' },
    HYDRO_RASTER_MASK: { id: 'H_RASTER' },
    // Couches urbaines
    URBAIN_VILLES: { id: 'U_VILLES' },
    URBAIN_VILLAGES: { id: 'U_VILLAGES' },
    URBAIN_RESIDENTIEL: { id: 'U_RESIDENTIEL' },
    URBAIN_COMMERCIAL: { id: 'U_COMMERCIAL' },
    URBAIN_INDUSTRIEL: { id: 'U_INDUSTRIEL' },
    URBAIN_DENSE: { id: 'U_DENSE' },
    URBAIN_MUNICIPAL: { id: 'U_MUNICIPAL' }
  }
};

// ─────────────────────────────────────────────
// 2. PREPROCESS — Masques hydrique + urbain
// ─────────────────────────────────────────────
export const BIONIC_PREPROCESS = {
  hydric: [
    {
      id: 'H_LINE_BUFFER_3M',
      type: 'geometry_buffer',
      input_layer: 'H_LINE',
      distance_meters: 3,
      output_layer: 'H_LINE_BUF'
    },
    {
      id: 'WATER_VECTOR_UNION',
      type: 'geometry_union',
      input_layers: ['H_POLY', 'H_LINE_BUF', 'H_WET'],
      output_layer: 'WATER_VEC'
    },
    {
      id: 'WATER_FULL',
      type: 'geometry_union',
      input_layers: ['WATER_VEC', 'H_RASTER'],
      output_layer: 'WATER_FULL'
    },
    {
      id: 'WATER_BUF_5M',
      type: 'geometry_buffer',
      input_layer: 'WATER_FULL',
      distance_meters: 5,
      output_layer: 'WATER_BUF_5M'
    }
  ],
  urban: [
    {
      id: 'URBAIN_FULL',
      type: 'geometry_union',
      input_layers: [
        'U_VILLES', 'U_VILLAGES', 'U_RESIDENTIEL',
        'U_COMMERCIAL', 'U_INDUSTRIEL', 'U_DENSE', 'U_MUNICIPAL'
      ],
      output_layer: 'URBAIN_FULL'
    },
    {
      id: 'URBAIN_FULL_BUFFER_2000M',
      type: 'geometry_buffer',
      input_layer: 'URBAIN_FULL',
      distance_meters: 2000,
      output_layer: 'URBAIN_FULL_BUFFER_2000M'
    }
  ]
};

// ─────────────────────────────────────────────
// 3. LOGIC — Exclusions hydriques + urbaines (flags)
// ─────────────────────────────────────────────
export const BIONIC_EXCLUSION_FILTERS = {
  hydric: [
    {
      id: 'EXCL_INTERSECTS_WATER',
      target_layer: 'Z',
      condition: {
        type: 'spatial',
        operator: 'intersects',
        with_layer: 'WATER_FULL'
      },
      action: 'flag'
    },
    {
      id: 'EXCL_INTERSECTS_WATER_BUFFER',
      target_layer: 'Z',
      condition: {
        type: 'spatial',
        operator: 'intersects',
        with_layer: 'WATER_BUF_5M'
      },
      action: 'flag'
    },
    {
      id: 'EXCL_CENTROID_IN_WATER',
      target_layer: 'Z',
      condition: {
        type: 'spatial',
        operator: 'within',
        geometry_source: 'centroid',
        with_layer: 'WATER_FULL'
      },
      action: 'flag'
    },
    {
      id: 'EXCL_OVERLAP_WATER_GT_1_PERCENT',
      target_layer: 'Z',
      condition: {
        type: 'expression',
        expression: '( area(intersection($geometry, WATER_FULL)) / area($geometry) ) > 0.01'
      },
      action: 'flag'
    }
  ],
  urban: [
    {
      id: 'EXCL_INTERSECTS_URBAIN',
      target_layer: 'Z',
      condition: {
        type: 'spatial',
        operator: 'intersects',
        with_layer: 'URBAIN_FULL'
      },
      action: 'flag'
    },
    {
      id: 'EXCL_INTERSECTS_URBAIN_BUFFER',
      target_layer: 'Z',
      condition: {
        type: 'spatial',
        operator: 'intersects',
        with_layer: 'URBAIN_FULL_BUFFER_2000M'
      },
      action: 'flag'
    },
    {
      id: 'EXCL_CENTROID_IN_URBAIN',
      target_layer: 'Z',
      condition: {
        type: 'spatial',
        operator: 'within',
        geometry_source: 'centroid',
        with_layer: 'URBAIN_FULL'
      },
      action: 'flag'
    },
    {
      id: 'EXCL_CENTROID_IN_URBAIN_BUFFER',
      target_layer: 'Z',
      condition: {
        type: 'spatial',
        operator: 'within',
        geometry_source: 'centroid',
        with_layer: 'URBAIN_FULL_BUFFER_2000M'
      },
      action: 'flag'
    }
  ]
};

// ─────────────────────────────────────────────
// 4. POSTPROCESS HYDRIQUE — Ajustements simples
// ─────────────────────────────────────────────
export const BIONIC_HYDRIC_ADJUSTMENTS = [
  {
    id: 'ADJUST_SCORE_100_TO_WATER_EDGE',
    target_layer: 'Z',
    condition: {
      type: 'attribute',
      attribute: 'score',
      operator: 'equals',
      value: 100
    },
    operation: {
      type: 'geometry_snap_to_boundary',
      geometry_source: 'centroid',
      boundary_layer: 'WATER_FULL',
      max_distance_meters: 50,
      constraints: [
        { type: 'spatial', operator: 'disjoint', with_layer: 'WATER_FULL' },
        { type: 'spatial', operator: 'disjoint', with_layer: 'WATER_BUF_5M' }
      ]
    },
    output_layer: 'Z_HYDRO_ADJUSTED'
  }
];

// ─────────────────────────────────────────────
// 5. RELOCALISATION URBAINE — 2000 m vers score maximal
// ─────────────────────────────────────────────
export const BIONIC_URBAN_RELOCATION = {
  id: 'RELOCATE_FROM_URBAN_2000M',
  target_layer: 'Z_HYDRO_ADJUSTED',
  condition: {
    type: 'spatial',
    operator: 'intersects',
    with_layer: 'URBAIN_FULL_BUFFER_2000M'
  },
  operation: {
    type: 'relocate_by_score',
    search_radius_meters: 5000,
    avoid_layers: [
      'URBAIN_FULL',
      'URBAIN_FULL_BUFFER_2000M',
      'WATER_FULL',
      'WATER_BUF_5M'
    ],
    score_attribute: 'score',
    strategy: 'highest_score',
    constraints: [
      { type: 'spatial', operator: 'disjoint', with_layer: 'URBAIN_FULL' },
      { type: 'spatial', operator: 'disjoint', with_layer: 'URBAIN_FULL_BUFFER_2000M' },
      { type: 'distance', operator: 'greater_or_equal', value_meters: 2000 },
      { type: 'spatial', operator: 'disjoint', with_layer: 'WATER_FULL' },
      { type: 'spatial', operator: 'disjoint', with_layer: 'WATER_BUF_5M' }
    ]
  },
  output_layer: 'Z_URBAN_RELOCATED'
};

// ─────────────────────────────────────────────
// 6. QA ESSENTIEL — Hydrique + Urbain (version performance)
// ─────────────────────────────────────────────
export const BIONIC_QA_CONFIG = {
  hydric_validation: {
    id: 'QA_WATER_CORE',
    inputs: {
      target_layer: 'Z_URBAN_RELOCATED',
      water_layer: 'WATER_FULL',
      water_buffer_layer: 'WATER_BUF_5M'
    },
    checks: [
      {
        id: 'QA_WATER_INTERSECT',
        type: 'spatial',
        operator: 'intersects',
        with_layer: 'WATER_FULL',
        output_layer: 'QA_WATER_INTERSECT'
      },
      {
        id: 'QA_WATER_BUFFER_INTERSECT',
        type: 'spatial',
        operator: 'intersects',
        with_layer: 'WATER_BUF_5M',
        output_layer: 'QA_WATER_BUFFER_INTERSECT'
      }
    ],
    outputs: [
      {
        id: 'QA_WATER_REPORT',
        type: 'qa_report',
        include_layers: ['QA_WATER_INTERSECT', 'QA_WATER_BUFFER_INTERSECT']
      }
    ]
  },
  urban_validation: {
    id: 'QA_URBAN_CORE',
    inputs: {
      target_layer: 'Z_URBAN_RELOCATED',
      urban_layer: 'URBAIN_FULL',
      urban_buffer_layer: 'URBAIN_FULL_BUFFER_2000M'
    },
    checks: [
      {
        id: 'QA_URBAN_INTERSECT',
        type: 'spatial',
        operator: 'intersects',
        with_layer: 'URBAIN_FULL',
        output_layer: 'QA_URBAN_INTERSECT'
      },
      {
        id: 'QA_URBAN_BUFFER_INTERSECT',
        type: 'spatial',
        operator: 'intersects',
        with_layer: 'URBAIN_FULL_BUFFER_2000M',
        output_layer: 'QA_URBAN_BUFFER_INTERSECT'
      },
      {
        id: 'QA_URBAN_DISTANCE',
        type: 'expression',
        expression: 'distance($geometry, URBAIN_FULL) < 2000',
        output_layer: 'QA_URBAN_DISTANCE'
      }
    ],
    outputs: [
      {
        id: 'QA_URBAN_REPORT',
        type: 'qa_report',
        include_layers: ['QA_URBAN_INTERSECT', 'QA_URBAN_BUFFER_INTERSECT', 'QA_URBAN_DISTANCE']
      }
    ]
  }
};

// ─────────────────────────────────────────────
// 7. AUTOCORRECTION HYDRIQUE — Version allégée
// ─────────────────────────────────────────────
export const BIONIC_AUTOCORRECT = {
  hydric_repair: {
    id: 'AUTO_WATER_FIX_LIGHT',
    inputs: {
      problematic_layers: ['QA_WATER_INTERSECT', 'QA_WATER_BUFFER_INTERSECT'],
      water_layer: 'WATER_FULL',
      water_buffer_layer: 'WATER_BUF_5M'
    },
    steps: [
      {
        id: 'FIX_WATER_DIFFERENCE',
        type: 'geometry_difference',
        input_layers: ['QA_WATER_INTERSECT', 'QA_WATER_BUFFER_INTERSECT'],
        with_layer: 'WATER_FULL',
        output_layer: 'Z_WATER_FIXED'
      },
      {
        id: 'FIX_WATER_VALIDATE',
        type: 'spatial_filter',
        input_layer: 'Z_WATER_FIXED',
        conditions: [
          { type: 'spatial', operator: 'disjoint', with_layer: 'WATER_FULL' },
          { type: 'spatial', operator: 'disjoint', with_layer: 'WATER_BUF_5M' }
        ],
        output_layer: 'Z_WATER_FIXED_VALID'
      }
    ]
  }
};

// ─────────────────────────────────────────────
// 8. FUSION FINALE
// ─────────────────────────────────────────────
export const BIONIC_MERGE_CONFIG = {
  id: 'MERGE_CORRECTED_AND_BASE',
  type: 'geometry_merge_prefer_corrected',
  base_layer: 'Z_URBAN_RELOCATED',
  corrected_layer: 'Z_WATER_FIXED_VALID',
  key_attribute: 'id',
  output_layer: 'Z_FINAL'
};

// ─────────────────────────────────────────────
// 9. OUTPUT FINAL UNIQUE
// ─────────────────────────────────────────────
export const BIONIC_OUTPUT = {
  id: 'Z_AFFICHAGE_FINAL',
  source_layer: 'Z_FINAL',
  description: `Zones d'affichage BIONIC™ finales :
    - hors eau
    - hors buffer hydrique 5 m
    - hors zones urbaines
    - hors buffer urbain 2000 m
    - relocalisées vers le score maximal si nécessaire
    - corrigées hydriquement (version allégée)
    - validées par QA hydrique et urbain (noyau essentiel)`
};

// ─────────────────────────────────────────────
// PIPELINE COMPLET C2-A
// ─────────────────────────────────────────────
export const BIONIC_PIPELINE_TOTAL_C2A = {
  ruleset: 'BIONIC_PIPELINE_TOTAL_C2A',
  version: 'C2-A',
  description: `Pipeline total BIONIC™ optimisé performance (C2-A).
    Intègre hydrique + urbain + relocalisation intelligente + QA essentiels + autocorrection hydrique,
    avec un seul output final Z_AFFICHAGE_FINAL.`,
  
  inputs: BIONIC_INPUTS,
  preprocess: BIONIC_PREPROCESS,
  logic: { filters: BIONIC_EXCLUSION_FILTERS },
  postprocess: { adjustments: BIONIC_HYDRIC_ADJUSTMENTS },
  urban_relocation: [BIONIC_URBAN_RELOCATION],
  qa: BIONIC_QA_CONFIG,
  autocorrect: BIONIC_AUTOCORRECT,
  merge: BIONIC_MERGE_CONFIG,
  outputs: [BIONIC_OUTPUT]
};

/**
 * Applique le pipeline BIONIC C2-A à un ensemble de zones
 * @param {Array} zones - Zones sources (Z_SOURCE)
 * @param {Object} layers - Couches géographiques disponibles
 * @param {Object} options - Options de traitement
 * @returns {Object} Résultat avec Z_AFFICHAGE_FINAL et rapports QA
 */
export const applyBionicPipelineC2A = (zones, layers = {}, options = {}) => {
  const startTime = performance.now();
  const stats = {
    total: zones.length,
    hydric_excluded: 0,
    urban_excluded: 0,
    relocated: 0,
    autocorrected: 0,
    final: 0
  };
  
  let processedZones = [...zones];
  const qaReports = {
    hydric: { passed: 0, failed: 0, issues: [] },
    urban: { passed: 0, failed: 0, issues: [] }
  };
  
  // Étape 1: Filtrage hydrique (simulation)
  if (layers.WATER_FULL || options.enableHydricFilter) {
    const beforeCount = processedZones.length;
    processedZones = processedZones.filter(zone => {
      // Simulation de vérification hydrique
      const isInWater = zone.flags?.includes('EXCL_INTERSECTS_WATER');
      if (isInWater) {
        qaReports.hydric.failed++;
        qaReports.hydric.issues.push({ zoneId: zone.id, issue: 'INTERSECTS_WATER' });
        return false;
      }
      qaReports.hydric.passed++;
      return true;
    });
    stats.hydric_excluded = beforeCount - processedZones.length;
  }
  
  // Étape 2: Filtrage urbain (simulation)
  if (layers.URBAIN_FULL || options.enableUrbanFilter) {
    const beforeCount = processedZones.length;
    processedZones = processedZones.filter(zone => {
      // Simulation de vérification urbaine avec buffer 2000m
      const isInUrban = zone.flags?.includes('EXCL_INTERSECTS_URBAIN_BUFFER');
      if (isInUrban) {
        qaReports.urban.failed++;
        qaReports.urban.issues.push({ zoneId: zone.id, issue: 'WITHIN_URBAN_BUFFER_2000M' });
        return false;
      }
      qaReports.urban.passed++;
      return true;
    });
    stats.urban_excluded = beforeCount - processedZones.length;
  }
  
  // Étape 3: Relocalisation (simulation)
  if (options.enableRelocation) {
    processedZones = processedZones.map(zone => {
      if (zone.needsRelocation) {
        stats.relocated++;
        return {
          ...zone,
          relocated: true,
          relocation_source: 'RELOCATE_FROM_URBAN_2000M'
        };
      }
      return zone;
    });
  }
  
  // Étape 4: Autocorrection hydrique (simulation)
  if (options.enableAutocorrect) {
    processedZones = processedZones.map(zone => {
      if (zone.needsHydricCorrection) {
        stats.autocorrected++;
        return {
          ...zone,
          autocorrected: true,
          correction_source: 'AUTO_WATER_FIX_LIGHT'
        };
      }
      return zone;
    });
  }
  
  stats.final = processedZones.length;
  
  const endTime = performance.now();
  
  return {
    Z_AFFICHAGE_FINAL: processedZones,
    pipeline: 'BIONIC_PIPELINE_TOTAL_C2A',
    version: 'C2-A',
    stats,
    qa_reports: {
      QA_WATER_REPORT: qaReports.hydric,
      QA_URBAN_REPORT: qaReports.urban
    },
    processing_time_ms: Math.round(endTime - startTime),
    timestamp: new Date().toISOString()
  };
};

/**
 * Vérifie si une zone passe tous les contrôles QA du pipeline C2-A
 * @param {Object} zone - Zone à vérifier
 * @param {Object} layers - Couches de référence
 * @returns {Object} Résultat de validation
 */
export const validateZoneC2A = (zone, layers = {}) => {
  const checks = {
    QA_WATER_INTERSECT: true,
    QA_WATER_BUFFER_INTERSECT: true,
    QA_URBAN_INTERSECT: true,
    QA_URBAN_BUFFER_INTERSECT: true,
    QA_URBAN_DISTANCE: true
  };
  
  const issues = [];
  
  // Vérifications hydriques
  if (zone.intersectsWater) {
    checks.QA_WATER_INTERSECT = false;
    issues.push('Intersecte WATER_FULL');
  }
  if (zone.intersectsWaterBuffer) {
    checks.QA_WATER_BUFFER_INTERSECT = false;
    issues.push('Intersecte WATER_BUF_5M');
  }
  
  // Vérifications urbaines
  if (zone.intersectsUrban) {
    checks.QA_URBAN_INTERSECT = false;
    issues.push('Intersecte URBAIN_FULL');
  }
  if (zone.intersectsUrbanBuffer) {
    checks.QA_URBAN_BUFFER_INTERSECT = false;
    issues.push('Intersecte URBAIN_FULL_BUFFER_2000M');
  }
  if (zone.distanceToUrban < 2000) {
    checks.QA_URBAN_DISTANCE = false;
    issues.push('Distance < 2000m de URBAIN_FULL');
  }
  
  const passed = Object.values(checks).every(v => v);
  
  return {
    zoneId: zone.id,
    passed,
    checks,
    issues,
    validatedBy: 'BIONIC_PIPELINE_TOTAL_C2A'
  };
};

export default BIONIC_PIPELINE_TOTAL_C2A;
