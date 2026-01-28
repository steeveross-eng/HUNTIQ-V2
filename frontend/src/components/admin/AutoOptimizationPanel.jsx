/**
 * AutoOptimizationPanel.jsx
 * 
 * Panneau d'administration pour le module d'auto-optimisation BIONIC™
 * 
 * Fonctionnalités:
 * - Toggle ON/OFF du module
 * - Configuration des notifications email
 * - Affichage des propositions d'optimisation en attente
 * - Bouton "Accepter les changements" pour approbation
 * - Historique des versions avec restauration
 * - Auto-analyse et suggestions automatiques
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Zap, CheckCircle, XCircle, Clock, History, RefreshCw, 
  Shield, AlertTriangle, ChevronDown, ChevronUp, Play,
  RotateCcw, Archive, Eye, Settings, Brain, Sparkles,
  Power, Mail, Bell, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  getOptimizationProposals,
  approveProposal,
  rejectProposal,
  getVersionHistory,
  restoreVersion,
  runAutoAnalysis,
  createVersionBackup,
  generateProposalSummary,
  CHANGE_TYPES,
  PROPOSAL_STATUS
} from '@/services/AutoOptimizationService';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

// Composant pour afficher une proposition
const ProposalCard = ({ proposal, onApprove, onReject, onPreview, disabled }) => {
  const [expanded, setExpanded] = useState(false);
  const summary = generateProposalSummary(proposal);
  const changeType = summary.type;

  const statusColors = {
    [PROPOSAL_STATUS.PENDING]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    [PROPOSAL_STATUS.APPROVED]: 'bg-green-500/20 text-green-400 border-green-500/30',
    [PROPOSAL_STATUS.REJECTED]: 'bg-red-500/20 text-red-400 border-red-500/30',
    [PROPOSAL_STATUS.APPLIED]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    [PROPOSAL_STATUS.ROLLED_BACK]: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  };

  return (
    <div className={`bg-gray-800/50 rounded-lg border ${proposal.status === PROPOSAL_STATUS.PENDING ? 'border-yellow-500/50' : 'border-gray-700'} overflow-hidden`}>
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-800/70 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`text-2xl ${changeType.color}`}>
              {changeType.icon}
            </div>
            <div>
              <h4 className="text-white font-medium">{proposal.title}</h4>
              <p className="text-gray-400 text-sm mt-1">{proposal.description?.substring(0, 100)}...</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`text-xs ${statusColors[proposal.status]}`}>
                  {proposal.status === PROPOSAL_STATUS.PENDING ? 'En attente' :
                   proposal.status === PROPOSAL_STATUS.APPROVED ? 'Approuvé' :
                   proposal.status === PROPOSAL_STATUS.REJECTED ? 'Rejeté' :
                   proposal.status === PROPOSAL_STATUS.APPLIED ? 'Appliqué' : 'Annulé'}
                </Badge>
                <Badge className="bg-gray-700 text-gray-300 text-xs">
                  {changeType.label}
                </Badge>
                {summary.requiresRestart && (
                  <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                    Redémarrage requis
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {expanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-700 pt-4">
          {/* Modules affectés */}
          {summary.affectedModules?.length > 0 && (
            <div className="mb-3">
              <span className="text-xs text-gray-500 uppercase">Modules affectés</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {summary.affectedModules.map((mod, i) => (
                  <Badge key={i} className="bg-purple-500/20 text-purple-300 text-xs">
                    {mod}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Bénéfices */}
          {summary.benefits?.length > 0 && (
            <div className="mb-3">
              <span className="text-xs text-gray-500 uppercase">Bénéfices</span>
              <ul className="mt-1 space-y-1">
                {summary.benefits.map((benefit, i) => (
                  <li key={i} className="text-sm text-green-400 flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risques */}
          {summary.risks?.length > 0 && (
            <div className="mb-4">
              <span className="text-xs text-gray-500 uppercase">Risques potentiels</span>
              <ul className="mt-1 space-y-1">
                {summary.risks.map((risk, i) => (
                  <li key={i} className="text-sm text-orange-400 flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          {proposal.status === PROPOSAL_STATUS.PENDING && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
              <Button
                onClick={() => onApprove(proposal.id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accepter les changements
              </Button>
              <Button
                variant="outline"
                onClick={() => onReject(proposal.id)}
                className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Composant pour l'historique des versions
const VersionHistoryItem = ({ version, onRestore, isLatest }) => {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${isLatest ? 'bg-green-900/20 border border-green-500/30' : 'bg-gray-800/30 border border-gray-700'}`}>
      <div className="flex items-center gap-3">
        <Archive className={`h-5 w-5 ${isLatest ? 'text-green-400' : 'text-gray-400'}`} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">{version.version_id}</span>
            {isLatest && <Badge className="bg-green-500/20 text-green-400 text-xs">Actuel</Badge>}
          </div>
          <p className="text-gray-400 text-xs mt-0.5">{version.description}</p>
          <p className="text-gray-500 text-xs">{new Date(version.created_at).toLocaleString('fr-FR')}</p>
        </div>
      </div>
      {!isLatest && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRestore(version.id)}
          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Restaurer
        </Button>
      )}
    </div>
  );
};

// Composant principal
const AutoOptimizationPanel = () => {
  const [proposals, setProposals] = useState([]);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('proposals');
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState(null);

  // Charger les données
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [proposalsData, versionsData] = await Promise.all([
        getOptimizationProposals(),
        getVersionHistory()
      ]);
      setProposals(proposalsData);
      setVersions(versionsData);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Lancer l'auto-analyse
  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const results = await runAutoAnalysis();
      toast.success(`Analyse terminée: ${results.suggestions_count || 0} suggestions générées`);
      await loadData();
    } catch (error) {
      toast.error('Erreur lors de l\'analyse');
    } finally {
      setAnalyzing(false);
    }
  };

  // Approuver une proposition
  const handleApprove = async (proposalId) => {
    try {
      await approveProposal(proposalId);
      toast.success('Changements approuvés et appliqués', {
        description: 'Un backup a été créé automatiquement'
      });
      await loadData();
    } catch (error) {
      toast.error('Erreur lors de l\'approbation');
    }
  };

  // Rejeter une proposition
  const handleReject = async (proposalId) => {
    try {
      await rejectProposal(proposalId, 'Rejeté par l\'administrateur');
      toast.info('Proposition rejetée');
      await loadData();
    } catch (error) {
      toast.error('Erreur lors du rejet');
    }
  };

  // Restaurer une version
  const handleRestore = async () => {
    if (!versionToRestore) return;
    
    try {
      await restoreVersion(versionToRestore.id);
      toast.success(`Version ${versionToRestore.version_id} restaurée avec succès`);
      setShowRestoreDialog(false);
      setVersionToRestore(null);
      await loadData();
    } catch (error) {
      toast.error('Erreur lors de la restauration');
    }
  };

  // Créer un backup manuel
  const handleCreateBackup = async () => {
    try {
      await createVersionBackup('Backup manuel créé par l\'administrateur');
      toast.success('Backup créé avec succès');
      await loadData();
    } catch (error) {
      toast.error('Erreur lors de la création du backup');
    }
  };

  const pendingCount = proposals.filter(p => p.status === PROPOSAL_STATUS.PENDING).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Brain className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Module d'Auto-Optimisation
              <Sparkles className="h-5 w-5 text-yellow-400" />
            </h2>
            <p className="text-gray-400 text-sm">Amélioration continue avec approbation administrateur</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleCreateBackup}
            className="border-gray-600 text-gray-300"
          >
            <Archive className="h-4 w-4 mr-2" />
            Créer Backup
          </Button>
          <Button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {analyzing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {analyzing ? 'Analyse...' : 'Lancer Auto-Analyse'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        <Button
          variant={activeTab === 'proposals' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('proposals')}
          className={activeTab === 'proposals' ? 'bg-[#f5a623] text-black' : 'text-gray-400'}
        >
          <Zap className="h-4 w-4 mr-2" />
          Propositions
          {pendingCount > 0 && (
            <Badge className="ml-2 bg-red-500 text-white">{pendingCount}</Badge>
          )}
        </Button>
        <Button
          variant={activeTab === 'versions' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('versions')}
          className={activeTab === 'versions' ? 'bg-[#f5a623] text-black' : 'text-gray-400'}
        >
          <History className="h-4 w-4 mr-2" />
          Historique Versions
          <Badge className="ml-2 bg-gray-600 text-white">{versions.length}</Badge>
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 text-[#f5a623] animate-spin" />
        </div>
      ) : activeTab === 'proposals' ? (
        <div className="space-y-4">
          {proposals.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucune proposition d'optimisation</p>
                <p className="text-gray-500 text-sm mt-1">Lancez une auto-analyse pour générer des suggestions</p>
              </CardContent>
            </Card>
          ) : (
            proposals.map(proposal => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {versions.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="py-12 text-center">
                <Archive className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucune version sauvegardée</p>
                <p className="text-gray-500 text-sm mt-1">Les backups seront créés automatiquement lors des modifications</p>
              </CardContent>
            </Card>
          ) : (
            versions.map((version, index) => (
              <VersionHistoryItem
                key={version.id}
                version={version}
                isLatest={index === 0}
                onRestore={(v) => {
                  setVersionToRestore(version);
                  setShowRestoreDialog(true);
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Dialog de confirmation de restauration */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-blue-400" />
              Confirmer la restauration
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Êtes-vous sûr de vouloir restaurer la version <strong className="text-white">{versionToRestore?.version_id}</strong> ?
              <br /><br />
              Un backup de l'état actuel sera créé automatiquement avant la restauration.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRestoreDialog(false)}
              className="border-gray-600"
            >
              Annuler
            </Button>
            <Button
              onClick={handleRestore}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurer cette version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutoOptimizationPanel;
