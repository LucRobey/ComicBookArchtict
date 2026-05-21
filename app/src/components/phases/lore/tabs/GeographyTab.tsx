import React, { useState } from 'react';
import type { GeographyData, ScenarioData, Location, Variant, Shot, Scene } from '../types';
import { InlineEditableText } from '../components/InlineEditableText';
import { AddLocationModal } from '../components/AddLocationModal';
import { RequestViewModal } from '../components/RequestViewModal';
import { AddPaletteColorModal } from '../components/AddPaletteColorModal';
import { mutateGeo, getShots, getPalette } from '../utils/geoMutations';

const LOCATION_TYPE_ICON: Record<string, string> = {
  interior: '🏢',
  exterior: '🌆',
  recurring: '🔁',
};

interface GeographyTabProps {
  geography: GeographyData | null;
  scenario: ScenarioData | null;
  flaggedKeys: Set<string>;
  openFlag: (type: 'shot' | 'palette' | 'lighting', locId: string, variantId: string | null, label: string, shot?: Shot) => void;
  openLocFlag: (id: string) => void;
  onSaveDescription: (key: string, value: string) => Promise<void>;
  onSaveGeography?: (geoData: GeographyData) => Promise<void>;
}

export const GeographyTab: React.FC<GeographyTabProps> = ({ geography, scenario, flaggedKeys, openFlag, openLocFlag, onSaveDescription, onSaveGeography }) => {
  const [activeLocId, setActiveLocId] = useState<string | null>(null);
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);
  const [showAddLoc, setShowAddLoc] = useState(false);
  const [showRequestView, setShowRequestView] = useState(false);
  const [showAddColor, setShowAddColor] = useState(false);

  if (!geography?.locations?.length) return (
    <div className="lore-state error">
      <p>⚠️ No geography.json found.</p>
      <p className="lore-state-hint">Run Phase 0 agent to generate <code>data/geography.json</code></p>
    </div>
  );

  const activeLoc = geography.locations.find(l => l.id === activeLocId) ?? null;

  const hasVariants = !!activeLoc?.variants?.length;
  const activeVariant: Variant | null = hasVariants
    ? (activeLoc!.variants!.find(v => v.id === activeVariantId) ?? activeLoc!.variants![0])
    : null;


  const displayPalette        = activeVariant?.palette        ?? activeLoc?.palette;
  const displayLighting       = activeVariant?.lighting_summary ?? activeLoc?.lighting_summary;
  const displayShots          = activeVariant?.shots          ?? activeLoc?.shots ?? [];
  const displaySceneIds       = new Set(
    activeVariant?.appears_in_scenes ?? activeLoc?.appears_in_scenes ?? []
  );

  const cardCoverImage = (loc: Location) => loc.variants?.length ? loc.variants[0].image : loc.image;

  const handleLocClick = (locId: string) => {
    if (activeLocId === locId) {
      setActiveLocId(null);
      setActiveVariantId(null);
    } else {
      const loc = geography.locations.find(l => l.id === locId);
      setActiveLocId(locId);
      setActiveVariantId(loc?.variants?.[0]?.id ?? null);
    }
  };

  const handleAddShotSubmit = (label: string, description: string, useFor: string) => {
    if (!geography || !activeLoc || !onSaveGeography) return;
    const newGeo = mutateGeo(geography, activeLoc.id, activeVariant?.id ?? null, (_loc, variant) => {
      const shots = getShots(_loc, variant);
      shots.push({ id: `shot_${Date.now()}`, label, description, use_for: useFor, image: undefined });
    });
    if (newGeo) { onSaveGeography(newGeo); setShowRequestView(false); }
  };
  
  const handleSaveShotLabel = (shotId: string, val: string) => {
    if (!geography || !activeLoc || !onSaveGeography) return;
    const newGeo = mutateGeo(geography, activeLoc.id, activeVariant?.id ?? null, (_loc, variant) => {
      const shot = getShots(_loc, variant).find((s: any) => s.id === shotId);
      if (shot) shot.label = val;
    });
    if (newGeo) onSaveGeography(newGeo);
  };

  const handleRemoveShot = (shotId: string) => {
    if (!geography || !activeLoc || !onSaveGeography) return;
    const newGeo = mutateGeo(geography, activeLoc.id, activeVariant?.id ?? null, (loc, variant) => {
      const target = variant ?? loc;
      if (target.shots) target.shots = target.shots.filter((s: any) => s.id !== shotId);
    });
    if (newGeo) onSaveGeography(newGeo);
  };

  const handleAddPaletteColor = (hex: string) => {
    if (!geography || !activeLoc || !onSaveGeography) return;
    const newGeo = mutateGeo(geography, activeLoc.id, activeVariant?.id ?? null, (_loc, variant) => {
      const palette = getPalette(_loc, variant);
      if (!palette.includes(hex)) palette.push(hex);
    });
    if (newGeo) onSaveGeography(newGeo);
  };

  const handleRemovePaletteColor = (hex: string) => {
    if (!geography || !activeLoc || !onSaveGeography) return;
    const newGeo = mutateGeo(geography, activeLoc.id, activeVariant?.id ?? null, (loc, variant) => {
      const target = variant ?? loc;
      if (target.palette) target.palette = target.palette.filter((c: string) => c !== hex);
    });
    if (newGeo) onSaveGeography(newGeo);
  };

  const handleSaveLighting = async (newVal: string) => {
    if (!geography || !activeLoc || !onSaveGeography) return;
    const newGeo = mutateGeo(geography, activeLoc.id, activeVariant?.id ?? null, (loc, variant) => {
      if (variant) variant.lighting_summary = newVal;
      else loc.lighting_summary = newVal;
    });
    if (newGeo) await onSaveGeography(newGeo);
  };

  return (
    <div className="lore-geo-layout">
      {/* Location Cards */}
      <div className="lore-section">
        <div className="lore-section-header">
          <span className="lore-section-icon">📍</span>
          <span className="lore-section-title">Locations</span>
          <span className="lore-section-badge">{geography.locations.length}</span>
          <button
            className="lore-add-loc-btn"
            onClick={() => setShowAddLoc(true)}
            title="Flag a new location for the agent to create"
          >+ Add Location</button>
        </div>
        <div className="lore-location-grid">
          {geography.locations.map(loc => {
            const cover = cardCoverImage(loc);
            return (
              <div
                key={loc.id}
                className={`lore-location-card ${activeLocId === loc.id ? 'active' : ''}`}
                onClick={() => handleLocClick(loc.id)}
              >
                {cover && (
                  <div className="lore-location-img-wrap">
                    <img
                      src={`/api/load-image?path=${encodeURIComponent(cover)}`}
                      alt={loc.name}
                      className="lore-location-img"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    {loc.variants && loc.variants.length > 1 && (
                      <div className="lore-location-variant-pills">
                        {loc.variants.map(v => (
                          <span key={v.id} className="lore-location-variant-pill">{v.label}</span>
                        ))}
                      </div>
                    )}
                    <button
                      className="lore-location-img-flag"
                      title="Flag image for regeneration"
                      onClick={e => { e.stopPropagation(); openLocFlag(loc.id); }}
                    >🚩</button>
                  </div>
                )}
                <div className="lore-location-body">
                  <div className="lore-location-top">
                    <span className="lore-location-icon">{LOCATION_TYPE_ICON[loc.type] ?? '📌'}</span>
                    <div className="lore-location-meta">
                      <span className="lore-location-name">{loc.name}</span>
                      <span className="lore-location-type">{loc.type}</span>
                    </div>
                    <div className="lore-location-scenes">
                      {loc.appears_in_scenes.map(sid => (
                        <span key={sid} className="lore-location-scene-badge">Scene {sid}</span>
                      ))}
                    </div>
                  </div>
                  <p className="lore-location-desc">{loc.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeLoc && (
        <div className="lore-loc-detail">
          <div className="lore-loc-global-desc-row">
            <span className="lore-loc-detail-label">📍 {activeLoc.name}</span>
            <InlineEditableText 
              initialValue={activeLoc.description} 
              onSave={(value) => onSaveDescription(`global:${activeLoc.id}`, value)}
            />
          </div>

          {hasVariants && activeLoc.variants && (
            <div className="lore-loc-variant-tabs">
              {activeLoc.variants.map(v => (
                <button
                  key={v.id}
                  className={`lore-loc-variant-tab ${(activeVariantId ?? activeLoc.variants![0].id) === v.id ? 'active' : ''}`}
                  onClick={() => setActiveVariantId(v.id)}
                >
                  {v.label}
                  {v.appears_in_scenes && (
                    <span className="lore-loc-variant-tab-scenes">
                      {v.appears_in_scenes.map(s => `Sc.${s}`).join(' ')}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {activeVariant && (() => {
            const vDescKey = `variant:${activeLoc.id}:${activeVariant.id}`;
            return (
              <div className="lore-loc-variant-desc-row">
                <InlineEditableText 
                  initialValue={activeVariant.description ?? ''} 
                  onSave={(value) => onSaveDescription(vDescKey, value)}
                  isVariant={true}
                />
              </div>
            );
          })()}

          {displayPalette && displayPalette.length > 0 && (() => {
            const palKey = `palette:${activeLoc.id}:${activeVariant?.id ?? 'flat'}`;
            const isFlagged = flaggedKeys.has(palKey);
            return (
              <div className={`lore-loc-detail-row ${isFlagged ? 'flagged-row' : ''}`}>
                <div className="lore-loc-detail-label-group">
                  <span className="lore-loc-detail-label">🎨 Palette</span>
                  <button
                    className="lore-row-flag-btn"
                    title="Flag palette for regeneration"
                    onClick={() => openFlag('palette', activeLoc.id, activeVariant?.id ?? null, 'Palette')}
                  >{isFlagged ? '🚩 Flagged' : '🚩'}</button>
                </div>
                <div className="lore-loc-palette flex gap-2 items-center flex-wrap pt-2">
                  {displayPalette?.map(hex => (
                    <div key={hex} className="group relative w-8 h-8 rounded-full border border-border shadow-sm shrink-0" style={{ background: hex }} title={hex}>
                      <button 
                        className="lore-action-delete !w-4 !h-4 !rounded-full !text-[10px] absolute -top-2 -right-2 shadow-sm"
                        onClick={() => handleRemovePaletteColor(hex)}
                        title="Remove color"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {(!displayPalette || displayPalette.length < 8) && (
                    <button 
                      className="w-8 h-8 rounded-full border-2 border-dashed border-border flex items-center justify-center text-text-muted hover:text-accent hover:border-accent transition-colors"
                      onClick={() => setShowAddColor(true)}
                      title="Add color"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {(() => {
            const lightKey = `lighting:${activeLoc.id}:${activeVariant?.id ?? 'flat'}`;
            const isFlagged = flaggedKeys.has(lightKey);
            return (
              <div className={`lore-loc-detail-row ${isFlagged ? 'flagged-row' : ''}`}>
                <div className="lore-loc-detail-label-group">
                  <span className="lore-loc-detail-label">💡 Lighting</span>
                  <button
                    className="lore-row-flag-btn"
                    title="Flag lighting for modification"
                    onClick={() => openFlag('lighting', activeLoc.id, activeVariant?.id ?? null, displayLighting ?? '')}
                  >{isFlagged ? '🚩 Flagged' : '🚩'}</button>
                </div>
                <div className="lore-loc-detail-value w-full mt-1">
                  <InlineEditableText 
                    initialValue={displayLighting || ''} 
                    onSave={handleSaveLighting} 
                    emptyText="Click to add lighting summary..."
                  />
                </div>
              </div>
            );
          })()}

          {activeLoc && (
            <div className="lore-loc-shots-section">
              <div className="lore-loc-shots-header flex justify-between items-center">
                <div>
                  <span className="lore-loc-detail-label">📷 Shot Library</span>
                  <span className="lore-section-badge">{displayShots.length} shots</span>
                </div>
                <button 
                  className="text-xs px-2 py-1 bg-accent/10 text-accent rounded hover:bg-accent hover:text-white border border-accent/20 transition-colors"
                  onClick={() => setShowRequestView(true)}
                  title="Request New View"
                >
                  + Request New View
                </button>
              </div>
              <div className="lore-loc-shots-grid">
                {displayShots.map(shot => {
                  const shotKey = `shot:${activeLoc.id}:${activeVariant?.id ?? 'flat'}:${shot.id}`;
                  const isFlagged = flaggedKeys.has(shotKey);
                  return (
                    <div key={shot.id} className={`lore-loc-shot-card group relative ${isFlagged ? 'flagged' : ''}`}>
                      <div className="lore-loc-shot-img-wrap relative overflow-hidden rounded">
                        {shot.image ? (
                          <img
                            src={`/api/load-image?path=${encodeURIComponent(shot.image)}`}
                            alt={shot.label}
                            className="lore-loc-shot-img"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full aspect-[16/9] bg-panel-raised border-2 border-dashed border-border-subtle rounded flex flex-col items-center justify-center text-text-muted">
                            <span className="text-2xl mb-2">⌛</span>
                            <span className="text-sm font-medium">Pending Generation</span>
                            <span className="text-xs opacity-60">Waiting for agent</span>
                          </div>
                        )}
                        {isFlagged && <span className="lore-shot-flagged-badge">🚩 Flagged</span>}
                        
                        <div className="lore-action-row absolute top-2 right-2 z-10">
                          {openFlag ? (shot.image ? (
                            <button 
                              className="lore-action-flag" 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                openFlag('shot', activeLoc.id, activeVariant?.id ?? null, shot.label, shot); 
                              }}
                              title="Flag image for regeneration"
                            >
                              🚩
                            </button>
                          ) : null) : null}
                          <button 
                            className="lore-action-delete"
                            onClick={() => handleRemoveShot(shot.id)}
                            title="Remove this shot"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div className="lore-loc-shot-info mt-2">
                        <InlineEditableText 
                          initialValue={shot.label} 
                          onSave={async (val) => handleSaveShotLabel(shot.id, val)} 
                          textClassOverride="lore-loc-shot-label font-bold text-sm"
                          emptyText="Click to add a prompt for this view" 
                        />
                        {shot.description && <p className="lore-loc-shot-desc mt-1 opacity-80">{shot.description}</p>}
                        {shot.use_for && <p className="lore-loc-shot-use mt-1 opacity-60">↳ {shot.use_for}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {scenario?.scenes && (() => {
            const matchedScenes = scenario.scenes.filter((s: Scene) => displaySceneIds.has(s.scene_id));
            return matchedScenes.length > 0 ? (
              <div className="lore-loc-detail-row lore-loc-scenes-row">
                <span className="lore-loc-detail-label">🎬 Scenes</span>
                <div className="lore-geo-scene-list">
                  {matchedScenes.map((scene: Scene) => (
                    <div key={scene.scene_id} className="lore-geo-scene-card">
                      <div className="lore-geo-scene-meta">
                        <span className="scene-id">Scene {scene.scene_id}</span>
                        <span className="scene-title">{scene.title}</span>
                      </div>
                      <p className="scene-beat">🎭 {scene.emotional_beat}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {showAddLoc && <AddLocationModal onClose={() => setShowAddLoc(false)} />}
      
      {showRequestView && (
        <RequestViewModal 
          onClose={() => setShowRequestView(false)} 
          onSubmit={handleAddShotSubmit} 
        />
      )}

      {showAddColor && (
        <AddPaletteColorModal 
          onClose={() => setShowAddColor(false)} 
          onSubmit={(hex) => {
            handleAddPaletteColor(hex);
            setShowAddColor(false);
          }} 
        />
      )}
    </div>
  );
};
