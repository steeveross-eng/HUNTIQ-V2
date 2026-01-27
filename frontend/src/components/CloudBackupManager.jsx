/**
 * CloudBackupManager - Interface complète de backup cloud
 * MongoDB Atlas + Google Cloud Storage + ZIP automatique
 * With Email Notifications via Resend
 */

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Database,
  Cloud,
  Archive,
  Download,
  Upload,
  RefreshCw,
  Play,
  Square,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  HelpCircle,
  ExternalLink,
  Copy,
  Loader2,
  AlertTriangle,
  Server,
  FolderArchive,
  Timer,
  Zap,
  Mail,
  Bell,
  Send
} from "lucide-react";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL;

const CloudBackupManager = () => {
  // State
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  // Atlas state
  const [atlasStatus, setAtlasStatus] = useState(null);
  const [atlasConfig, setAtlasConfig] = useState({ connection_string: "", database_name: "huntiq_backup" });
  const [atlasSyncing, setAtlasSyncing] = useState(false);
  const [showAtlasGuide, setShowAtlasGuide] = useState(false);
  const [atlasGuide, setAtlasGuide] = useState(null);
  
  // GCS state
  const [gcsStatus, setGcsStatus] = useState(null);
  const [gcsConfig, setGcsConfig] = useState({ project_id: "", bucket_name: "", credentials_json: "" });
  const [gcsUploading, setGcsUploading] = useState(false);
  const [showGcsGuide, setShowGcsGuide] = useState(false);
  const [gcsGuide, setGcsGuide] = useState(null);
  
  // ZIP state
  const [zipInfo, setZipInfo] = useState(null);
  const [zipCreating, setZipCreating] = useState(false);
  
  // Schedule state
  const [scheduleStatus, setScheduleStatus] = useState(null);
  const [scheduleConfig, setScheduleConfig] = useState({
    zip_interval_minutes: 1,
    atlas_interval_minutes: 60,
    gcs_interval_minutes: 60,
    enabled: false
  });
  
  // Logs state
  const [logs, setLogs] = useState([]);
  
  // Notification state
  const [notifStatus, setNotifStatus] = useState(null);
  const [notifConfig, setNotifConfig] = useState({
    enabled: true,
    recipient_email: "",
    send_daily_summary: true,
    send_on_failure: true,
    summary_hour: 8
  });
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingSummary, setSendingSummary] = useState(false);
  
  // Resend API key state
  const [resendApiKey, setResendApiKey] = useState("");
  const [resendStatus, setResendStatus] = useState(null);
  const [savingApiKey, setSavingApiKey] = useState(false);

  // Helpers
  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("fr-CA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Load data
  const loadStats = async () => {
    try {
      const response = await axios.get(`${API}/api/backup-cloud/stats`);
      if (response.data.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
    setLoading(false);
  };

  const loadAtlasStatus = async () => {
    try {
      const response = await axios.get(`${API}/api/backup-cloud/atlas/status`);
      setAtlasStatus(response.data);
    } catch (error) {
      console.error("Error loading Atlas status:", error);
    }
  };

  const loadGcsStatus = async () => {
    try {
      const response = await axios.get(`${API}/api/backup-cloud/gcs/status`);
      setGcsStatus(response.data);
    } catch (error) {
      console.error("Error loading GCS status:", error);
    }
  };

  const loadZipInfo = async () => {
    try {
      const response = await axios.get(`${API}/api/backup-cloud/zip/latest`);
      setZipInfo(response.data);
    } catch (error) {
      console.error("Error loading ZIP info:", error);
    }
  };

  const loadScheduleStatus = async () => {
    try {
      const response = await axios.get(`${API}/api/backup-cloud/schedule/status`);
      setScheduleStatus(response.data);
      if (response.data.schedule) {
        setScheduleConfig({
          ...scheduleConfig,
          ...response.data.schedule
        });
      }
    } catch (error) {
      console.error("Error loading schedule:", error);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await axios.get(`${API}/api/backup-cloud/logs?limit=20`);
      if (response.data.success) {
        setLogs(response.data.logs);
      }
    } catch (error) {
      console.error("Error loading logs:", error);
    }
  };

  const loadNotificationStatus = async () => {
    try {
      const response = await axios.get(`${API}/api/backup-cloud/notifications/status`);
      setNotifStatus(response.data);
      if (response.data.config) {
        setNotifConfig({
          ...notifConfig,
          ...response.data.config
        });
      }
    } catch (error) {
      console.error("Error loading notification status:", error);
    }
  };

  const loadResendStatus = async () => {
    try {
      const response = await axios.get(`${API}/api/backup-cloud/resend/status`);
      setResendStatus(response.data);
    } catch (error) {
      console.error("Error loading Resend status:", error);
    }
  };

  const saveResendApiKey = async () => {
    if (!resendApiKey || !resendApiKey.startsWith("re_")) {
      toast.error("La clé API doit commencer par 're_'");
      return;
    }
    setSavingApiKey(true);
    try {
      const response = await axios.post(`${API}/api/backup-cloud/resend/configure`, {
        api_key: resendApiKey
      });
      if (response.data.success) {
        toast.success("Clé API Resend sauvegardée!");
        setResendApiKey("");
        loadResendStatus();
        loadNotificationStatus();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur de sauvegarde");
    }
    setSavingApiKey(false);
  };

  const loadAtlasGuide = async () => {
    try {
      const response = await axios.get(`${API}/api/backup-cloud/guides/mongodb-atlas`);
      setAtlasGuide(response.data);
      setShowAtlasGuide(true);
    } catch (error) {
      toast.error("Erreur lors du chargement du guide");
    }
  };

  const loadGcsGuide = async () => {
    try {
      const response = await axios.get(`${API}/api/backup-cloud/guides/google-cloud-storage`);
      setGcsGuide(response.data);
      setShowGcsGuide(true);
    } catch (error) {
      toast.error("Erreur lors du chargement du guide");
    }
  };

  useEffect(() => {
    loadStats();
    loadAtlasStatus();
    loadGcsStatus();
    loadZipInfo();
    loadScheduleStatus();
    loadLogs();
    loadNotificationStatus();
    loadResendStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadZipInfo();
      loadScheduleStatus();
      loadLogs();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Actions
  const configureAtlas = async () => {
    if (!atlasConfig.connection_string) {
      toast.error("Veuillez entrer la connection string");
      return;
    }
    
    try {
      const response = await axios.post(`${API}/api/backup-cloud/atlas/configure`, atlasConfig);
      if (response.data.success) {
        toast.success("MongoDB Atlas configuré!");
        loadAtlasStatus();
        loadStats();
      } else {
        toast.error(response.data.message || "Erreur de configuration");
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur de connexion");
    }
  };

  const syncToAtlas = async () => {
    setAtlasSyncing(true);
    try {
      const response = await axios.post(`${API}/api/backup-cloud/atlas/sync`);
      if (response.data.success) {
        toast.success(`${response.data.total_documents} documents synchronisés!`);
        loadStats();
        loadLogs();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur de synchronisation");
    }
    setAtlasSyncing(false);
  };

  const configureGcs = async () => {
    if (!gcsConfig.project_id || !gcsConfig.bucket_name || !gcsConfig.credentials_json) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    try {
      const response = await axios.post(`${API}/api/backup-cloud/gcs/configure`, gcsConfig);
      if (response.data.success) {
        toast.success("Google Cloud Storage configuré!");
        loadGcsStatus();
        loadStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur de configuration");
    }
  };

  const uploadToGcs = async () => {
    setGcsUploading(true);
    try {
      const response = await axios.post(`${API}/api/backup-cloud/gcs/upload`);
      if (response.data.success) {
        toast.success(`Backup uploadé: ${response.data.blob_name}`);
        loadStats();
        loadLogs();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur d'upload");
    }
    setGcsUploading(false);
  };

  const createZip = async () => {
    setZipCreating(true);
    try {
      const response = await axios.post(`${API}/api/backup-cloud/zip/update`);
      if (response.data.success) {
        toast.success("Backup ZIP mis à jour!");
        loadZipInfo();
        loadStats();
      }
    } catch (error) {
      toast.error("Erreur lors de la création du ZIP");
    }
    setZipCreating(false);
  };

  const downloadZip = () => {
    if (zipInfo?.download_url) {
      window.open(`${API}${zipInfo.download_url}`, '_blank');
    }
  };

  // Notification actions
  const configureNotifications = async () => {
    if (!notifConfig.recipient_email) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }
    try {
      const response = await axios.post(`${API}/api/backup-cloud/notifications/configure`, notifConfig);
      if (response.data.success) {
        toast.success("Notifications configurées!");
        loadNotificationStatus();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur de configuration");
    }
  };

  const sendTestEmail = async () => {
    setSendingTest(true);
    try {
      const response = await axios.post(`${API}/api/backup-cloud/notifications/test`);
      if (response.data.success) {
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur d'envoi");
    }
    setSendingTest(false);
  };

  const sendDailySummary = async () => {
    setSendingSummary(true);
    try {
      const response = await axios.post(`${API}/api/backup-cloud/notifications/send-summary`);
      if (response.data.success) {
        toast.success("Résumé envoyé!");
        loadLogs();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur d'envoi");
    }
    setSendingSummary(false);
  };

  const toggleAutoBackup = async (enabled) => {
    try {
      if (enabled) {
        const response = await axios.post(`${API}/api/backup-cloud/schedule/start`, {
          ...scheduleConfig,
          enabled: true
        });
        if (response.data.success) {
          toast.success("Backup automatique démarré!");
        }
      } else {
        const response = await axios.post(`${API}/api/backup-cloud/schedule/stop`);
        if (response.data.success) {
          toast.success("Backup automatique arrêté");
        }
      }
      loadScheduleStatus();
    } catch (error) {
      toast.error("Erreur");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#f5a623]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Database className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-400">MongoDB Atlas</p>
                <p className="text-xs text-gray-400">
                  {atlasStatus?.configured ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Connecté
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> Non configuré
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Cloud className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-400">Google Cloud</p>
                <p className="text-xs text-gray-400">
                  {gcsStatus?.configured ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Configuré
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> Non configuré
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Archive className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-400">ZIP Backup</p>
                <p className="text-xs text-gray-400">
                  {zipInfo?.exists ? formatBytes(zipInfo.size_bytes) : "Non créé"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Timer className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-400">Auto Backup</p>
                <p className="text-xs text-gray-400">
                  {scheduleStatus?.running ? (
                    <span className="flex items-center gap-1 text-green-400">
                      <Zap className="h-3 w-3" /> Actif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Square className="h-3 w-3" /> Inactif
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 bg-card">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#f5a623] data-[state=active]:text-black">
            <Settings className="h-4 w-4 mr-2" />
            Vue d&apos;ensemble
          </TabsTrigger>
          <TabsTrigger value="atlas" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            <Database className="h-4 w-4 mr-2" />
            MongoDB Atlas
          </TabsTrigger>
          <TabsTrigger value="gcs" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Cloud className="h-4 w-4 mr-2" />
            Google Cloud
          </TabsTrigger>
          <TabsTrigger value="zip" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <Archive className="h-4 w-4 mr-2" />
            ZIP Export
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Timer className="h-4 w-4 mr-2" />
            Auto Backup
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
            <Mail className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-white">Résumé des Backups</CardTitle>
              <CardDescription>État actuel de tous les systèmes de sauvegarde</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={createZip} 
                  disabled={zipCreating}
                  className="bg-purple-600 hover:bg-purple-700 h-16"
                >
                  {zipCreating ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Archive className="h-5 w-5 mr-2" />}
                  <div className="text-left">
                    <p className="font-semibold">Créer ZIP</p>
                    <p className="text-xs opacity-80">Backup complet</p>
                  </div>
                </Button>
                
                <Button 
                  onClick={syncToAtlas} 
                  disabled={atlasSyncing || !atlasStatus?.configured}
                  className="bg-green-600 hover:bg-green-700 h-16"
                >
                  {atlasSyncing ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Database className="h-5 w-5 mr-2" />}
                  <div className="text-left">
                    <p className="font-semibold">Sync Atlas</p>
                    <p className="text-xs opacity-80">MongoDB Cloud</p>
                  </div>
                </Button>
                
                <Button 
                  onClick={uploadToGcs} 
                  disabled={gcsUploading || !gcsStatus?.configured}
                  className="bg-blue-600 hover:bg-blue-700 h-16"
                >
                  {gcsUploading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Cloud className="h-5 w-5 mr-2" />}
                  <div className="text-left">
                    <p className="font-semibold">Upload GCS</p>
                    <p className="text-xs opacity-80">Google Cloud</p>
                  </div>
                </Button>
              </div>

              {/* Download ZIP */}
              {zipInfo?.exists && (
                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FolderArchive className="h-8 w-8 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">HUNTIQ_BACKUP.zip</p>
                        <p className="text-sm text-gray-400">
                          {formatBytes(zipInfo.size_bytes)} • Mis à jour: {formatDate(zipInfo.modified_at)}
                        </p>
                      </div>
                    </div>
                    <Button onClick={downloadZip} className="bg-purple-600 hover:bg-purple-700">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Téléchargez ce fichier et placez-le dans votre dossier Bureau &gt; BIONIC APPS &gt; Backup HUNTIQ
                  </p>
                </div>
              )}

              {/* Recent Logs */}
              <div className="mt-6">
                <h4 className="text-white font-medium mb-3">Activité récente</h4>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {logs.map((log, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-background rounded-lg">
                        {log.status === "success" ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-white">{log.type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-gray-500">{formatDate(log.timestamp)}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {log.type.split('_')[0]}
                        </Badge>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MongoDB Atlas Tab */}
        <TabsContent value="atlas" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-400" />
                    MongoDB Atlas
                  </CardTitle>
                  <CardDescription>Réplication automatique vers le cloud MongoDB</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadAtlasGuide}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Guide de configuration
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {atlasStatus?.configured ? (
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                    <div>
                      <p className="text-green-400 font-medium">Connecté à MongoDB Atlas</p>
                      <p className="text-sm text-gray-400">Database: {atlasStatus.database}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={syncToAtlas} disabled={atlasSyncing} className="bg-green-600">
                      {atlasSyncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                      Synchroniser maintenant
                    </Button>
                    <Button variant="outline" onClick={loadAtlasStatus}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualiser
                    </Button>
                  </div>
                  {atlasStatus.last_backup && (
                    <p className="text-xs text-gray-500 mt-2">
                      Dernière sync: {formatDate(atlasStatus.last_backup)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-medium">Configuration requise</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Configurez votre connexion MongoDB Atlas pour activer la réplication automatique
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label>Connection String MongoDB Atlas</Label>
                      <Input
                        type="password"
                        placeholder="mongodb+srv://user:password@cluster.mongodb.net/..."
                        value={atlasConfig.connection_string}
                        onChange={(e) => setAtlasConfig({...atlasConfig, connection_string: e.target.value})}
                        className="mt-1 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <Label>Nom de la base de données</Label>
                      <Input
                        placeholder="huntiq_backup"
                        value={atlasConfig.database_name}
                        onChange={(e) => setAtlasConfig({...atlasConfig, database_name: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={configureAtlas} className="bg-green-600 hover:bg-green-700">
                      <Database className="h-4 w-4 mr-2" />
                      Configurer MongoDB Atlas
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Cloud Storage Tab */}
        <TabsContent value="gcs" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-blue-400" />
                    Google Cloud Storage
                  </CardTitle>
                  <CardDescription>Stockage sécurisé dans le cloud Google</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadGcsGuide}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Guide de configuration
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {gcsStatus?.configured ? (
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-6 w-6 text-blue-400" />
                    <div>
                      <p className="text-blue-400 font-medium">Google Cloud Storage configuré</p>
                      <p className="text-sm text-gray-400">Bucket: {gcsStatus.bucket_name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={uploadToGcs} disabled={gcsUploading} className="bg-blue-600">
                      {gcsUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                      Uploader backup
                    </Button>
                    <Button variant="outline" onClick={loadGcsStatus}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualiser
                    </Button>
                  </div>
                  {gcsStatus.last_backup && (
                    <p className="text-xs text-gray-500 mt-2">
                      Dernier upload: {formatDate(gcsStatus.last_backup)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-medium">Configuration requise</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Configurez votre bucket Google Cloud Storage
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label>Project ID</Label>
                      <Input
                        placeholder="my-project-123456"
                        value={gcsConfig.project_id}
                        onChange={(e) => setGcsConfig({...gcsConfig, project_id: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Nom du Bucket</Label>
                      <Input
                        placeholder="huntiq-backup-bucket"
                        value={gcsConfig.bucket_name}
                        onChange={(e) => setGcsConfig({...gcsConfig, bucket_name: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Credentials JSON (Service Account Key)</Label>
                      <Textarea
                        placeholder='{"type": "service_account", "project_id": "...", ...}'
                        value={gcsConfig.credentials_json}
                        onChange={(e) => setGcsConfig({...gcsConfig, credentials_json: e.target.value})}
                        className="mt-1 font-mono text-xs h-32"
                      />
                    </div>
                    <Button onClick={configureGcs} className="bg-blue-600 hover:bg-blue-700">
                      <Cloud className="h-4 w-4 mr-2" />
                      Configurer Google Cloud Storage
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ZIP Export Tab */}
        <TabsContent value="zip" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Archive className="h-5 w-5 text-purple-400" />
                Export ZIP - HUNTIQ Backup
              </CardTitle>
              <CardDescription>
                Téléchargez une archive complète de votre code et base de données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current ZIP Info */}
              {zipInfo?.exists ? (
                <div className="bg-purple-500/10 rounded-lg p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <FolderArchive className="h-8 w-8 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white">HUNTIQ_BACKUP.zip</p>
                        <p className="text-gray-400">{formatBytes(zipInfo.size_bytes)}</p>
                        <p className="text-sm text-gray-500">
                          Dernière mise à jour: {formatDate(zipInfo.modified_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button onClick={downloadZip} size="lg" className="bg-purple-600 hover:bg-purple-700">
                        <Download className="h-5 w-5 mr-2" />
                        Télécharger pour Bureau
                      </Button>
                      <Button onClick={createZip} variant="outline" disabled={zipCreating}>
                        {zipCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                        Mettre à jour
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-background rounded-lg p-4 mt-4">
                    <h4 className="text-white font-medium mb-2">📁 Instructions pour votre Bureau</h4>
                    <ol className="text-sm text-gray-400 space-y-2">
                      <li>1. Cliquez sur <strong>"Télécharger pour Bureau"</strong></li>
                      <li>2. Créez un dossier <code className="bg-gray-800 px-1 rounded">Bureau/BIONIC APPS/Backup HUNTIQ</code></li>
                      <li>3. Déplacez le fichier ZIP téléchargé dans ce dossier</li>
                      <li>4. Activez le backup automatique pour des mises à jour régulières</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Archive className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Aucun backup ZIP créé</p>
                  <Button onClick={createZip} disabled={zipCreating} className="bg-purple-600">
                    {zipCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Archive className="h-4 w-4 mr-2" />}
                    Créer le premier backup
                  </Button>
                </div>
              )}

              {/* Contents Info */}
              <Card className="bg-background">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Contenu du backup</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Backend (Python/FastAPI)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-gray-300">Frontend (React/JSX)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-gray-300">MongoDB Export (JSON)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-orange-400" />
                      <span className="text-sm text-gray-300">Configuration & Metadata</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto Backup Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Timer className="h-5 w-5 text-orange-400" />
                Backup Automatique
              </CardTitle>
              <CardDescription>
                Mise à jour automatique du ZIP toutes les minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status */}
              <div className={`rounded-lg p-4 border ${scheduleStatus?.running ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-500/10 border-gray-500/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {scheduleStatus?.running ? (
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-green-400 animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-500/20 flex items-center justify-center">
                        <Square className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className={`font-medium ${scheduleStatus?.running ? 'text-green-400' : 'text-gray-400'}`}>
                        {scheduleStatus?.running ? 'Backup automatique actif' : 'Backup automatique inactif'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {scheduleStatus?.running ? 
                          `Mise à jour toutes les ${scheduleConfig.zip_interval_minutes} minute(s)` : 
                          'Cliquez pour activer'
                        }
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={scheduleStatus?.running || false}
                    onCheckedChange={toggleAutoBackup}
                  />
                </div>
                
                {scheduleStatus?.last_zip_update && (
                  <p className="text-xs text-gray-500 mt-3">
                    Dernière mise à jour: {formatDate(scheduleStatus.last_zip_update)} ({formatBytes(scheduleStatus.last_zip_size)})
                  </p>
                )}
              </div>

              {/* Configuration */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Configuration</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Intervalle ZIP (minutes)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={scheduleConfig.zip_interval_minutes}
                      onChange={(e) => setScheduleConfig({...scheduleConfig, zip_interval_minutes: parseInt(e.target.value) || 1})}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Mise à jour du fichier ZIP</p>
                  </div>
                  
                  <div>
                    <Label>Intervalle Atlas (minutes)</Label>
                    <Input
                      type="number"
                      min="5"
                      value={scheduleConfig.atlas_interval_minutes}
                      onChange={(e) => setScheduleConfig({...scheduleConfig, atlas_interval_minutes: parseInt(e.target.value) || 60})}
                      className="mt-1"
                      disabled={!atlasStatus?.configured}
                    />
                    <p className="text-xs text-gray-500 mt-1">Sync MongoDB Atlas</p>
                  </div>
                  
                  <div>
                    <Label>Intervalle GCS (minutes)</Label>
                    <Input
                      type="number"
                      min="5"
                      value={scheduleConfig.gcs_interval_minutes}
                      onChange={(e) => setScheduleConfig({...scheduleConfig, gcs_interval_minutes: parseInt(e.target.value) || 60})}
                      className="mt-1"
                      disabled={!gcsStatus?.configured}
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload Google Cloud</p>
                  </div>
                </div>

                {!scheduleStatus?.running && (
                  <Button 
                    onClick={() => toggleAutoBackup(true)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Démarrer le backup automatique
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="h-5 w-5 text-pink-400" />
                Notifications par Email
              </CardTitle>
              <CardDescription>
                Recevez un résumé quotidien de vos backups via Resend
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status */}
              {notifStatus?.configured ? (
                <div className="bg-pink-500/10 rounded-lg p-4 border border-pink-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-pink-400" />
                      <div>
                        <p className="text-pink-400 font-medium">Notifications configurées</p>
                        <p className="text-sm text-gray-400">{notifStatus.config?.recipient_email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={sendTestEmail} 
                        disabled={sendingTest}
                        variant="outline"
                        size="sm"
                      >
                        {sendingTest ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                        Test
                      </Button>
                      <Button 
                        onClick={sendDailySummary} 
                        disabled={sendingSummary}
                        className="bg-pink-600 hover:bg-pink-700"
                        size="sm"
                      >
                        {sendingSummary ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                        Envoyer résumé
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Configuration requise</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Configurez votre email pour recevoir les résumés quotidiens
                  </p>
                </div>
              )}

              {/* Resend API Status */}
              <div className={`rounded-lg p-3 ${notifStatus?.resend_available ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                <div className="flex items-center gap-2">
                  {notifStatus?.resend_available ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-green-400">Resend API configurée</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-red-400">Resend API non configurée - Ajoutez RESEND_API_KEY dans .env</span>
                    </>
                  )}
                </div>
              </div>

              {/* Configuration Form */}
              <div className="space-y-4">
                <div>
                  <Label>Email de destination</Label>
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={notifConfig.recipient_email}
                    onChange={(e) => setNotifConfig({...notifConfig, recipient_email: e.target.value})}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div>
                      <p className="text-white text-sm">Résumé quotidien</p>
                      <p className="text-xs text-gray-500">1 email/jour avec le statut</p>
                    </div>
                    <Switch
                      checked={notifConfig.send_daily_summary}
                      onCheckedChange={(v) => setNotifConfig({...notifConfig, send_daily_summary: v})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div>
                      <p className="text-white text-sm">Alertes d&apos;échec</p>
                      <p className="text-xs text-gray-500">Notification immédiate en cas d&apos;erreur</p>
                    </div>
                    <Switch
                      checked={notifConfig.send_on_failure}
                      onCheckedChange={(v) => setNotifConfig({...notifConfig, send_on_failure: v})}
                    />
                  </div>
                </div>

                <div>
                  <Label>Heure d&apos;envoi du résumé</Label>
                  <select
                    value={notifConfig.summary_hour}
                    onChange={(e) => setNotifConfig({...notifConfig, summary_hour: parseInt(e.target.value)})}
                    className="mt-1 w-full p-2 bg-background border border-border rounded-md text-white"
                  >
                    {Array.from({length: 24}, (_, i) => (
                      <option key={i} value={i}>{i}:00</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Heure UTC pour l&apos;envoi automatique</p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={notifConfig.enabled}
                    onCheckedChange={(v) => setNotifConfig({...notifConfig, enabled: v})}
                  />
                  <Label>Activer les notifications</Label>
                </div>

                <Button onClick={configureNotifications} className="bg-pink-600 hover:bg-pink-700">
                  <Bell className="h-4 w-4 mr-2" />
                  Enregistrer la configuration
                </Button>
              </div>

              {/* Setup Guide */}
              <div className="bg-background rounded-lg p-4 mt-6">
                <h4 className="text-white font-medium mb-3">📧 Configuration Resend</h4>
                <ol className="text-sm text-gray-400 space-y-2">
                  <li>1. Créez un compte sur <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">resend.com</a></li>
                  <li>2. Allez dans Dashboard → API Keys → Create API Key</li>
                  <li>3. Copiez la clé (commence par <code className="bg-gray-800 px-1 rounded">re_...</code>)</li>
                  <li>4. Ajoutez dans <code className="bg-gray-800 px-1 rounded">/app/backend/.env</code>:</li>
                  <li className="ml-4"><code className="bg-gray-800 px-2 py-1 rounded block mt-1">RESEND_API_KEY=re_votre_cle_ici</code></li>
                  <li>5. Redémarrez le backend</li>
                </ol>
                <p className="text-xs text-gray-500 mt-3">
                  💡 Resend offre 3000 emails/mois gratuits
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Atlas Guide Modal */}
      <Dialog open={showAtlasGuide} onOpenChange={setShowAtlasGuide}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-400" />
              {atlasGuide?.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4 pr-4">
              {atlasGuide?.steps?.map((step) => (
                <div key={step.step} className="bg-background rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-600">{step.step}</Badge>
                    <h4 className="text-white font-medium">{step.title}</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{step.description}</p>
                  {step.url && (
                    <a href={step.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Ouvrir
                    </a>
                  )}
                  {step.details && (
                    <ul className="list-disc list-inside text-sm text-gray-500 mt-2">
                      {step.details.map((detail, i) => (
                        <li key={i}>{detail}</li>
                      ))}
                    </ul>
                  )}
                  {step.warning && (
                    <p className="text-yellow-400 text-xs mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> {step.warning}
                    </p>
                  )}
                  {step.format && (
                    <div className="mt-2">
                      <code className="text-xs bg-gray-800 p-2 rounded block text-green-400">{step.format}</code>
                    </div>
                  )}
                </div>
              ))}
              {atlasGuide?.example_connection_string && (
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                  <p className="text-sm text-gray-400 mb-2">Exemple de connection string:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-800 p-2 rounded flex-1 text-green-400 overflow-auto">
                      {atlasGuide.example_connection_string}
                    </code>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(atlasGuide.example_connection_string)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* GCS Guide Modal */}
      <Dialog open={showGcsGuide} onOpenChange={setShowGcsGuide}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-400" />
              {gcsGuide?.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4 pr-4">
              {gcsGuide?.steps?.map((step) => (
                <div key={step.step} className="bg-background rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-600">{step.step}</Badge>
                    <h4 className="text-white font-medium">{step.title}</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{step.description}</p>
                  {step.url && (
                    <a href={step.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Ouvrir
                    </a>
                  )}
                  {step.details && (
                    <ul className="list-disc list-inside text-sm text-gray-500 mt-2">
                      {step.details.map((detail, i) => (
                        <li key={i}>{detail}</li>
                      ))}
                    </ul>
                  )}
                  {step.note && (
                    <p className="text-green-400 text-xs mt-2">💡 {step.note}</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CloudBackupManager;
