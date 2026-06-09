/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { IndonesianEvent } from '../types';
import { MapPin, Calendar, Award, Compass, Search, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IndonesiaMapProps {
  events: IndonesianEvent[];
  activeEventId?: string;
  onSelectEvent?: (event: IndonesianEvent) => void;
  height?: string;
  showAllPinOnDetail?: boolean;
}

// Coordinate bounding box for Indonesia map projection
const MIN_LNG = 94.5;
const MAX_LNG = 141.5;
const MIN_LAT = -11.5;
const MAX_LAT = 6.5;

// Island outline geographical simplified paths for alignment
const ISLANDS = [
  {
    name: 'Sumatra',
    points: [
      [95.3, 5.5], [98.6, 3.6], [101.4, 0.5], [104.7, -3.0], 
      [105.4, -5.9], [104.9, -5.2], [102.3, -3.8], [100.4, -0.9],
      [97.5, 2.0], [95.2, 5.5]
    ]
  },
  {
    name: 'Java',
    points: [
      [105.1, -5.9], [106.8, -6.2], [109.0, -6.9], [111.0, -6.8],
      [112.7, -7.2], [114.6, -8.3], [114.2, -8.7], [112.0, -8.2],
      [110.0, -8.0], [107.5, -7.5], [105.2, -6.9], [105.1, -5.9]
    ]
  },
  {
    name: 'Kalimantan',
    points: [
      [108.9, 1.0], [109.8, 2.0], [111.5, 1.0], [112.5, 3.5],
      [114.0, 4.2], [115.5, 4.3], [118.0, 3.5], [119.0, 2.0],
      [117.2, -0.5], [116.8, -1.2], [114.6, -3.3], [113.8, -3.4],
      [111.5, -3.0], [110.0, -2.5], [108.9, -1.5], [108.9, 1.0]
    ]
  },
  {
    name: 'Sulawesi',
    points: [
      [119.4, -5.6], [119.0, -3.0], [119.5, -1.0], [121.5, -1.0],
      [122.5, 0.5], [124.9, 1.6], [125.0, 1.0], [123.0, 0.2],
      [122.0, -1.0], [121.5, -1.5], [122.5, -3.0],
      [122.5, -5.3], [121.2, -5.3], [121.0, -3.5], [120.2, -3.5],
      [120.3, -5.6], [119.4, -5.6]
    ]
  },
  {
    name: 'Papua',
    points: [
      [130.8, -0.8], [132.5, -1.0], [134.0, -2.5], [135.0, -1.5],
      [137.0, -1.8], [139.0, -2.5], [141.0, -2.6], [141.0, -9.1],
      [139.0, -8.1], [137.0, -8.3], [134.5, -4.8], [132.5, -5.0],
      [130.2, -3.0], [130.8, -0.8]
    ]
  },
  {
    name: 'Bali',
    points: [
      [114.5, -8.1], [115.6, -8.2], [115.7, -8.8], [114.4, -8.5], [114.5, -8.1]
    ]
  },
  {
    name: 'Lombok',
    points: [
      [116.0, -8.3], [116.6, -8.3], [116.6, -8.9], [116.0, -8.9], [116.0, -8.3]
    ]
  },
  {
    name: 'Sumbawa',
    points: [
      [116.9, -8.4], [119.2, -8.4], [119.0, -8.9], [117.0, -8.9], [116.9, -8.4]
    ]
  },
  {
    name: 'Flores',
    points: [
      [119.7, -8.4], [123.0, -8.3], [122.5, -8.8], [119.8, -8.8], [119.7, -8.4]
    ]
  },
  {
    name: 'Timor',
    points: [
      [123.5, -10.2], [125.1, -8.9], [125.1, -9.3], [124.0, -10.4], [123.5, -10.2]
    ]
  },
  {
    name: 'Halmahera',
    points: [
      [127.3, 2.0], [128.5, 2.0], [128.0, 0.5], [127.3, 2.0]
    ]
  },
  {
    name: 'Seram',
    points: [
      [128.0, -3.0], [131.0, -3.0], [130.8, -3.4], [128.0, -3.3], [128.0, -3.0]
    ]
  }
];

export const IndonesiaMap: React.FC<IndonesiaMapProps> = ({
  events,
  activeEventId,
  onSelectEvent,
  height = 'h-[360px]',
  showAllPinOnDetail = true
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [hoveredEvent, setHoveredEvent] = useState<IndonesianEvent | null>(null);
  const [selectedPin, setSelectedPin] = useState<IndonesianEvent | null>(null);

  // Helper coordinate projector
  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 1000;
    // latitude decreases as down in SVG box
    const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * 400;
    return { x, y };
  };

  // Turn island points into SVG polygon strings
  const compilePolygonPoints = (points: number[][]) => {
    return points
      .map(([lng, lat]) => {
        const { x, y } = projectCoords(lat, lng);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // Render grid lines for a technical navigational overlay
  const gridLines = useMemo(() => {
    const lines = [];
    // Longitudes lines every 5 degrees
    for (let lng = 95; lng <= 140; lng += 5) {
      const { x: x1 } = projectCoords(0, lng);
      lines.push(
        <line
          key={`lng-${lng}`}
          x1={x1}
          y1={0}
          x2={x1}
          y2={400}
          className="stroke-slate-100 dark:stroke-slate-800/10"
          strokeWidth="0.8"
          strokeDasharray="4 4"
        />
      );
    }
    // Latitudes lines every 2 degrees
    for (let lat = -10; lat <= 5; lat += 2) {
      const { y: y1 } = projectCoords(lat, 110);
      lines.push(
        <line
          key={`lat-${lat}`}
          x1={0}
          y1={y1}
          x2={1000}
          y2={y1}
          className="stroke-slate-100 dark:stroke-slate-800/10"
          strokeWidth="0.8"
          strokeDasharray="4 4"
        />
      );
    }
    return lines;
  }, []);

  // Filter valid coordinates events
  const validEvents = useMemo(() => {
    const list = events.filter((e) => e.latitude !== undefined && e.longitude !== undefined);
    if (activeEventId && !showAllPinOnDetail) {
      return list.filter((e) => e.id === activeEventId);
    }
    return list;
  }, [events, activeEventId, showAllPinOnDetail]);

  const activeEventObj = useMemo(() => {
    return events.find((e) => e.id === activeEventId);
  }, [events, activeEventId]);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.5, 3));
  const handleZoomOut = () => {
    setZoomLevel((z) => {
      const nextZoom = Math.max(z - 0.5, 1);
      if (nextZoom === 1) {
        setOffsetX(0);
        setOffsetY(0);
      }
      return nextZoom;
    });
  };

  const resetPanAndZoom = () => {
    setZoomLevel(1);
    setOffsetX(0);
    setOffsetY(0);
    setSelectedPin(null);
  };

  return (
    <div className={`relative w-full rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden ${height} select-none`}>
      {/* Map Control widgets */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-1.5 rounded-lg border border-slate-250/20 bg-white/90 backdrop-blur-md p-1 shadow-sm">
        <button
          onClick={handleZoomIn}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-50 text-slate-600 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          disabled={zoomLevel === 1}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={resetPanAndZoom}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-50 text-slate-600 transition-colors"
          title="Compass Standard View"
        >
          <Compass className="h-4 w-4" />
        </button>
      </div>

      {/* Top Left Compass Details */}
      <div className="absolute top-4 left-4 z-10 font-mono text-[9px] font-bold text-slate-400 tracking-wider">
        <div className="flex items-center space-x-1.5 uppercase">
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-ping" />
          <span>INDONESIAN EVENT COORDS SYSTEM</span>
        </div>
        <div className="mt-1 text-slate-400 font-medium">
          WGS 84 • MERCATOR PROJECT • MAP ACTIVE
        </div>
      </div>

      {/* Main SVG Render Window */}
      <div className="absolute inset-0 h-full w-full">
        <svg
          viewBox="0 0 1000 400"
          className="h-full w-full transition-transform duration-300 ease-out fill-slate-100"
          style={{
            transform: `scale(${zoomLevel}) translate(${offsetX}px, ${offsetY}px)`,
            transformOrigin: 'center center',
          }}
          id="indonesia-svg-canvas"
        >
          {/* Grid coordinates indicators overlay */}
          {gridLines}

          {/* Archipelago boundary polygons */}
          <g className="island-layers" id="indonesia-archipelago">
            {ISLANDS.map((island) => (
              <polygon
                key={island.name}
                id={`island-${island.name.toLowerCase()}`}
                points={compilePolygonPoints(island.points)}
                className="fill-slate-100 hover:fill-slate-200/80 stroke-slate-200 transition-colors duration-300"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            ))}
          </g>

          {/* Connected Route Paths on Detail pages (e.g. Semarang to Borobudur) */}
          {activeEventObj && activeEventObj.id === 'evt-tour-borobudur-2026' && (
            <motion.path
              d={`M ${projectCoords(-6.9932, 110.4203).x} ${projectCoords(-6.9932, 110.4203).y} Q ${projectCoords(-7.3, 110.3).x} ${projectCoords(-7.3, 110.3).y} ${projectCoords(-7.6079, 110.2038).x} ${projectCoords(-7.6079, 110.2038).y}`}
              className="fill-none stroke-cyan-500"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="6, 4"
              initial={{ strokeDashoffset: 100 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
            />
          )}

          {/* Pins Overlay Group */}
          <g className="event-pins-group">
            {validEvents.map((evt) => {
              const { x, y } = projectCoords(evt.latitude!, evt.longitude!);
              const isActive = evt.id === activeEventId;
              const isSelected = selectedPin?.id === evt.id;

              return (
                <g
                  key={evt.id}
                  id={`pin-${evt.id}`}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedPin(evt);
                    if (onSelectEvent) {
                      onSelectEvent(evt);
                    }
                  }}
                  onMouseEnter={() => setHoveredEvent(evt)}
                  onMouseLeave={() => setHoveredEvent(null)}
                >
                  {/* Glowing Pulse Rings for Active Events */}
                  {(isActive || isSelected) && (
                    <>
                      <circle
                        cx={x}
                        cy={y}
                        r="20"
                        className="fill-cyan-400/20 stroke-none animate-ping"
                        style={{ transformOrigin: `${x}px ${y}px` }}
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="12"
                        className="fill-cyan-400/30 stroke-cyan-500/50"
                        strokeWidth="1.2"
                      />
                    </>
                  )}

                  {/* Standard coordinate map locator marker bubble */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive || isSelected ? '7' : '5'}
                    className={`stroke-white shadow-sm transition-all duration-300 ${
                      isActive 
                        ? 'fill-cyan-500 stroke-2' 
                        : isSelected 
                        ? 'fill-cyan-400 stroke-2' 
                        : 'fill-slate-900 group-hover:fill-cyan-500 stroke-1'
                    }`}
                  />
                  
                  {/* Visual labels next to major pins */}
                  <text
                    x={x + 10}
                    y={y + 3}
                    className="font-mono font-bold tracking-tight text-[8px] pointer-events-none drop-shadow-sm select-none"
                    fill={isActive || isSelected ? '#0891b2' : '#64748b'}
                  >
                    {evt.city}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Event Tooltip and Details Popup Info Card Overlay */}
      <AnimatePresence>
        {(hoveredEvent || selectedPin) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:w-80 z-25 rounded-2xl border border-slate-100 bg-white/95 backdrop-blur-md p-4 shadow-lg"
          >
            {(() => {
              const currentEvent = hoveredEvent || selectedPin!;
              const isHighlight = currentEvent.id === activeEventId;
              return (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex rounded-full bg-slate-950 px-2 py-0.5 text-[8px] font-extrabold text-cyan-400 uppercase tracking-widest leading-normal">
                      {currentEvent.category}
                    </span>
                    {isHighlight && (
                      <span className="text-[8px] font-extrabold text-cyan-600 tracking-wider uppercase bg-cyan-50 px-2 py-0.5 rounded-full">
                        Viewing Now
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <img 
                      src={currentEvent.banner} 
                      alt="" 
                      className="h-10 w-14 rounded-lg object-cover bg-slate-100 border border-slate-200/40"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-sans text-[13px] font-extrabold text-slate-950 truncate">
                        {currentEvent.title}
                      </h4>
                      <p className="font-sans text-[10px] text-slate-400 font-semibold truncate flex items-center mt-0.5">
                        <MapPin className="h-3 w-3 mr-1 shrink-0 text-slate-400" />
                        {currentEvent.city}, {currentEvent.province}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100 font-semibold">
                    <span className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      {new Date(currentEvent.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                    {onSelectEvent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectEvent) {
                            onSelectEvent(currentEvent);
                          }
                        }}
                        className="text-cyan-600 hover:text-cyan-700 font-bold flex items-center space-x-0.5"
                      >
                        <span>Explore details</span>
                        <Maximize2 className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating search helper */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none hidden md:flex items-center space-x-2 text-[10px] font-bold text-slate-400">
        <Compass className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '6s' }} />
        <span>HOVER OR CLICK MARKERS TO NAVIGATE DEEPER</span>
      </div>
    </div>
  );
};
