/**
 * AutoOptimizationService.js
 * 
 * Module d'Auto-Optimisation BIONIC™
 * 
 * Fonctionnalités:
 * - Génération automatique de suggestions d'optimisation
 * - Création de résumés des modifications proposées
 * - Gestion des versions et backups
 * - Processus d'approbation administrateur
 * - Auto-analyse, auto-validation, auto-correction
 */

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

// Configuration du module d'auto-optimisation
const OPTIMIZATION_CONFIG = {
  VERSION_PREFIX: 'BIONIC_v',
  MAX_VERSIONS_KEPT: 50,
  AUTO_ANALYZE_INTERVAL_MS: 300000, // 5 minutes
  BACKUP_BEFORE_APPLY: true,
  REQUIRE_ADMIN_APPROVAL: true
};

// Types de changements possibles
export const CHANGE_TYPES = {
  PERFORMANCE: { id: 'performance', label: 'Performance', icon: '⚡', color: 'text-yellow-400' },
  SECURITY: { id: 'security', label: 'Sécurité', icon: '🔒', color: 'text-red-400' },
  FEATURE: { id: 'feature', label: 'Fonctionnalité', icon: '✨', color: 'text-blue-400' },
  FIX: { id: 'fix', label: 'Correction', icon: '🔧', color: 'text-green-400' },
  OPTIMIZATION: { id: 'optimization', label: 'Optimisation', icon: '🚀', color: 'text-purple-400' },
  CONFIG: { id: 'config', label: 'Configuration', icon: '⚙️', color: 'text-gray-400' }
};

// Statuts des propositions
export const PROPOSAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  APPLIED: 'applied',
  ROLLED_BACK: 'rolled_back'
};

/**
 * Crée une nouvelle proposition d'optimisation
 */
export async function createOptimizationProposal(proposal) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/optimization/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...proposal,
        created_at: new Date().toISOString(),
        status: PROPOSAL_STATUS.PENDING
      })
    });
    
    if (!response.ok) throw new Error('Failed to create proposal');
    return await response.json();
  } catch (error) {
    console.error('[AutoOptimization] Error creating proposal:', error);
    throw error;
  }
}

/**
 * Récupère toutes les propositions d'optimisation
 */
export async function getOptimizationProposals(status = null) {
  try {
    const url = status 
      ? `${API_BASE}/api/admin/optimization/proposals?status=${status}`
      : `${API_BASE}/api/admin/optimization/proposals`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch proposals');
    return await response.json();
  } catch (error) {
    console.error('[AutoOptimization] Error fetching proposals:', error);
    return [];
  }
}

/**
 * Approuve une proposition (Accepter les changements)
 */
export async function approveProposal(proposalId, adminNotes = '') {
  try {
    // D'abord, créer un backup
    if (OPTIMIZATION_CONFIG.BACKUP_BEFORE_APPLY) {
      await createVersionBackup(`Pre-approval backup for proposal ${proposalId}`);
    }
    
    const response = await fetch(`${API_BASE}/api/admin/optimization/proposals/${proposalId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approved_at: new Date().toISOString(),
        admin_notes: adminNotes
      })
    });
    
    if (!response.ok) throw new Error('Failed to approve proposal');
    return await response.json();
  } catch (error) {
    console.error('[AutoOptimization] Error approving proposal:', error);
    throw error;
  }
}

/**
 * Rejette une proposition
 */
export async function rejectProposal(proposalId, reason = '') {
  try {
    const response = await fetch(`${API_BASE}/api/admin/optimization/proposals/${proposalId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rejected_at: new Date().toISOString(),
        rejection_reason: reason
      })
    });
    
    if (!response.ok) throw new Error('Failed to reject proposal');
    return await response.json();
  } catch (error) {
    console.error('[AutoOptimization] Error rejecting proposal:', error);
    throw error;
  }
}

/**
 * Crée un backup versionné de l'état actuel
 */
export async function createVersionBackup(description = '') {
  try {
    const response = await fetch(`${API_BASE}/api/admin/optimization/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        created_at: new Date().toISOString(),
        modules: ['bionic', 'territory', 'waypoints', 'zones', 'config']
      })
    });
    
    if (!response.ok) throw new Error('Failed to create version backup');
    return await response.json();
  } catch (error) {
    console.error('[AutoOptimization] Error creating backup:', error);
    throw error;
  }
}

/**
 * Récupère la liste des versions sauvegardées
 */
export async function getVersionHistory() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/optimization/versions`);
    if (!response.ok) throw new Error('Failed to fetch versions');
    return await response.json();
  } catch (error) {
    console.error('[AutoOptimization] Error fetching versions:', error);
    return [];
  }
}

/**
 * Restaure une version précédente
 */
export async function restoreVersion(versionId) {
  try {
    // Créer un backup de l'état actuel avant restauration
    await createVersionBackup(`Pre-restore backup before reverting to version ${versionId}`);
    
    const response = await fetch(`${API_BASE}/api/admin/optimization/versions/${versionId}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restored_at: new Date().toISOString()
      })
    });
    
    if (!response.ok) throw new Error('Failed to restore version');
    return await response.json();
  } catch (error) {
    console.error('[AutoOptimization] Error restoring version:', error);
    throw error;
  }
}

/**
 * Exécute une auto-analyse du système
 */
export async function runAutoAnalysis() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/optimization/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error('Failed to run analysis');
    return await response.json();
  } catch (error) {
    console.error('[AutoOptimization] Error running analysis:', error);
    throw error;
  }
}

/**
 * Génère un résumé des modifications proposées
 */
export function generateProposalSummary(proposal) {
  const changeType = CHANGE_TYPES[proposal.type?.toUpperCase()] || CHANGE_TYPES.OPTIMIZATION;
  
  return {
    title: proposal.title,
    type: changeType,
    impact: proposal.impact || 'medium',
    affectedModules: proposal.affected_modules || [],
    summary: proposal.description,
    benefits: proposal.benefits || [],
    risks: proposal.risks || [],
    estimatedTime: proposal.estimated_time || 'instant',
    requiresRestart: proposal.requires_restart || false
  };
}

export default {
  createOptimizationProposal,
  getOptimizationProposals,
  approveProposal,
  rejectProposal,
  createVersionBackup,
  getVersionHistory,
  restoreVersion,
  runAutoAnalysis,
  generateProposalSummary,
  CHANGE_TYPES,
  PROPOSAL_STATUS,
  OPTIMIZATION_CONFIG
};
