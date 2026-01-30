/**
 * AnalysisExportButtons.jsx
 * 
 * Composant de boutons d'export pour les résultats d'analyse BIONIC™
 * Supporte PDF et GPX
 * 
 * @version 1.0.0
 */

import React, { memo, useCallback, useState } from 'react';
import { FileText, Download, Map, Save, History, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { 
  downloadPDF, 
  downloadGPX, 
  persistAnalysis,
  getAnalysisHistory,
  deleteAnalysis
} from '@/services/AnalysisExportService';

/**
 * Bouton d'export avec dropdown
 */
const AnalysisExportButtons = memo(function AnalysisExportButtons({
  analysis,
  waypoint,
  espece = 'ORIGNAL',
  onSave,
  showHistory = false,
  compact = false
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState([]);
  
  // Charger l'historique
  const loadHistory = useCallback(() => {
    setHistory(getAnalysisHistory().slice(0, 5));
  }, []);
  
  // Sauvegarder l'analyse
  const handleSave = useCallback(async () => {
    if (!analysis) return;
    
    setIsSaving(true);
    try {
      const saved = persistAnalysis({
        ...analysis,
        waypoint: waypoint ? { name: waypoint.name, lat: waypoint.lat, lng: waypoint.lng } : null,
        espece
      });
      
      toast.success('Analyse sauvegardée !', {
        description: `ID: ${saved.id.slice(0, 12)}...`
      });
      
      if (onSave) onSave(saved);
    } catch (e) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  }, [analysis, waypoint, espece, onSave]);
  
  // Export PDF
  const handleExportPDF = useCallback(() => {
    if (!analysis) {
      toast.warning('Aucune analyse à exporter');
      return;
    }
    
    downloadPDF(analysis, waypoint, espece);
    toast.success('Export PDF lancé', {
      description: 'La fenêtre d\'impression va s\'ouvrir'
    });
  }, [analysis, waypoint, espece]);
  
  // Export GPX
  const handleExportGPX = useCallback(() => {
    if (!analysis) {
      toast.warning('Aucune analyse à exporter');
      return;
    }
    
    downloadGPX(analysis, waypoint);
    toast.success('Fichier GPX téléchargé', {
      description: 'Importez-le dans votre GPS ou application de navigation'
    });
  }, [analysis, waypoint]);
  
  // Supprimer de l'historique
  const handleDeleteFromHistory = useCallback((analysisId) => {
    deleteAnalysis(analysisId);
    setHistory(prev => prev.filter(a => a.id !== analysisId));
    toast.info('Analyse supprimée de l\'historique');
  }, []);
  
  if (!analysis && !showHistory) {
    return null;
  }
  
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={isSaving || !analysis}
          className="h-7 px-2 text-[10px]"
          title="Sauvegarder"
        >
          <Save className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleExportPDF}
          disabled={!analysis}
          className="h-7 px-2 text-[10px]"
          title="Export PDF"
        >
          <FileText className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleExportGPX}
          disabled={!analysis}
          className="h-7 px-2 text-[10px]"
          title="Export GPX"
        >
          <Map className="h-3 w-3" />
        </Button>
      </div>
    );
  }
  
  return (
    <DropdownMenu onOpenChange={(open) => open && loadHistory()}>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm" 
          variant="outline" 
          className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
          data-testid="export-analysis-btn"
        >
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-900 border-gray-700 w-56 z-[9999]" align="end">
        <DropdownMenuLabel className="text-[#f5a623] text-xs">
          Actions
        </DropdownMenuLabel>
        
        <DropdownMenuItem 
          onClick={handleSave}
          disabled={isSaving || !analysis}
          className="cursor-pointer hover:bg-gray-800"
        >
          <Save className="h-4 w-4 mr-2 text-green-400" />
          <span>Sauvegarder l'analyse</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-gray-700" />
        
        <DropdownMenuLabel className="text-gray-400 text-xs">
          Formats d'export
        </DropdownMenuLabel>
        
        <DropdownMenuItem 
          onClick={handleExportPDF}
          disabled={!analysis}
          className="cursor-pointer hover:bg-gray-800"
        >
          <FileText className="h-4 w-4 mr-2 text-red-400" />
          <div className="flex-1">
            <div>Rapport PDF</div>
            <div className="text-[10px] text-gray-500">Rapport complet imprimable</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleExportGPX}
          disabled={!analysis}
          className="cursor-pointer hover:bg-gray-800"
        >
          <Map className="h-4 w-4 mr-2 text-blue-400" />
          <div className="flex-1">
            <div>Fichier GPX</div>
            <div className="text-[10px] text-gray-500">Pour GPS & navigation</div>
          </div>
        </DropdownMenuItem>
        
        {showHistory && history.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuLabel className="text-gray-400 text-xs flex items-center gap-2">
              <History className="h-3 w-3" />
              Historique récent
            </DropdownMenuLabel>
            
            {history.map(item => (
              <div 
                key={item.id}
                className="flex items-center justify-between px-2 py-1.5 text-[11px] hover:bg-gray-800 rounded"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-white truncate">
                    {item.waypoint?.name || 'Analyse'}
                  </div>
                  <div className="text-gray-500 text-[9px]">
                    {new Date(item.timestamp).toLocaleDateString('fr-CA')}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Badge className="bg-gray-700 text-[8px]">
                    {item.optimal_hotspot?.score || item.score || '?'}
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFromHistory(item.id);
                    }}
                    className="p-1 hover:bg-red-500/20 rounded"
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

AnalysisExportButtons.displayName = 'AnalysisExportButtons';

export default AnalysisExportButtons;
