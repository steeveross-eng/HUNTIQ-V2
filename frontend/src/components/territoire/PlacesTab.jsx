/**
 * PlacesTab - Onglet "Lieux enregistrés" complet
 * Extrait de MonTerritoireBionicPage.jsx pour modularité
 */

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { BookMarked, Plus, Navigation2, Edit2, Trash2, LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PLACE_TYPES } from './PlaceTypes';
import { createCustomIcon } from './CustomMarkerIcons';
import MapController from './MapController';

const PlacesTab = ({
  savedPlaces,
  userPosition,
  mapCenter,
  mapZoom,
  setMapCenter,
  setMapZoom,
  addPlace,
  updatePlace,
  deletePlace
}) => {
  const [showAddPlaceDialog, setShowAddPlaceDialog] = useState(false);
  const [newPlace, setNewPlace] = useState({ name: '', type: 'autre', lat: '', lng: '', notes: '' });
  const [editingPlace, setEditingPlace] = useState(null);
  
  const useCurrentPosition = () => {
    if (userPosition) {
      setNewPlace(prev => ({ ...prev, lat: userPosition.lat.toFixed(6), lng: userPosition.lng.toFixed(6) }));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewPlace(prev => ({ 
            ...prev, 
            lat: position.coords.latitude.toFixed(6), 
            lng: position.coords.longitude.toFixed(6) 
          }));
        },
        () => {}
      );
    }
  };
  
  const handleAddPlace = () => {
    if (!newPlace.name) return;
    addPlace({
      name: newPlace.name,
      lat: parseFloat(newPlace.lat) || mapCenter[0],
      lng: parseFloat(newPlace.lng) || mapCenter[1],
      type: newPlace.type,
      notes: newPlace.notes
    });
    setNewPlace({ name: '', type: 'autre', lat: '', lng: '', notes: '' });
    setShowAddPlaceDialog(false);
  };
  
  const handleUpdatePlace = () => {
    if (!editingPlace) return;
    updatePlace(editingPlace.id, {
      name: editingPlace.name,
      type: editingPlace.type,
      notes: editingPlace.notes
    });
    setEditingPlace(null);
  };

  return (
    <div className="h-full flex">
      {/* Liste des lieux */}
      <div className="w-80 border-r border-gray-800 flex flex-col bg-black">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Mes lieux</h3>
            <Dialog open={showAddPlaceDialog} onOpenChange={setShowAddPlaceDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#f5a623] hover:bg-[#e09612] text-black">
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Ajouter un lieu</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-gray-300">Nom du lieu</Label>
                    <Input 
                      placeholder="Ex: ZEC Batiscan" 
                      className="bg-gray-800 border-gray-700 text-white mt-1" 
                      value={newPlace.name}
                      onChange={(e) => setNewPlace(p => ({ ...p, name: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Type</Label>
                    <Select value={newPlace.type} onValueChange={(v) => setNewPlace(p => ({ ...p, type: v }))}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                        <SelectValue />
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
                        value={newPlace.lat}
                        onChange={(e) => setNewPlace(p => ({ ...p, lat: e.target.value }))} 
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Longitude</Label>
                      <Input 
                        placeholder="-71.2080" 
                        className="bg-gray-800 border-gray-700 text-white mt-1" 
                        value={newPlace.lng}
                        onChange={(e) => setNewPlace(p => ({ ...p, lng: e.target.value }))} 
                      />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-gray-700 text-gray-300" onClick={useCurrentPosition}>
                    <LocateFixed className="h-4 w-4 mr-2" /> Ma position actuelle
                  </Button>
                  <div>
                    <Label className="text-gray-300">Notes</Label>
                    <Textarea 
                      placeholder="Notes optionnelles..." 
                      className="bg-gray-800 border-gray-700 text-white mt-1 resize-none h-20" 
                      value={newPlace.notes}
                      onChange={(e) => setNewPlace(p => ({ ...p, notes: e.target.value }))} 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddPlaceDialog(false)} className="border-gray-700">Annuler</Button>
                  <Button onClick={handleAddPlace} className="bg-[#f5a623] hover:bg-[#e09612] text-black">Enregistrer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Types rapides */}
          <div className="flex flex-wrap gap-1">
            {PLACE_TYPES.slice(0, 5).map(type => (
              <button
                key={type.id}
                onClick={() => { setNewPlace({ name: '', type: type.id, lat: '', lng: '', notes: '' }); setShowAddPlaceDialog(true); }}
                className="px-2 py-1 rounded text-[10px] bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                {type.icon} {type.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Liste des lieux */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {savedPlaces.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <BookMarked className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Aucun lieu enregistré</p>
              <p className="text-xs mt-1">Ajoutez vos ZEC, pourvoiries et territoires</p>
            </div>
          ) : (
            savedPlaces.map(place => {
              const typeInfo = PLACE_TYPES.find(t => t.id === place.type);
              return (
                <div 
                  key={place.id} 
                  className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${typeInfo?.color}20` }}
                      >
                        {typeInfo?.icon || '📌'}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{place.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{typeInfo?.name}</div>
                        {place.notes && (
                          <div className="text-[10px] text-gray-500 mt-1 italic">"{place.notes}"</div>
                        )}
                        <div className="text-[10px] text-gray-500 mt-1">
                          {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => { setMapCenter([place.lat, place.lng]); setMapZoom(13); }}
                        className="text-gray-400 hover:text-white h-8 w-8 p-0"
                      >
                        <Navigation2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setEditingPlace(place)}
                        className="text-blue-400 hover:text-blue-300 h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deletePlace(place.id)}
                        className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Carte des lieux */}
      <div className="flex-1 relative">
        <MapContainer center={mapCenter} zoom={8} className="h-full w-full" zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <MapController center={mapCenter} zoom={mapZoom} />
          
          {userPosition && (
            <Marker position={[userPosition.lat, userPosition.lng]} icon={createCustomIcon('#3b82f6', 'user')}>
              <Popup><b>Ma position</b></Popup>
            </Marker>
          )}
          
          {savedPlaces.map(place => {
            const typeInfo = PLACE_TYPES.find(t => t.id === place.type);
            return (
              <Marker 
                key={place.id} 
                position={[place.lat, place.lng]} 
                icon={createCustomIcon(typeInfo?.color || '#6b7280', 'place')}
              >
                <Popup>
                  <div className="text-center min-w-[150px]">
                    <div className="text-lg mb-1">{typeInfo?.icon}</div>
                    <div className="font-bold">{place.name}</div>
                    <div className="text-xs text-gray-500">{typeInfo?.name}</div>
                    {place.notes && <div className="text-xs mt-1 italic">"{place.notes}"</div>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        
        {/* Légende */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-black/90 backdrop-blur-sm rounded-lg border border-gray-700 p-3">
          <div className="text-[10px] text-gray-400 uppercase mb-2">Types de lieux</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {PLACE_TYPES.slice(0, 6).map(type => (
              <div key={type.id} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: type.color }} />
                <span className="text-gray-300">{type.icon} {type.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Dialog d'édition */}
      {editingPlace && (
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
              <Button onClick={handleUpdatePlace} className="bg-blue-600 hover:bg-blue-700 text-white">Sauvegarder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PlacesTab;
