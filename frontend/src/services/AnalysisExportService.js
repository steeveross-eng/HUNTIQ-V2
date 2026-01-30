/**
 * AnalysisExportService.js
 * 
 * Service pour persister et exporter les résultats d'analyse de zone BIONIC™
 * Supporte les formats PDF et GPX
 * 
 * @version 1.0.0
 */

// Configuration API
const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Clé de stockage local pour l'historique des analyses
const STORAGE_KEY = 'bionic_analysis_history';
const MAX_HISTORY = 50;

/**
 * Persiste un résultat d'analyse dans le localStorage et optionnellement en base
 * @param {Object} analysis - Résultat d'analyse de zone
 * @returns {Object} Analyse avec ID généré
 */
export const persistAnalysis = (analysis) => {
  const timestamp = new Date().toISOString();
  const analysisWithMeta = {
    ...analysis,
    id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp,
    version: '1.0'
  };
  
  // Sauvegarder dans localStorage
  try {
    const history = getAnalysisHistory();
    history.unshift(analysisWithMeta);
    
    // Limiter l'historique
    if (history.length > MAX_HISTORY) {
      history.splice(MAX_HISTORY);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    console.log('[AnalysisExport] Analysis persisted:', analysisWithMeta.id);
  } catch (e) {
    console.warn('[AnalysisExport] Failed to persist locally:', e);
  }
  
  return analysisWithMeta;
};

/**
 * Récupère l'historique des analyses depuis le localStorage
 * @returns {Array} Liste des analyses
 */
export const getAnalysisHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn('[AnalysisExport] Failed to load history:', e);
    return [];
  }
};

/**
 * Supprime une analyse de l'historique
 * @param {string} analysisId - ID de l'analyse à supprimer
 */
export const deleteAnalysis = (analysisId) => {
  const history = getAnalysisHistory();
  const filtered = history.filter(a => a.id !== analysisId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

/**
 * Exporte une analyse en format GPX
 * @param {Object} analysis - Résultat d'analyse
 * @param {Object} waypoint - Waypoint de référence
 * @returns {string} Contenu GPX
 */
export const exportToGPX = (analysis, waypoint) => {
  const timestamp = new Date().toISOString();
  const hotspot = analysis.optimal_hotspot || analysis.hotspot;
  
  let gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="HUNTIQ BIONIC™" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Analyse BIONIC™ - ${waypoint?.name || 'Zone'}</name>
    <desc>Analyse de zone de ${analysis.area || '?'} km² générée par HUNTIQ BIONIC™</desc>
    <time>${timestamp}</time>
    <author>
      <name>HUNTIQ BIONIC™</name>
    </author>
  </metadata>
  
  <!-- Waypoint de référence -->
  <wpt lat="${waypoint?.lat || 0}" lon="${waypoint?.lng || 0}">
    <name>${waypoint?.name || 'Point de référence'}</name>
    <desc>Waypoint utilisé comme centre d'analyse</desc>
    <sym>Flag, Blue</sym>
    <type>Reference Point</type>
  </wpt>`;

  // Ajouter le hotspot optimal si disponible
  if (hotspot && hotspot.coordinates) {
    const [lat, lng] = hotspot.coordinates;
    gpxContent += `
  
  <!-- Hotspot Optimal BIONIC™ -->
  <wpt lat="${lat}" lon="${lng}">
    <name>🎯 Hotspot Optimal</name>
    <desc>Score: ${hotspot.score || analysis.score || '?'}/100 - ${hotspot.habitat_type || 'Zone optimale'}</desc>
    <sym>Flag, Green</sym>
    <type>Optimal Hotspot</type>
    <extensions>
      <bionic:score>${hotspot.score || analysis.score || 0}</bionic:score>
      <bionic:behavior>${hotspot.primary_behavior || 'unknown'}</bionic:behavior>
      <bionic:habitat>${hotspot.habitat_type || 'unknown'}</bionic:habitat>
    </extensions>
  </wpt>`;
  }

  // Ajouter les zones comportementales si disponibles
  if (analysis.zones && analysis.zones.length > 0) {
    gpxContent += `
  
  <!-- Zones comportementales -->`;
    analysis.zones.forEach((zone, index) => {
      if (zone.center) {
        const [lat, lng] = zone.center;
        gpxContent += `
  <wpt lat="${lat}" lon="${lng}">
    <name>${zone.behavior || `Zone ${index + 1}`}</name>
    <desc>Score: ${zone.score || '?'}/100 - ${zone.habitat_type || 'Zone'}</desc>
    <sym>Circle, ${zone.behavior === 'corridor' ? 'Yellow' : zone.behavior === 'alimentation' ? 'Green' : 'Blue'}</sym>
    <type>Behavior Zone</type>
  </wpt>`;
      }
    });
  }

  gpxContent += `
</gpx>`;

  return gpxContent;
};

/**
 * Télécharge le fichier GPX
 * @param {Object} analysis - Résultat d'analyse
 * @param {Object} waypoint - Waypoint de référence
 */
export const downloadGPX = (analysis, waypoint) => {
  const gpxContent = exportToGPX(analysis, waypoint);
  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `BIONIC_Analysis_${waypoint?.name || 'Zone'}_${new Date().toISOString().split('T')[0]}.gpx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log('[AnalysisExport] GPX downloaded');
};

/**
 * Génère le contenu HTML pour le PDF
 * @param {Object} analysis - Résultat d'analyse
 * @param {Object} waypoint - Waypoint de référence
 * @param {string} espece - Espèce cible
 * @returns {string} Contenu HTML
 */
const generatePDFContent = (analysis, waypoint, espece) => {
  const hotspot = analysis.optimal_hotspot || analysis.hotspot;
  const timestamp = new Date().toLocaleString('fr-CA');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Rapport d'Analyse BIONIC™</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: #fff;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #f5a623;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #f5a623;
        }
        .subtitle {
          color: #888;
          font-size: 14px;
          margin-top: 5px;
        }
        .section {
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          border: 1px solid rgba(245,166,35,0.2);
        }
        .section-title {
          color: #f5a623;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .stat-item {
          background: rgba(0,0,0,0.3);
          padding: 15px;
          border-radius: 8px;
        }
        .stat-label {
          color: #888;
          font-size: 12px;
          text-transform: uppercase;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #fff;
          margin-top: 5px;
        }
        .score-excellent { color: #22c55e; }
        .score-good { color: #f5a623; }
        .score-medium { color: #eab308; }
        .score-low { color: #ef4444; }
        .coordinates {
          font-family: monospace;
          background: rgba(0,0,0,0.4);
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 14px;
        }
        .behavior-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }
        .behavior-corridor { background: #eab308; color: #000; }
        .behavior-alimentation { background: #22c55e; color: #000; }
        .behavior-cache { background: #3b82f6; color: #fff; }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
          color: #666;
          font-size: 12px;
        }
        @media print {
          body { background: #fff; color: #000; }
          .section { border: 1px solid #ddd; background: #f9f9f9; }
          .stat-item { background: #eee; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🎯 BIONIC™ Analysis Report</div>
        <div class="subtitle">Rapport d'analyse de zone généré par HUNTIQ</div>
      </div>
      
      <div class="section">
        <div class="section-title">📍 Informations de base</div>
        <div class="stat-grid">
          <div class="stat-item">
            <div class="stat-label">Waypoint de référence</div>
            <div class="stat-value">${waypoint?.name || 'N/A'}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Espèce cible</div>
            <div class="stat-value">${espece || 'ORIGNAL'}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Zone analysée</div>
            <div class="stat-value">${analysis.area || '?'} km²</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Date d'analyse</div>
            <div class="stat-value" style="font-size: 16px;">${timestamp}</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">🎯 Hotspot Optimal</div>
        <div class="stat-grid">
          <div class="stat-item">
            <div class="stat-label">Score Habitat</div>
            <div class="stat-value ${getScoreClass(hotspot?.score || analysis.score)}">${hotspot?.score || analysis.score || '?'}/100</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Comportement principal</div>
            <div class="stat-value">
              <span class="behavior-badge behavior-${hotspot?.primary_behavior || 'corridor'}">
                ${getBehaviorLabel(hotspot?.primary_behavior)}
              </span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Type d'habitat</div>
            <div class="stat-value" style="font-size: 16px;">${hotspot?.habitat_type || 'Forêt mixte'}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Distance du waypoint</div>
            <div class="stat-value">${hotspot?.distance_from_center || analysis.distanceFromCenter || '?'}m</div>
          </div>
        </div>
        ${hotspot?.coordinates ? `
        <div style="margin-top: 15px;">
          <div class="stat-label">Coordonnées GPS</div>
          <div class="coordinates">
            Lat: ${hotspot.coordinates[0].toFixed(6)} | Lng: ${hotspot.coordinates[1].toFixed(6)}
          </div>
        </div>
        ` : ''}
      </div>
      
      ${analysis.zones && analysis.zones.length > 0 ? `
      <div class="section">
        <div class="section-title">🦌 Zones comportementales (${analysis.zones.length})</div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: rgba(0,0,0,0.3);">
            <th style="padding: 10px; text-align: left;">Comportement</th>
            <th style="padding: 10px; text-align: center;">Score</th>
            <th style="padding: 10px; text-align: center;">Surface</th>
          </tr>
          ${analysis.zones.slice(0, 10).map(zone => `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
            <td style="padding: 10px;">
              <span class="behavior-badge behavior-${zone.behavior}">${getBehaviorLabel(zone.behavior)}</span>
            </td>
            <td style="padding: 10px; text-align: center; font-weight: bold;">${zone.score || '?'}</td>
            <td style="padding: 10px; text-align: center;">${zone.area_km2 ? zone.area_km2.toFixed(2) + ' km²' : '-'}</td>
          </tr>
          `).join('')}
        </table>
      </div>
      ` : ''}
      
      <div class="section">
        <div class="section-title">📊 Recommandations</div>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>Privilégiez les heures crépusculaires (aube et crépuscule)</li>
          <li>Approchez par le vent de face pour éviter la détection olfactive</li>
          <li>Le hotspot identifié présente les meilleures conditions d'habitat</li>
          ${hotspot?.primary_behavior === 'alimentation' ? '<li>Zone d\'alimentation : présence probable en début/fin de journée</li>' : ''}
          ${hotspot?.primary_behavior === 'corridor' ? '<li>Zone de corridor : passage fréquent, idéal pour l\'observation</li>' : ''}
          ${hotspot?.primary_behavior === 'cache' ? '<li>Zone de repos : approche silencieuse recommandée</li>' : ''}
        </ul>
      </div>
      
      <div class="footer">
        <p>Rapport généré par HUNTIQ BIONIC™ v3.3</p>
        <p>© ${new Date().getFullYear()} HUNTIQ - Tous droits réservés</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Helper pour la classe de couleur du score
 */
const getScoreClass = (score) => {
  if (score >= 80) return 'score-excellent';
  if (score >= 65) return 'score-good';
  if (score >= 50) return 'score-medium';
  return 'score-low';
};

/**
 * Helper pour le label du comportement
 */
const getBehaviorLabel = (behavior) => {
  const labels = {
    corridor: '→ Corridor',
    alimentation: '● Alimentation',
    cache: '◆ Cache/Repos'
  };
  return labels[behavior] || behavior || 'Inconnu';
};

/**
 * Télécharge le rapport PDF (via impression HTML)
 * @param {Object} analysis - Résultat d'analyse
 * @param {Object} waypoint - Waypoint de référence
 * @param {string} espece - Espèce cible
 */
export const downloadPDF = (analysis, waypoint, espece) => {
  const htmlContent = generatePDFContent(analysis, waypoint, espece);
  
  // Ouvrir une nouvelle fenêtre avec le contenu HTML
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Attendre le chargement puis lancer l'impression
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  } else {
    console.warn('[AnalysisExport] Popup blocked, trying alternative method');
    // Alternative : créer un iframe caché
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.contentDocument.write(htmlContent);
    iframe.contentDocument.close();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  }
  
  console.log('[AnalysisExport] PDF print triggered');
};

/**
 * Persiste l'analyse en base de données via l'API
 * @param {Object} analysis - Résultat d'analyse
 * @param {string} userId - ID utilisateur
 * @returns {Promise<Object>} Analyse persistée
 */
export const saveAnalysisToServer = async (analysis, userId) => {
  try {
    const response = await fetch(`${API_URL}/api/analysis/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...analysis,
        user_id: userId,
        saved_at: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    console.log('[AnalysisExport] Analysis saved to server:', result);
    return result;
  } catch (e) {
    console.warn('[AnalysisExport] Failed to save to server:', e);
    // Fallback sur localStorage
    return persistAnalysis(analysis);
  }
};

export default {
  persistAnalysis,
  getAnalysisHistory,
  deleteAnalysis,
  exportToGPX,
  downloadGPX,
  downloadPDF,
  saveAnalysisToServer
};
