/**
 * WaypointDialog - Dialog pour créer/modifier un waypoint
 * Extrait de MonTerritoireBionicPage.jsx pour modularité
 */

import React from 'react';
import { MapPin, LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PLACE_TYPES } from './PlaceTypes';

const WaypointDialog = ({
  open,
  onOpenChange,
  waypoint,
  setWaypoint,
  onSave,
  onUseCurrentPosition,
  mapCenter
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#f5a623]" />
            Nouveau waypoint
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Créez un point d'intérêt pour générer automatiquement des zones d'analyse BIONIC™
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-gray-300">Nom du waypoint</Label>
            <Input 
              placeholder="Ex: Affût secteur nord" 
              className="bg-gray-800 border-gray-700 text-white mt-1" 
              value={waypoint.name}
              onChange={(e) => setWaypoint(p => ({ ...p, name: e.target.value }))} 
            />
          </div>
          <div>
            <Label className="text-gray-300">Type</Label>
            <Select value={waypoint.type} onValueChange={(v) => setWaypoint(p => ({ ...p, type: v }))}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {PLACE_TYPES.map(type => (
                  <SelectItem key={type.id} value={type.id} className="text-white">{type.icon} {type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-gray-300">Latitude</Label>
              <Input 
                placeholder="46.8139" 
                className="bg-gray-800 border-gray-700 text-white mt-1" 
                value={waypoint.lat}
                onChange={(e) => setWaypoint(p => ({ ...p, lat: e.target.value }))} 
              />
            </div>
            <div>
              <Label className="text-gray-300">Longitude</Label>
              <Input 
                placeholder="-71.2080" 
                className="bg-gray-800 border-gray-700 text-white mt-1" 
                value={waypoint.lng}
                onChange={(e) => setWaypoint(p => ({ ...p, lng: e.target.value }))} 
              />
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full border-gray-700 text-gray-300 hover:bg-gray-800" 
            onClick={onUseCurrentPosition}
          >
            <LocateFixed className="h-4 w-4 mr-2" />
            Utiliser ma position actuelle
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-700">Annuler</Button>
          <Button onClick={onSave} className="bg-[#f5a623] hover:bg-[#e09612] text-black">Créer le waypoint</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WaypointDialog;
