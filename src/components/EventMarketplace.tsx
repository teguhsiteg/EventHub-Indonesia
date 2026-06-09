/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { 
  Search, SlidersHorizontal, Calendar, MapPin, 
  ArrowUpDown, Grid, RefreshCw, Layers, Compass 
} from 'lucide-react';
import { IndonesiaMap } from './IndonesiaMap';

interface EventMarketplaceProps {
  onNavigate: (view: 'landing' | 'marketplace' | 'detail' | 'checkout' | 'dashboard', extraEventId?: string) => void;
}

export const EventMarketplace: React.FC<EventMarketplaceProps> = ({ onNavigate }) => {
  const { events, language, t } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedPriceMax, setSelectedPriceMax] = useState<number>(3000000);
  const [sortOption, setSortOption] = useState<'newest' | 'popular' | 'upcoming'>('upcoming');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showMap, setShowMap] = useState(true);

  // Derive unique provinces / cities for filters from actual events
  const provinces = useMemo(() => {
    const list = events.map(e => e.province);
    return ['all', ...Array.from(new Set(list))];
  }, [events]);

  const cities = useMemo(() => {
    const list = events
      .filter(e => selectedProvince === 'all' || e.province === selectedProvince)
      .map(e => e.city);
    return ['all', ...Array.from(new Set(list))];
  }, [events, selectedProvince]);

  // Filters process
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.description.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.province.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(e => e.category === selectedCategory);
    }

    // Province filter
    if (selectedProvince !== 'all') {
      result = result.filter(e => e.province === selectedProvince);
    }

    // City filter
    if (selectedCity !== 'all') {
      result = result.filter(e => e.city === selectedCity);
    }

    // Price range filter (based on minimum price category)
    result = result.filter(e => {
      const minPrice = e.categories.reduce((min, c) => c.price < min ? c.price : min, e.categories[0]?.price || 0);
      return minPrice <= selectedPriceMax;
    });

    // Sorting
    if (sortOption === 'newest') {
      // Sort by creation or simply arbitrary reverse sorting
      result.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortOption === 'popular') {
      result.sort((a, b) => b.viewsCount - a.viewsCount);
    } else if (sortOption === 'upcoming') {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    return result;
  }, [events, searchQuery, selectedCategory, selectedProvince, selectedCity, selectedPriceMax, sortOption]);

  const categoriesList = ['all', 'Running', 'Trail Run', 'Cycling', 'Triathlon', 'Festival', 'Seminar', 'Community'];

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedProvince('all');
    setSelectedCity('all');
    setSelectedPriceMax(3000000);
    setSortOption('upcoming');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page title */}
        <div className="mb-8">
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {language === 'id' ? 'Pasar Turnamen & Lomba' : 'Tournament Marketplace'}
          </h1>
          <p className="mt-1 font-sans text-sm text-slate-500">
            {language === 'id' ? 'Amankan slot Anda di perlombaan premium, puncak trail lari, dan pertemuan komunitas besar.' : 'Secure your slot in the premium races, trail summits, and major community gatherings.'}
          </p>
        </div>

        {/* Dynamic Controls Hub */}
        <div className="mb-10 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute top-3.5 left-4 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'id' ? "Cari judul event, kota, panduan..." : "Search event title, cities, guidelines..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3.5 pl-11 pr-4 font-sans text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:outline-hidden transition-all"
                id="search-input"
              />
            </div>

            {/* Quick selectors for Sorting and Advanced toggle */}
            <div className="flex flex-wrap items-center gap-3">
              
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="h-4 w-4 text-slate-400" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
                  id="sort-select"
                >
                  <option value="upcoming">{language === 'id' ? 'Terdekat Pertama' : 'Upcoming First'}</option>
                  <option value="popular">{language === 'id' ? 'Terpopuler' : 'Most Popular'}</option>
                  <option value="newest">{language === 'id' ? 'Baru Ditambahkan' : 'Recently Added'}</option>
                </select>
              </div>

              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center space-x-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                  showAdvancedFilters 
                    ? 'border-cyan-400 bg-cyan-50/50 text-cyan-700' 
                    : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
                id="toggle-filters-btn"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </button>

              <button
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center space-x-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                  showMap 
                    ? 'border-cyan-400 bg-cyan-50/50 text-cyan-700' 
                    : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
                id="toggle-map-btn"
              >
                <Compass className="h-4 w-4" />
                <span>Map Tracker</span>
              </button>

              <button
                onClick={resetFilters}
                className="rounded-xl border border-slate-100 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-950 transition-colors"
                title="Reset Filters"
                id="reset-filters-btn"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

          </div>

          {/* Expanded Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mt-5 grid gap-5 border-t border-slate-50 pt-5 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-200">
              
              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-hidden"
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                  ))}
                </select>
              </div>

              {/* Province */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Province</label>
                <select
                  value={selectedProvince}
                  onChange={(e) => {
                    setSelectedProvince(e.target.value);
                    setSelectedCity('all'); // reset city
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-hidden"
                >
                  {provinces.map(prov => (
                    <option key={prov} value={prov}>{prov === 'all' ? 'All Provinces' : prov}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-hidden"
                  disabled={selectedProvince === 'all'}
                >
                  {cities.map(ct => (
                    <option key={ct} value={ct}>{ct === 'all' ? 'All Cities' : ct}</option>
                  ))}
                </select>
              </div>

              {/* Price Band Slider */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Max Entry Fee</label>
                  <span className="font-mono text-xs font-bold text-cyan-600">
                    {selectedPriceMax === 3000000 ? 'Any' : `Rp ${selectedPriceMax.toLocaleString('id-ID')}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3000000}
                  step={100000}
                  value={selectedPriceMax}
                  onChange={(e) => setSelectedPriceMax(Number(e.target.value))}
                  className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-cyan-500"
                />
              </div>

            </div>
          )}
        </div>

        {showMap && (
          <div className="mb-10 animate-in fade-in duration-300">
            <div className="mb-3.5 flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Archipelago Event Tracker Map</h3>
              <p className="text-[9px] text-slate-450 font-bold font-mono uppercase tracking-wider">
                Showing {filteredEvents.filter(e => e.latitude !== undefined).length} active coordinates
              </p>
            </div>
            <IndonesiaMap 
              events={filteredEvents} 
              onSelectEvent={(evt) => onNavigate('detail', evt.id)}
            />
          </div>
        )}

        {/* Categories Fast Filter Strip */}
        <div className="mb-8 flex space-x-2 overflow-x-auto pb-2 custom-scrollbar">
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200/60 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'All Sports' : cat}
            </button>
          ))}
        </div>

        {/* Pinterest Style Masonry / Bento Grid Layout */}
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-24 text-center">
            <Layers className="h-10 w-10 text-slate-300" />
            <h3 className="mt-4 font-sans text-base font-extrabold text-slate-900">No Events Found</h3>
            <p className="mt-1 max-w-sm font-sans text-xs text-slate-400">
              We couldn&apos;t find any events matching your selected filter guidelines. Try clear queries or reset all sliders.
            </p>
            <button
              onClick={resetFilters}
              className="mt-6 rounded-xl bg-slate-900 px-4.5 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
            >
              Clear Filter Set
            </button>
          </div>
        ) : (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3" id="masonry-event-grid">
            {filteredEvents.map((evt, idx) => {
              const minPrice = evt.categories.reduce((min, c) => c.price < min ? c.price : min, evt.categories[0]?.price || 0);
              
              // Generate slightly randomized heights for natural masonry looks on desktop
              const heightClass = idx % 3 === 0 ? 'h-52' : idx % 3 === 1 ? 'h-64' : 'h-48';

              return (
                <motion.div
                  key={evt.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="break-inside-avoid mb-6 flex flex-col bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-xl hover:border-slate-200/50 transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => onNavigate('detail', evt.id)}
                >
                  {/* Event Cover Banner */}
                  <div className={`relative ${heightClass} w-full overflow-hidden bg-slate-100`}>
                    <img
                      src={evt.banner}
                      alt={evt.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
                    />
                    <div className="absolute top-4 left-4 rounded-full bg-slate-950/80 backdrop-blur-md px-3 py-1 text-[9px] font-extrabold text-cyan-400 tracking-wider uppercase">
                      {evt.category}
                    </div>
                    {evt.isFeatured && (
                      <div className="absolute top-4 right-4 rounded-full bg-cyan-500 px-2.5 py-1 text-[9px] font-extrabold text-slate-950 tracking-wider uppercase shadow-xs">
                        FEATURED
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    {/* Location Badge */}
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{evt.city}, {evt.province}</span>
                    </div>

                    {/* Title */}
                    <h3 className="mt-2.5 font-sans text-base font-extrabold text-slate-900 group-hover:text-cyan-600 transition-colors">
                      {evt.title}
                    </h3>

                    {/* Brief description in bento cards */}
                    <p className="mt-2 font-sans text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {evt.description}
                    </p>

                    {/* Event Info Grid summary */}
                    <div className="mt-6 flex items-center space-x-1.5 text-xs text-slate-500">
                      <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>
                        {new Date(evt.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Price and Action */}
                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Starting Price</p>
                        <p className="font-mono text-sm font-extrabold text-slate-900 mt-0.5">
                          {minPrice === 0 ? 'FREE' : `IDR ${(minPrice).toLocaleString('id-ID')}`}
                        </p>
                      </div>
                      <span className="rounded-xl border border-slate-100 bg-slate-50 group-hover:bg-cyan-50 group-hover:text-cyan-700 px-3.5 py-2 font-sans text-[11px] font-bold text-slate-700 transition-colors">
                        Register
                      </span>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
