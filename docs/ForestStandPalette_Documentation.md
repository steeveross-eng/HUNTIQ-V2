# 🌲 PALETTE CARTOGRAPHIQUE - PEUPLEMENTS FORESTIERS QUÉBEC

## OBJECTIF

Système de couleurs hiérarchisé, stable et cohérent pour représenter les peuplements forestiers, inspiré des pratiques du MFFP (Ministère des Forêts, de la Faune et des Parcs du Québec).

Compatible avec: **Mapbox GL JS**, **Leaflet**, **QGIS**, tout moteur vectoriel.

---

## RÈGLES DE CONSTRUCTION

### 1. COULEUR PRINCIPALE = TYPE DE COUVERT

| Type | Code | Base HSL | Couleur Mère | Description |
|------|------|----------|--------------|-------------|
| **Coniférien** | C | `hsl(145, 65%, 40%)` | ![#339957](https://via.placeholder.com/15/339957/339957) `#339957` | Verte froide |
| **Mélangé** | M | `hsl(75, 50%, 42%)` | ![#8a9840](https://via.placeholder.com/15/8a9840/8a9840) `#8a9840` | Olive/brun-vert |
| **Feuillu** | F | `hsl(38, 70%, 48%)` | ![#c48a28](https://via.placeholder.com/15/c48a28/c48a28) `#c48a28` | Jaune-orangé |

---

### 2. VARIATION DE TEINTE = ESSENCE DOMINANTE

**Conifères (spectre vert-bleuté):**

| Code | Essence | Teinte | Couleur HEX |
|------|---------|--------|-------------|
| EPN | Épinette noire | -10° | ![#267343](https://via.placeholder.com/15/267343/267343) `#267343` |
| EPB | Épinette blanche | -5° | ![#2a7d48](https://via.placeholder.com/15/2a7d48/2a7d48) `#2a7d48` |
| SAB | Sapin baumier | +5° | ![#308d4e](https://via.placeholder.com/15/308d4e/308d4e) `#308d4e` |
| PIB | Pin blanc | +10° | ![#3d9658](https://via.placeholder.com/15/3d9658/3d9658) `#3d9658` |
| PIG | Pin gris | +8° | ![#389253](https://via.placeholder.com/15/389253/389253) `#389253` |
| THO | Thuya (Cèdre) | -15° | ![#1f6e3b](https://via.placeholder.com/15/1f6e3b/1f6e3b) `#1f6e3b` |
| MEL | Mélèze | +15° | ![#5fc77a](https://via.placeholder.com/15/5fc77a/5fc77a) `#5fc77a` |
| PRU | Pruche | -8° | ![#298048](https://via.placeholder.com/15/298048/298048) `#298048` |

**Feuillus (spectre jaune-orangé):**

| Code | Essence | Teinte | Couleur HEX |
|------|---------|--------|-------------|
| ERS | Érable à sucre | +5° | ![#a6751f](https://via.placeholder.com/15/a6751f/a6751f) `#a6751f` |
| ERR | Érable rouge | +12° | ![#b87025](https://via.placeholder.com/15/b87025/b87025) `#b87025` |
| BOJ | Bouleau jaune | -8° | ![#9c7e30](https://via.placeholder.com/15/9c7e30/9c7e30) `#9c7e30` |
| BOP | Bouleau blanc | -15° | ![#bfb050](https://via.placeholder.com/15/bfb050/bfb050) `#bfb050` |
| HEG | Hêtre | +8° | ![#b07828](https://via.placeholder.com/15/b07828/b07828) `#b07828` |
| CHR | Chêne rouge | +18° | ![#c26825](https://via.placeholder.com/15/c26825/c26825) `#c26825` |
| PET | Peuplier | -20° | ![#b5b855](https://via.placeholder.com/15/b5b855/b5b855) `#b5b855` |

**Mixtes:**

| Code | Type | Teinte | Couleur HEX |
|------|------|--------|-------------|
| MIX | Mixte équilibré | 0° | ![#8a9840](https://via.placeholder.com/15/8a9840/8a9840) `#8a9840` |
| MIS | Dominance résineuse | +15° | ![#658838](https://via.placeholder.com/15/658838/658838) `#658838` |
| MIF | Dominance feuillue | -15° | ![#7e7432](https://via.placeholder.com/15/7e7432/7e7432) `#7e7432` |

---

### 3. VARIATION DE LUMINOSITÉ = CLASSE DE HAUTEUR

| Classe | Plage | Luminosité | Description |
|--------|-------|------------|-------------|
| H1 | 0-7m | +25% (très clair) | Régénération |
| H2 | 7-12m | +15% (clair) | Jeune peuplement |
| H3 | 12-17m | +5% (moyen-clair) | Gaulis |
| H4 | 17-22m | 0% (base) | Perchis |
| H5 | 22-27m | -8% (moyen-foncé) | Futaie |
| H6 | 27m+ | -15% (foncé) | Futaie mature |

**Exemple visuel (Épinette noire):**

| Hauteur | Luminosité | HEX |
|---------|------------|-----|
| 0-7m | Très clair | ![#7dd9a1](https://via.placeholder.com/15/7dd9a1/7dd9a1) `#7dd9a1` |
| 7-12m | Clair | ![#4dbd7a](https://via.placeholder.com/15/4dbd7a/4dbd7a) `#4dbd7a` |
| 12-17m | Moyen-clair | ![#3da366](https://via.placeholder.com/15/3da366/3da366) `#3da366` |
| 17-22m | Base | ![#339957](https://via.placeholder.com/15/339957/339957) `#339957` |
| 22-27m | Moyen-foncé | ![#267343](https://via.placeholder.com/15/267343/267343) `#267343` |
| 27m+ | Foncé | ![#1a5c34](https://via.placeholder.com/15/1a5c34/1a5c34) `#1a5c34` |

---

### 4. VARIATION DE SATURATION = DENSITÉ DU COUVERT

| Classe | Plage | Saturation | Description |
|--------|-------|------------|-------------|
| A | 80-100% | +15% (très saturé) | Couvert fermé |
| B | 60-80% | 0% (base) | Couvert régulier |
| C | 40-60% | -15% (moyen) | Couvert irrégulier |
| D | 25-40% | -30% (désaturé) | Couvert ouvert |

---

### 5. TEXTURE/CONTOUR = STADE DE DÉVELOPPEMENT

| Code | Stade | Texture | Âge |
|------|-------|---------|-----|
| REG | Régénération | Pointillé fin `•••` | < 10 ans |
| JEU | Jeune | Hachures légères `///` | 10-30 ans |
| MAT | Mature | Plein (aucun motif) | 30-80 ans |
| SUR | Suranné | Contour renforcé | > 80 ans |
| VIN | Vieille forêt | Double contour | > 120 ans |

---

## TABLEAU DE RÉFÉRENCE COMPLET

### CONIFÉRIENS (C)

| Code | Essence | Hauteur | Densité | Stade | HEX | Texture |
|------|---------|---------|---------|-------|-----|---------|
| CEPN1AREG | Épinette noire | 0-7m | 80-100% | Régénération | `#7dd9a1` | pointillé |
| CEPN2BJEU | Épinette noire | 7-12m | 60-80% | Jeune | `#4dbd7a` | hachures |
| CEPN3BMAT | Épinette noire | 12-17m | 60-80% | Mature | `#3da366` | plein |
| CEPN4AMAT | Épinette noire | 17-22m | 80-100% | Mature | `#339957` | plein |
| CEPN5AMAT | Épinette noire | 22-27m | 80-100% | Mature | `#267343` | plein |
| CEPN6AVIN | Épinette noire | 27m+ | 80-100% | Vieille forêt | `#1a5c34` | double |
| CSAB4AMAT | Sapin baumier | 17-22m | 80-100% | Mature | `#3db363` | plein |
| CSAB5AMAT | Sapin baumier | 22-27m | 80-100% | Mature | `#308d4e` | plein |
| CPIG4BMAT | Pin gris | 17-22m | 60-80% | Mature | `#4db86a` | plein |
| CPIB5AMAT | Pin blanc | 22-27m | 80-100% | Mature | `#3d9658` | plein |
| CTHO4AMAT | Thuya | 17-22m | 80-100% | Mature | `#2a8f4d` | plein |

### FEUILLUS (F)

| Code | Essence | Hauteur | Densité | Stade | HEX | Texture |
|------|---------|---------|---------|-------|-----|---------|
| FERS1AREG | Érable à sucre | 0-7m | 80-100% | Régénération | `#f5c96d` | pointillé |
| FERS4AMAT | Érable à sucre | 17-22m | 80-100% | Mature | `#c48a28` | plein |
| FERS5AMAT | Érable à sucre | 22-27m | 80-100% | Mature | `#a6751f` | plein |
| FERS6AVIN | Érable à sucre | 27m+ | 80-100% | Vieille forêt | `#8a6018` | double |
| FERR4BMAT | Érable rouge | 17-22m | 60-80% | Mature | `#d9852e` | plein |
| FBOJ5AMAT | Bouleau jaune | 22-27m | 80-100% | Mature | `#9c7e30` | plein |
| FPET4BMAT | Peuplier | 17-22m | 60-80% | Mature | `#b5b855` | plein |

### MÉLANGÉS (M)

| Code | Type | Hauteur | Densité | Stade | HEX | Texture |
|------|------|---------|---------|-------|-----|---------|
| MMIX1CREG | Mixte général | 0-7m | 40-60% | Régénération | `#c4d078` | pointillé |
| MMIX4BMAT | Mixte général | 17-22m | 60-80% | Mature | `#8a9840` | plein |
| MMIS4BMAT | Dominance rés. | 17-22m | 60-80% | Mature | `#7fa848` | plein |
| MMIF4BMAT | Dominance feu. | 17-22m | 60-80% | Mature | `#9a9040` | plein |

---

## INTÉGRATION TECHNIQUE

### Mapbox GL JS

```javascript
{
  'fill-color': [
    'match', ['get', 'TYPE_COUV'],
    'C', ['interpolate', ['linear'], ['get', 'HAUTEUR'],
      7, '#7dd9a1', 12, '#4dbd7a', 17, '#339957', 22, '#267343', 27, '#1a5c34'
    ],
    'F', ['interpolate', ['linear'], ['get', 'HAUTEUR'],
      7, '#f5c96d', 12, '#e0a83d', 17, '#c48a28', 22, '#a6751f', 27, '#8a6018'
    ],
    'M', ['interpolate', ['linear'], ['get', 'HAUTEUR'],
      7, '#c4d078', 12, '#a8b850', 17, '#8a9840', 22, '#6e7a32', 27, '#586428'
    ],
    '#888888'
  ],
  'fill-opacity': ['match', ['get', 'DENSITE'], 'A', 0.85, 'B', 0.75, 'C', 0.60, 'D', 0.45, 0.70]
}
```

### Leaflet

```javascript
import { getLeafletStyle } from '@/config/ForestStandPalette';

// Utilisation
const style = getLeafletStyle('CEPN5AMAT');
// Retourne: { fillColor: '#267343', fillOpacity: 0.75, color: '#1a5c34', weight: 1 }
```

### QGIS

Importer le fichier `ForestStandReferenceTable.js` et utiliser les valeurs HEX pour la symbologie catégorisée.

---

## FICHIERS DE RÉFÉRENCE

- `/app/frontend/src/config/ForestStandPalette.js` - Palette complète avec fonctions
- `/app/frontend/src/config/ForestStandReferenceTable.js` - Tableau pré-calculé
- `/app/frontend/src/components/territoire/ForestStandLegend.jsx` - Composant légende UI

---

*Version 1.0.0 - HUNTIQ BIONIC™*
*Inspiré des pratiques MFFP Québec*
