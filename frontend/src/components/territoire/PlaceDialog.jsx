/**
 * PlaceDialog - Dialog pour créer/modifier un lieu
 * Extrait de MonTerritoireBionicPage.jsx pour modularité
 */

import React from 'react';
import { Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PLACE_TYPES } from './PlaceTypes';

const PlaceDialog = ({
  editingPlace,
  setEditingPlace,
  onSave
}) => {
  if (!editingPlace) return null;
  
  return (
    <Dialog open={!!editingPlace} onOpenChange={() => setEditingPlace(null)}>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Modifier le lieu</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-gray-300">Nom du lieu</Label>
            <Input 
              value={editingPlace.name}
              className="bg-gray-800 border-gray-700 text-white"
              onChange={(e) => setEditingPlace(p => ({ ...p, name: e.target.value }))} 
            />
          </div>
          <div>
            <Label className="text-gray-300">Type</Label>
            <Select value={editingPlace.type} onValueChange={(v) => setEditingPlace(p => ({ ...p, type: v }))}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {PLACE_TYPES.map(type => (
                  <SelectItem key={type.id} value={type.id} className="text-white">{type.icon} {type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-300">Notes</Label>
            <Input 
              value={editingPlace.notes || ''}
              className="bg-gray-800 border-gray-700 text-white"
              onChange={(e) => setEditingPlace(p => ({ ...p, notes: e.target.value }))} 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditingPlace(null)} className="border-gray-700">Annuler</Button>
          <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700 text-white">Sauvegarder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceDialog;
