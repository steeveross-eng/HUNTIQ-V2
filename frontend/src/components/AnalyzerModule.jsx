// AnalyzerModule.jsx - Module Click & Analyse Intelligent avec boutons sticky
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FlaskConical, 
  Search,
  FileText,
  Award,
  Star,
  DollarSign,
  Droplet,
  Leaf,
  Shield,
  Clock,
  CloudRain,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Mail,
  Download,
  Loader2,
  ChevronRight,
  Info,
  Users,
  Edit,
  ArrowLeft,
  Home,
  Building2,
  MapPin,
  Tent,
  RefreshCw,
  BookOpen,
  Sparkles,
  Target,
  ShoppingCart,
  GitCompare,
  Zap,
  TrendingUp,
  ArrowRight,
  ScanLine
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
import TerritoryInventory from './TerritoryInventory';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Get session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('scent_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('scent_session_id', sessionId);
  }
  return sessionId;
};

// Pastille Component
const Pastille = ({ type, label, size = "normal" }) => {
  const colors = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500"
  };
  const icons = {
    green: "🟢",
    yellow: "🟡",
    red: "🔴"
  };
  
  return (
    <div className={`flex items-center gap-2 ${size === "large" ? "scale-125" : ""}`}>
      <span className={size === "large" ? "text-3xl" : "text-2xl"}>{icons[type]}</span>
      <span className={`px-3 py-1 rounded-full text-white font-semibold ${colors[type]} ${size === "large" ? "text-lg" : ""}`}>
        {label}
      </span>
    </div>
  );
};

// Score Gauge Component
const ScoreGauge = ({ score, maxScore = 10, size = "normal" }) => {
  const percentage = (score / maxScore) * 100;
  const color = score >= 7.5 ? "bg-green-500" : score >= 5 ? "bg-yellow-500" : "bg-red-500";
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className={`font-bold text-white ${size === "large" ? "text-5xl" : "text-4xl"}`}>{score}</span>
        <span className="text-gray-400">/ {maxScore}</span>
      </div>
      <Progress value={percentage} className={`${size === "large" ? "h-4" : "h-3"} ${color}`} />
    </div>
  );
};

// Client Profile Management
const CLIENT_PROFILE_KEY = 'scent_client_profile';

const getClientProfile = () => {
  try {
    const profile = localStorage.getItem(CLIENT_PROFILE_KEY);
    return profile ? JSON.parse(profile) : null;
  } catch {
    return null;
  }
};

const saveClientProfile = (profile) => {
  try {
    const existingProfile = getClientProfile() || {};
    const updatedProfile = {
      ...existingProfile,
      ...profile,
      lastUpdated: new Date().toISOString(),
      visitCount: (existingProfile.visitCount || 0) + 1
    };
    localStorage.setItem(CLIENT_PROFILE_KEY, JSON.stringify(updatedProfile));
    return updatedProfile;
  } catch {
    return null;
  }
};

// ============================================
// STICKY SIDEBAR BUTTONS COMPONENT - Enhanced
// ============================================
const StickySidebarButtons = ({ 
  onAnalyzeClick, 
  onCompareClick, 
  isAnalyzing, 
  hasDetectedProduct,
  detectedProduct 
}) => {
  const [analyzeClicked, setAnalyzeClicked] = useState(false);
  const [compareClicked, setCompareClicked] = useState(false);

  const handleAnalyzeClick = () => {
    setAnalyzeClicked(true);
    setTimeout(() => setAnalyzeClicked(false), 300);
    onAnalyzeClick();
  };

  const handleCompareClick = () => {
    setCompareClicked(true);
    setTimeout(() => setCompareClicked(false), 300);
    onCompareClick();
  };

  return (
    <>
      {/* Desktop Sidebar - Right side */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-4 pr-2">
        {/* ANALYSER Button */}
        <button
          onClick={handleAnalyzeClick}
          disabled={isAnalyzing}
          className={`group relative flex flex-col items-center justify-center transition-all duration-300 shadow-2xl
            ${analyzeClicked ? 'scale-90' : 'hover:scale-105'}
            ${hasDetectedProduct ? 'animate-pulse hover:animate-none' : ''}
            w-24 h-36 rounded-l-2xl
            bg-gradient-to-b from-[#f5a623] to-[#d4850e] hover:from-[#f7c857] hover:to-[#f5a623]
          `}
          style={{
            boxShadow: hasDetectedProduct 
              ? '0 0 30px rgba(245, 166, 35, 0.5), -5px 0 20px rgba(245, 166, 35, 0.3)' 
              : '-5px 0 20px rgba(245, 166, 35, 0.2)'
          }}
          data-testid="sticky-analyze-btn"
        >
          {/* Glow indicator */}
          <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-16 rounded-l-full transition-all duration-300 ${
            hasDetectedProduct ? 'bg-[#f7c857] opacity-100' : 'bg-[#f5a623] opacity-50 group-hover:opacity-100'
          }`} />
          
          {/* Icon */}
          {isAnalyzing ? (
            <Loader2 className="h-10 w-10 text-black animate-spin" />
          ) : (
            <FlaskConical className={`h-10 w-10 text-black transition-transform duration-300 ${
              analyzeClicked ? 'scale-125' : 'group-hover:scale-110'
            }`} />
          )}
          
          {/* Text */}
          <span className="text-black font-black text-sm mt-3 tracking-wide text-center leading-tight">
            {isAnalyzing ? "EN COURS..." : "ANALYSER"}
          </span>
          
          {/* Ready indicator */}
          {hasDetectedProduct && !isAnalyzing && (
            <div className="absolute -top-2 -left-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Zap className="h-4 w-4 text-black" />
            </div>
          )}
        </button>

        {/* COMPARER Button */}
        <button
          onClick={handleCompareClick}
          className={`group relative flex flex-col items-center justify-center transition-all duration-300 shadow-2xl
            ${compareClicked ? 'scale-90' : 'hover:scale-105'}
            w-24 h-36 rounded-l-2xl
            bg-gradient-to-b from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800
          `}
          style={{
            boxShadow: '-5px 0 20px rgba(59, 130, 246, 0.2)'
          }}
          data-testid="sticky-compare-btn"
        >
          {/* Glow indicator */}
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-16 bg-blue-500 rounded-l-full opacity-50 group-hover:opacity-100 transition-opacity" />
          
          {/* Icon - Balance/Scale */}
          <svg 
            className={`h-10 w-10 text-white transition-transform duration-300 ${
              compareClicked ? 'scale-125' : 'group-hover:scale-110'
            }`}
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 3v18" />
            <path d="M4 9l4-6 4 6" />
            <path d="M12 9l4-6 4 6" />
            <circle cx="6" cy="9" r="2" />
            <circle cx="18" cy="9" r="2" />
            <path d="M4 9h4" />
            <path d="M16 9h4" />
          </svg>
          
          {/* Text */}
          <span className="text-white font-black text-sm mt-3 tracking-wide text-center leading-tight">
            COMPARER
          </span>
        </button>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 md:hidden bg-black/95 backdrop-blur-lg border-t border-white/10 p-3">
        <div className="flex gap-3 max-w-lg mx-auto">
          {/* ANALYSER Button - Mobile */}
          <button
            onClick={handleAnalyzeClick}
            disabled={isAnalyzing}
            className={`flex-1 relative flex items-center justify-center gap-2 py-4 rounded-xl font-black text-black transition-all duration-300
              ${analyzeClicked ? 'scale-95' : 'active:scale-95'}
              ${hasDetectedProduct ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}
              bg-gradient-to-r from-[#f5a623] to-[#d4850e]
            `}
            style={{
              boxShadow: hasDetectedProduct 
                ? '0 4px 20px rgba(245, 166, 35, 0.4)' 
                : '0 4px 15px rgba(245, 166, 35, 0.2)'
            }}
          >
            {isAnalyzing ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <FlaskConical className="h-6 w-6" />
            )}
            <span className="text-sm tracking-wide">
              {isAnalyzing ? "ANALYSE..." : "ANALYSER"}
            </span>
            {hasDetectedProduct && !isAnalyzing && (
              <Zap className="h-4 w-4 text-white absolute -top-1 -right-1 animate-pulse" />
            )}
          </button>

          {/* COMPARER Button - Mobile */}
          <button
            onClick={handleCompareClick}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-white transition-all duration-300
              ${compareClicked ? 'scale-95' : 'active:scale-95'}
              bg-gradient-to-r from-blue-700 to-blue-800
            `}
            style={{
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)'
            }}
          >
            <GitCompare className="h-6 w-6" />
            <span className="text-sm tracking-wide">COMPARER</span>
          </button>
        </div>
      </div>
    </>
  );
};

// ============================================
// PRODUCT RESULT CARD - Enhanced for conversion
// ============================================
const ProductResultCard = ({ product, rank, isAnalyzed = false, isBionic = false }) => {
  const pastilleType = product.score >= 75 ? "gold" : product.score >= 50 ? "yellow" : "red";
  
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
      isBionic 
        ? "bg-gradient-to-br from-[#f5a623]/20 to-transparent border-2 border-[#f5a623] shadow-[0_0_30px_rgba(245,166,35,0.3)]" 
        : isAnalyzed 
          ? "bg-gradient-to-br from-blue-500/10 to-transparent border-2 border-blue-500"
          : "bg-card border-border"
    }`}>
      {/* Rank Badge */}
      <div className={`absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
        isBionic ? "bg-[#f5a623] text-black" : isAnalyzed ? "bg-blue-500 text-white" : "bg-gray-700 text-white"
      }`}>
        #{rank}
      </div>

      {/* Special Badges */}
      {isBionic && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-[#f5a623] text-black font-bold px-3 py-1 animate-pulse">
            <Award className="h-4 w-4 mr-1" /> RECOMMANDÉ
          </Badge>
        </div>
      )}
      {isAnalyzed && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-blue-500 text-white font-bold px-3 py-1">
            <Target className="h-4 w-4 mr-1" /> ANALYSÉ
          </Badge>
        </div>
      )}

      <CardContent className="pt-16 pb-6 px-6">
        {/* Product Image */}
        <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden bg-black/20">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          {/* Score Overlay */}
          <div className={`absolute bottom-2 right-2 px-3 py-1 rounded-full font-bold text-sm ${
            pastilleType === "gold" ? "bg-[#f5a623] text-black" :
            pastilleType === "yellow" ? "bg-yellow-500 text-black" :
            "bg-red-500 text-white"
          }`}>
            {product.score}/100
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          <div>
            <p className="text-[#f5a623] text-sm font-medium">{product.brand}</p>
            <h3 className="text-white font-bold text-lg leading-tight">{product.name}</h3>
          </div>

          {/* Price Section */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">${product.price}</span>
            {product.price_with_shipping && (
              <span className="text-sm text-gray-400">
                (${product.price_with_shipping} avec transport)
              </span>
            )}
          </div>

          {/* Advantages */}
          {product.advantages && product.advantages.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-border">
              {product.advantages.slice(0, 4).map((adv, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${isBionic ? "text-[#f5a623]" : "text-green-500"}`} />
                  <span className="text-gray-300">{adv}</span>
                </div>
              ))}
            </div>
          )}

          {/* Category Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.rainproof && <Badge variant="outline" className="text-cyan-400 border-cyan-400"><CloudRain className="h-3 w-3 mr-1" />Rainproof</Badge>}
            {product.certified && <Badge variant="outline" className="text-green-400 border-green-400"><Shield className="h-3 w-3 mr-1" />Certifié</Badge>}
            {product.attraction_days && (
              <Badge variant="outline" className="text-purple-400 border-purple-400">
                <Clock className="h-3 w-3 mr-1" />{product.attraction_days}j
              </Badge>
            )}
          </div>

          {/* CTA Button */}
          <Button 
            className={`w-full mt-4 font-bold text-lg h-14 transition-all duration-300 ${
              isBionic 
                ? "bg-gradient-to-r from-[#f5a623] to-[#d4850e] hover:from-[#d4850e] hover:to-[#f5a623] text-black shadow-lg hover:shadow-[#f5a623]/50" 
                : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white"
            } group`}
            onClick={() => product.buy_link && window.open(product.buy_link, '_blank')}
            data-testid={`order-btn-${rank}`}
          >
            <ShoppingCart className="h-5 w-5 mr-2 group-hover:animate-bounce" />
            COMMANDER
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// COMPARISON TABLE (Enhanced)
// ============================================
const ComparisonTable = ({ comparison }) => {
  if (!comparison) return null;
  
  const { bionic_product, competitor_1, competitor_2, comparison_table } = comparison;
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-gray-400 w-1/4">Critère</TableHead>
            <TableHead className="text-center bg-green-500/5 border-l-2 border-r-2 border-[#f5a623]">
              <div className="space-y-2">
                <img src={bionic_product.image_url} alt={bionic_product.name} className="w-16 h-16 object-cover rounded-lg mx-auto border-2 border-[#f5a623]" />
                <p className="font-bold text-[#f5a623]">{bionic_product.name}</p>
                <Badge className="bg-[#f5a623]/20 text-[#f5a623]">Profil scientifique complet</Badge>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="space-y-2">
                <img src={competitor_1.image_url} alt={competitor_1.name} className="w-16 h-16 object-cover rounded-lg mx-auto" />
                <p className="font-semibold text-white">{competitor_1.name}</p>
                <Badge variant="outline">{competitor_1.brand}</Badge>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="space-y-2">
                <img src={competitor_2.image_url} alt={competitor_2.name} className="w-16 h-16 object-cover rounded-lg mx-auto" />
                <p className="font-semibold text-white">{competitor_2.name}</p>
                <Badge variant="outline">{competitor_2.brand}</Badge>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comparison_table.map((row, index) => (
            <TableRow key={index} className="border-border">
              <TableCell className="font-medium text-gray-300">{row.criterion}</TableCell>
              <TableCell className="text-center bg-green-500/5 border-l-2 border-r-2 border-[#f5a623] font-bold text-white">
                {row.bionic}
              </TableCell>
              <TableCell className="text-center text-gray-300">{row.competitor_1}</TableCell>
              <TableCell className="text-center text-gray-300">{row.competitor_2}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ============================================
// EMAIL CONSENT MODAL
// ============================================
const EmailConsentModal = ({ isOpen, onClose, reportId, onSubmit }) => {
  // Initialize form data from saved profile
  const initializeFormData = () => {
    const savedProfile = getClientProfile();
    return {
      name: savedProfile?.name || "",
      email: savedProfile?.email || "",
      region: savedProfile?.region || "",
      phone: savedProfile?.phone || "",
      consent: false,
      rememberMe: true
    };
  };
  
  const [formData, setFormData] = useState(initializeFormData);
  const [loading, setLoading] = useState(false);
  
  // Check if returning user based on saved profile
  const savedProfile = getClientProfile();
  const isReturningUser = !!savedProfile?.name;
  
  const handleSubmit = async () => {
    if (!formData.consent) {
      toast.error("Veuillez accepter les conditions");
      return;
    }
    
    if (!formData.name || !formData.email) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    
    setLoading(true);
    try {
      if (formData.rememberMe) {
        saveClientProfile({
          name: formData.name,
          email: formData.email,
          region: formData.region,
          phone: formData.phone
        });
      }
      
      await axios.post(`${API}/analyze/consent`, {
        name: formData.name,
        email: formData.email,
        region: formData.region,
        consent_marketing: true,
        consent_statistics: true,
        report_id: reportId
      });
      
      toast.success("Rapport envoyé à votre adresse email!");
      onSubmit();
      onClose();
    } catch (error) {
      toast.error("Erreur lors de l'envoi");
    }
    setLoading(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#f5a623]" />
            Recevoir votre rapport
          </DialogTitle>
          <DialogDescription>
            {isReturningUser 
              ? "Vos informations ont été reconnues automatiquement."
              : "Entrez vos coordonnées pour recevoir le rapport complet."
            }
          </DialogDescription>
        </DialogHeader>
        
        {isReturningUser && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-green-400 font-medium text-sm">Bienvenue de retour!</p>
              <p className="text-gray-400 text-xs">Informations pré-remplies.</p>
            </div>
          </div>
        )}
        
        <div className="space-y-4 py-4">
          <div>
            <Label>Nom complet *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-background border-border"
              placeholder="Jean Dupont"
            />
          </div>
          <div>
            <Label>Adresse courriel *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="bg-background border-border"
              placeholder="jean@exemple.com"
            />
          </div>
          <div>
            <Label>Région</Label>
            <Select value={formData.region || "none"} onValueChange={(value) => setFormData({...formData, region: value === "none" ? "" : value})}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Sélectionnez votre région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sélectionnez votre région</SelectItem>
                <SelectItem value="quebec">Québec</SelectItem>
                <SelectItem value="ontario">Ontario</SelectItem>
                <SelectItem value="alberta">Alberta</SelectItem>
                <SelectItem value="bc">Colombie-Britannique</SelectItem>
                <SelectItem value="other_ca">Autre (Canada)</SelectItem>
                <SelectItem value="usa">États-Unis</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-[#f5a623]/10 rounded-lg">
            <Checkbox
              checked={formData.rememberMe}
              onCheckedChange={(checked) => setFormData({...formData, rememberMe: checked})}
            />
            <label className="text-[#f5a623] text-sm cursor-pointer flex items-center gap-2">
              <Star className="h-4 w-4" />
              Se souvenir de moi
            </label>
          </div>
          
          <div className="flex items-start gap-2">
            <Checkbox
              checked={formData.consent}
              onCheckedChange={(checked) => setFormData({...formData, consent: checked})}
            />
            <label className="text-gray-300 text-sm cursor-pointer">
              J&apos;accepte l&apos;utilisation de mes données pour l&apos;envoi du rapport et les analyses statistiques. *
            </label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button 
            className="btn-golden text-black"
            onClick={handleSubmit}
            disabled={!formData.consent || !formData.name || !formData.email || loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
            Envoyer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// MAIN ANALYZER MODULE COMPONENT
// ============================================
const AnalyzerModule = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("");
  const [categories, setCategories] = useState([]);
  const [analysisCategories, setAnalysisCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [displayProducts, setDisplayProducts] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [activeTab, setActiveTab] = useState("categories"); // Start with categories selection
  const [refreshing, setRefreshing] = useState(false);
  
  // Load categories for product type selection
  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API}/analyze/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };
  
  // Load analysis categories for menu
  const loadAnalysisCategories = async () => {
    try {
      const response = await axios.get(`${API}/analysis-categories`);
      setAnalysisCategories(response.data.categories);
    } catch (error) {
      console.error("Error loading analysis categories:", error);
    }
  };
  
  // Refresh/Reset function
  const handleRefresh = async () => {
    setRefreshing(true);
    setProductName("");
    setProductType("");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setReport(null);
    setActiveTab("categories");
    await loadCategories();
    await loadAnalysisCategories();
    setRefreshing(false);
    toast.success(t('common_refresh') || 'Actualisé');
  };

  const [activeView, setActiveView] = useState("input"); // input, analyzing, results
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [inputText, setInputText] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // Smart detection state
  const [smartDetection, setSmartDetection] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  
  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);
  
  useEffect(() => {
    loadAnalysisCategories();
  }, []);
  
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };
  
  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    // Set product type based on subcategory
    setProductType(subcategory.id);
    // Move to input tab
    setActiveTab("input");
  };
  
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setActiveTab("categories");
  };
  
  // Smart detection when product name changes (debounced)
  useEffect(() => {
    const detectProduct = async () => {
      if (productName.trim().length < 3) {
        setSmartDetection(null);
        return;
      }
      
      setIsDetecting(true);
      try {
        const response = await axios.post(`${API}/analyze/smart-detect`, {
          product_name: productName,
          product_description: "",
          product_tags: []
        });
        setSmartDetection(response.data);
        
        // Auto-set category if confidence is high
        if (response.data.category_confidence > 60) {
          setProductType(response.data.detected_category);
        }
      } catch (error) {
        console.error("Smart detection error:", error);
      }
      setIsDetecting(false);
    };
    
    const timeoutId = setTimeout(detectProduct, 500);
    return () => clearTimeout(timeoutId);
  }, [productName]);
  
  // Main analysis function
  const handleAnalyze = async () => {
    if (!productName.trim()) {
      toast.error("Veuillez entrer le nom du produit");
      return;
    }
    
    setAnalyzing(true);
    setActiveView("analyzing");
    
    try {
      // Use quick analysis for pre-filled data
      const response = await axios.post(`${API}/analyze/quick`, {
        product_name: productName,
        detected_category: productType || smartDetection?.detected_category || "granules",
        session_id: getSessionId()
      });
      
      setReport(response.data.report);
      setDisplayProducts(response.data.display_products);
      setActiveView("results");
      toast.success("Analyse terminée!");
      
      // Learn any new keywords if user corrected the category
      if (smartDetection && productType !== smartDetection.detected_category) {
        try {
          await axios.post(`${API}/analyze/learn-keyword`, {
            keyword: productName.toLowerCase().split(' ')[0],
            category: productType,
            source: "user_correction"
          });
        } catch (e) {
          console.log("Keyword learning skipped");
        }
      }
    } catch (error) {
      toast.error("Erreur lors de l'analyse: " + (error.response?.data?.detail || error.message));
      setActiveView("input");
    }
    
    setAnalyzing(false);
  };
  
  const resetAnalysis = () => {
    setReport(null);
    setDisplayProducts(null);
    setProductName("");
    setProductType("");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setActiveTab("categories");
  };
  
  return (
    <main className="pt-20 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4 text-gray-400 hover:text-white hover:bg-gray-800/50"
          data-testid="back-button-analyzer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Button>

        {/* Header - Compact */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-[#f5a623]/10 px-3 py-1.5 rounded-full mb-2">
            <FlaskConical className="h-4 w-4 text-[#f5a623]" />
            <span className="text-[#f5a623] font-semibold text-sm">Click & Analyse</span>
          </div>
          <h1 className="golden-text text-2xl md:text-3xl font-bold mb-2">Analysez votre Pourvoyeur et Produits</h1>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Notre IA analysera la composition, l&apos;efficacité et comparera aux meilleurs produits du marché.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {activeView === "input" ? (
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">URL du produit ou texte à analyser</Label>
                    <Input 
                      placeholder="Collez l'URL ou décrivez le produit..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <Button 
                    onClick={handleAnalyze}
                    disabled={analyzing || !inputText.trim()}
                    className="w-full btn-golden text-black"
                  >
                    {analyzing ? "Analyse en cours..." : "Analyser"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Résultats de l&apos;analyse</h3>
                {analysisResult && (
                  <div className="space-y-4">
                    <p className="text-gray-300">{analysisResult.summary || "Analyse complétée"}</p>
                    <Button onClick={() => setActiveView("input")} variant="outline">
                      Nouvelle analyse
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
};

export default AnalyzerModule;
