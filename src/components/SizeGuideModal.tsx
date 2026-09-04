/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Ruler, Info, Scale, ArrowRight, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
  onSelectSize?: (size: string) => void;
}

interface SizingRow {
  size: string;
  chest: string;
  length: string;
  sleeve: string;
  shoulder: string;
  waist?: string;
}

const SIZING_DATA: Record<string, SizingRow[]> = {
  panjabi: [
    { size: '38', chest: '38"', length: '40"', sleeve: '24"', shoulder: '17.5"' },
    { size: '40', chest: '40"', length: '42"', sleeve: '24.5"', shoulder: '18"' },
    { size: '42', chest: '42"', length: '44"', sleeve: '25"', shoulder: '18.5"' },
    { size: '44', chest: '44"', length: '45"', sleeve: '25.5"', shoulder: '19"' },
    { size: '46', chest: '46"', length: '46"', sleeve: '26"', shoulder: '19.5"' },
    { size: '48', chest: '48"', length: '47"', sleeve: '26.5"', shoulder: '20"' },
    { size: '50', chest: '50"', length: '48"', sleeve: '27"', shoulder: '20.5"' }
  ],
  kabli: [
    { size: '38', chest: '40"', length: '41"', sleeve: '24"', shoulder: '17.5"' },
    { size: '40', chest: '42"', length: '43"', sleeve: '24.5"', shoulder: '18"' },
    { size: '42', chest: '44"', length: '45"', sleeve: '25"', shoulder: '18.5"' },
    { size: '44', chest: '46"', length: '46"', sleeve: '25.5"', shoulder: '19"' },
    { size: '46', chest: '48"', length: '47"', sleeve: '26"', shoulder: '19.5"' },
    { size: '48', chest: '50"', length: '48"', sleeve: '26.5"', shoulder: '20"' },
    { size: '50', chest: '52"', length: '49"', sleeve: '27"', shoulder: '20.5"' }
  ],
  koti: [
    { size: '38', chest: '39"', length: '26"', sleeve: 'N/A', shoulder: '15.5"' },
    { size: '40', chest: '41"', length: '27"', sleeve: 'N/A', shoulder: '16"' },
    { size: '42', chest: '43"', length: '28"', sleeve: 'N/A', shoulder: '16.5"' },
    { size: '44', chest: '45"', length: '29"', sleeve: 'N/A', shoulder: '17"' },
    { size: '46', chest: '47"', length: '30"', sleeve: 'N/A', shoulder: '17.5"' },
    { size: '48', chest: '49"', length: '31"', sleeve: 'N/A', shoulder: '18"' },
    { size: '50', chest: '51"', length: '32"', sleeve: 'N/A', shoulder: '18.5"' }
  ],
  sherwani: [
    { size: '38', chest: '40"', length: '44"', sleeve: '25"', shoulder: '18"' },
    { size: '40', chest: '42"', length: '45"', sleeve: '25.5"', shoulder: '18.5"' },
    { size: '42', chest: '44"', length: '46"', sleeve: '26"', shoulder: '19"' },
    { size: '44', chest: '46"', length: '47"', sleeve: '26.5"', shoulder: '19.5"' },
    { size: '46', chest: '48"', length: '48"', sleeve: '27"', shoulder: '20"' },
    { size: '48', chest: '50"', length: '49"', sleeve: '27.5"', shoulder: '20.5"' },
    { size: '50', chest: '52"', length: '50"', sleeve: '28"', shoulder: '21"' }
  ],
  jubbah: [
    { size: '38', chest: '42"', length: '52"', sleeve: '23.5"', shoulder: '17.5"' },
    { size: '40', chest: '44"', length: '54"', sleeve: '24.5"', shoulder: '18"' },
    { size: '42', chest: '46"', length: '56"', sleeve: '25.5"', shoulder: '18.5"' },
    { size: '44', chest: '48"', length: '58"', sleeve: '26.5"', shoulder: '19"' },
    { size: '46', chest: '50"', length: '60"', sleeve: '27.5"', shoulder: '19.5"' },
    { size: '48', chest: '52"', length: '62"', sleeve: '28.5"', shoulder: '20"' },
    { size: '50', chest: '54"', length: '64"', sleeve: '29.5"', shoulder: '20.5"' }
  ],
  pajama: [
    { size: '38', chest: 'N/A', length: '38"', sleeve: 'N/A', shoulder: 'N/A', waist: '28" - 32"' },
    { size: '40', chest: 'N/A', length: '40"', sleeve: 'N/A', shoulder: 'N/A', waist: '30" - 34"' },
    { size: '42', chest: 'N/A', length: '42"', sleeve: 'N/A', shoulder: 'N/A', waist: '32" - 36"' },
    { size: '44', chest: 'N/A', length: '44"', sleeve: 'N/A', shoulder: 'N/A', waist: '34" - 38"' },
    { size: '46', chest: 'N/A', length: '46"', sleeve: 'N/A', shoulder: 'N/A', waist: '36" - 40"' },
    { size: '48', chest: 'N/A', length: '48"', sleeve: 'N/A', shoulder: 'N/A', waist: '38" - 42"' },
    { size: '50', chest: 'N/A', length: '50"', sleeve: 'N/A', shoulder: 'N/A', waist: '40" - 44"' }
  ],
  kids: [
    { size: '18', chest: '22"', length: '20"', sleeve: '11"', shoulder: '9.5"' },
    { size: '20', chest: '24"', length: '22"', sleeve: '12"', shoulder: '10"' },
    { size: '22', chest: '26"', length: '24"', sleeve: '13"', shoulder: '10.5"' },
    { size: '24', chest: '28"', length: '26"', sleeve: '14"', shoulder: '11"' },
    { size: '26', chest: '30"', length: '28"', sleeve: '15"', shoulder: '11.5"' },
    { size: '28', chest: '32"', length: '30"', sleeve: '16"', shoulder: '12"' },
    { size: '30', chest: '34"', length: '32"', sleeve: '17"', shoulder: '12.5"' },
    { size: '32', chest: '36"', length: '34"', sleeve: '18"', shoulder: '13"' },
    { size: '34', chest: '37"', length: '36"', sleeve: '19"', shoulder: '13.5"' },
    { size: '36', chest: '38"', length: '38"', sleeve: '20"', shoulder: '14"' }
  ]
};

export default function SizeGuideModal({ isOpen, onClose, defaultCategory = 'panjabi', onSelectSize }: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<string>(
    defaultCategory && SIZING_DATA[defaultCategory.toLowerCase()] ? defaultCategory.toLowerCase() : 'panjabi'
  );

  const [viewMode, setViewMode] = useState<'calculator' | 'chart'>('calculator');

  // Input states for size calculator
  const [heightUnit, setHeightUnit] = useState<'ft' | 'cm'>('ft');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(7);
  const [heightCm, setHeightCm] = useState<number>(170);
  const [weightVal, setWeightVal] = useState<number>(70);

  const categories = [
    { id: 'panjabi', name: 'Panjabi' },
    { id: 'kabli', name: 'Kabli' },
    { id: 'koti', name: 'Koti' },
    { id: 'sherwani', name: 'Sherwani' },
    { id: 'jubbah', name: 'Jubbah' },
    { id: 'pajama', name: 'Pajama' },
    { id: 'kids', name: 'Kids' }
  ];

  // Dynamically update height and weight defaults when switching between kids and adult collections
  useEffect(() => {
    if (activeTab === 'kids') {
      if (heightFt >= 5) {
        setHeightFt(3);
        setHeightIn(4);
        setHeightCm(100);
        setWeightVal(weightUnit === 'kg' ? 18 : 40);
      }
    } else {
      if (heightFt < 4) {
        setHeightFt(5);
        setHeightIn(7);
        setHeightCm(170);
        setWeightVal(weightUnit === 'kg' ? 70 : 154);
      }
    }
  }, [activeTab]);

  const handleWeightUnitChange = (newUnit: 'kg' | 'lbs') => {
    if (newUnit === weightUnit) return;
    if (newUnit === 'kg') {
      setWeightVal(Math.round(weightVal * 0.453592));
    } else {
      setWeightVal(Math.round(weightVal / 0.453592));
    }
    setWeightUnit(newUnit);
  };

  const handleHeightUnitChange = (newUnit: 'ft' | 'cm') => {
    if (newUnit === heightUnit) return;
    if (newUnit === 'cm') {
      const totalInches = heightFt * 12 + heightIn;
      setHeightCm(Math.round(totalInches * 2.54));
    } else {
      const totalInches = heightCm / 2.54;
      const ft = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      setHeightFt(Math.min(7, Math.max(2, ft)));
      setHeightIn(Math.min(11, Math.max(0, inches)));
    }
    setHeightUnit(newUnit);
  };

  // Physical Sizing Heuristics
  const estimateKidSize = (heightInches: number, weightKg: number): string => {
    let hSize = 18;
    if (heightInches >= 56) hSize = 36;
    else if (heightInches >= 53) hSize = 34;
    else if (heightInches >= 50) hSize = 32;
    else if (heightInches >= 47) hSize = 30;
    else if (heightInches >= 44) hSize = 28;
    else if (heightInches >= 41) hSize = 26;
    else if (heightInches >= 38) hSize = 24;
    else if (heightInches >= 35) hSize = 22;
    else if (heightInches >= 32) hSize = 20;
    else hSize = 18;

    let wSize = 18;
    if (weightKg >= 40) wSize = 36;
    else if (weightKg >= 35) wSize = 34;
    else if (weightKg >= 30) wSize = 32;
    else if (weightKg >= 26) wSize = 30;
    else if (weightKg >= 22) wSize = 28;
    else if (weightKg >= 19) wSize = 26;
    else if (weightKg >= 16) wSize = 24;
    else if (weightKg >= 14) wSize = 22;
    else if (weightKg >= 12) wSize = 20;
    else wSize = 18;

    return Math.max(hSize, wSize).toString();
  };

  const estimateAdultSize = (heightInches: number, weightKg: number): string => {
    const estChest = 28 + Math.max(0, weightKg - 45) * 0.28 + Math.max(0, heightInches - 60) * 0.1;
    
    let size = 38;
    if (estChest >= 45) size = 50;
    else if (estChest >= 43) size = 48;
    else if (estChest >= 41) size = 46;
    else if (estChest >= 39) size = 44;
    else if (estChest >= 37) size = 42;
    else if (estChest >= 35) size = 40;
    else size = 38;

    let minSizeForLength = 38;
    if (heightInches >= 73) {
      minSizeForLength = 44;
    } else if (heightInches >= 71) {
      minSizeForLength = 42;
    } else if (heightInches >= 68) {
      minSizeForLength = 40;
    }

    return Math.max(size, minSizeForLength).toString();
  };

  const totalHeightInches = heightUnit === 'ft' 
    ? (heightFt * 12 + heightIn) 
    : (heightCm / 2.54);

  const weightInKg = weightUnit === 'kg' 
    ? weightVal 
    : (weightVal * 0.453592);

  const recommendedSizeStr = activeTab === 'kids'
    ? estimateKidSize(totalHeightInches, weightInKg)
    : estimateAdultSize(totalHeightInches, weightInKg);

  const matchedRow = SIZING_DATA[activeTab]?.find((row) => row.size === recommendedSizeStr);

  const handleApplySize = () => {
    if (onSelectSize) {
      onSelectSize(recommendedSizeStr);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="size-guide-modal-root" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1F1B17]/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Size Chart and Fit Calculator"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-3xl bg-white border border-[#E8DFC8] rounded-2xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col text-[#1F1B17] font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8DFC8] bg-[#FAF8F5]">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-[#FAF6ED] border border-[#C5A059]/40 flex items-center justify-center">
                  <Ruler className="h-4.5 w-4.5 text-[#8C6819]" />
                </div>
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold tracking-wider text-[#1F1B17]">
                    SIZE CHART & FIT CALCULATOR
                  </h2>
                  <p className="text-[10px] text-[#6E645A] font-sans uppercase tracking-widest mt-0.5">
                    Virsa Bespoke Tailor Masterclass
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 text-[#6E645A] hover:text-[#1F1B17] rounded-full hover:bg-white transition-all border border-[#E8DFC8] cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Category Navigation Tabs */}
            <div className="flex overflow-x-auto bg-[#FAF8F5] border-b border-[#E8DFC8] px-4 scrollbar-none">
              {categories.map((cat) => {
                const active = activeTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`py-3.5 px-4 text-xs font-sans font-bold tracking-widest uppercase border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? 'border-[#C5A059] text-[#8C6819]'
                        : 'border-transparent text-[#6E645A] hover:text-[#1F1B17] hover:border-[#E8DFC8]'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Sub-Tabs: Calculator Mode vs Standard Sizing Chart Table */}
            <div className="flex border-b border-[#E8DFC8] bg-white px-6 py-2.5 justify-start space-x-3">
              <button
                onClick={() => setViewMode('calculator')}
                className={`px-4 py-1.5 text-xs font-sans tracking-wide uppercase font-semibold rounded-full transition-all cursor-pointer ${
                  viewMode === 'calculator'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] font-bold shadow-2xs'
                    : 'bg-[#FAF8F5] text-[#6E645A] hover:text-[#1F1B17]'
                }`}
              >
                1. Size Calculator
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-4 py-1.5 text-xs font-sans tracking-wide uppercase font-semibold rounded-full transition-all cursor-pointer ${
                  viewMode === 'chart'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#1F1B17] font-bold shadow-2xs'
                    : 'bg-[#FAF8F5] text-[#6E645A] hover:text-[#1F1B17]'
                }`}
              >
                2. Size Chart Table
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
              {viewMode === 'calculator' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Interactive Sliders Form */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-serif font-bold tracking-wider text-[#5C5248] uppercase mb-4">
                        ENTER YOUR PROPORTIONS
                      </h3>
                      
                      {/* Height Segment */}
                      <div className="space-y-3 p-4 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8]">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-serif font-bold tracking-wide text-[#1F1B17] uppercase">
                            HEIGHT
                          </label>
                          <div className="flex rounded-lg overflow-hidden border border-[#E8DFC8] text-[10px] font-mono">
                            <button
                              onClick={() => handleHeightUnitChange('ft')}
                              className={`px-2.5 py-1 font-bold ${heightUnit === 'ft' ? 'bg-[#C5A059] text-[#1F1B17]' : 'text-[#6E645A] bg-white'}`}
                            >
                              FT/IN
                            </button>
                            <button
                              onClick={() => handleHeightUnitChange('cm')}
                              className={`px-2.5 py-1 font-bold ${heightUnit === 'cm' ? 'bg-[#C5A059] text-[#1F1B17]' : 'text-[#6E645A] bg-white'}`}
                            >
                              CM
                            </button>
                          </div>
                        </div>

                        {heightUnit === 'ft' ? (
                          <div className="space-y-4 pt-1">
                            {/* Feet Slider */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs text-[#6E645A] font-mono">
                                <span>Feet</span>
                                <span className="text-[#1F1B17] font-bold">{heightFt} ft</span>
                              </div>
                              <input
                                type="range"
                                aria-label="Height in feet"
                                min={activeTab === 'kids' ? '2' : '4'}
                                max={activeTab === 'kids' ? '5' : '7'}
                                value={heightFt}
                                onChange={(e) => setHeightFt(parseInt(e.target.value, 10))}
                                className="w-full h-1.5 bg-[#E8DFC8] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                              />
                            </div>
                            {/* Inches Slider */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs text-[#6E645A] font-mono">
                                <span>Inches</span>
                                <span className="text-[#1F1B17] font-bold">{heightIn} in</span>
                              </div>
                              <input
                                type="range"
                                aria-label="Height in inches"
                                min="0"
                                max="11"
                                value={heightIn}
                                onChange={(e) => setHeightIn(parseInt(e.target.value, 10))}
                                className="w-full h-1.5 bg-[#E8DFC8] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between text-xs text-[#6E645A] font-mono">
                              <span>Centimeters</span>
                              <span className="text-[#1F1B17] font-bold">{heightCm} cm</span>
                            </div>
                            <input
                              type="range"
                              aria-label="Height in centimeters"
                              min={activeTab === 'kids' ? '60' : '120'}
                              max={activeTab === 'kids' ? '150' : '220'}
                              value={heightCm}
                              onChange={(e) => setHeightCm(parseInt(e.target.value, 10))}
                              className="w-full h-1.5 bg-[#E8DFC8] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                            />
                          </div>
                        )}
                      </div>

                      {/* Weight Segment */}
                      <div className="space-y-3 p-4 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8] mt-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-serif font-bold tracking-wide text-[#1F1B17] uppercase flex items-center gap-1.5">
                            <Scale className="h-3.5 w-3.5 text-[#8C6819]" />
                            WEIGHT
                          </label>
                          <div className="flex rounded-lg overflow-hidden border border-[#E8DFC8] text-[10px] font-mono">
                            <button
                              onClick={() => handleWeightUnitChange('kg')}
                              className={`px-2.5 py-1 font-bold ${weightUnit === 'kg' ? 'bg-[#C5A059] text-[#1F1B17]' : 'text-[#6E645A] bg-white'}`}
                            >
                              KG
                            </button>
                            <button
                              onClick={() => handleWeightUnitChange('lbs')}
                              className={`px-2.5 py-1 font-bold ${weightUnit === 'lbs' ? 'bg-[#C5A059] text-[#1F1B17]' : 'text-[#6E645A] bg-white'}`}
                            >
                              LBS
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-xs text-[#6E645A] font-mono">
                            <span>Mass</span>
                            <span className="text-[#1F1B17] font-bold">{weightVal} {weightUnit}</span>
                          </div>
                          <input
                            type="range"
                            aria-label={`Weight in ${weightUnit}`}
                            min={activeTab === 'kids' ? (weightUnit === 'kg' ? '5' : '10') : (weightUnit === 'kg' ? '40' : '90')}
                            max={activeTab === 'kids' ? (weightUnit === 'kg' ? '50' : '110') : (weightUnit === 'kg' ? '150' : '330')}
                            value={weightVal}
                            onChange={(e) => setWeightVal(parseInt(e.target.value, 10))}
                            className="w-full h-1.5 bg-[#E8DFC8] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Results Card */}
                  <div className="space-y-4">
                    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#FAF6ED] via-white to-[#FAF8F5] border border-[#C5A059]/40 shadow-sm overflow-hidden flex flex-col justify-between h-full min-h-[290px]">
                      <div className="absolute top-3 right-3 p-1.5 bg-[#FAF6ED] border border-[#C5A059]/40 rounded-lg">
                        <Sparkles className="h-4 w-4 text-[#8C6819]" />
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-sans font-bold tracking-widest text-[#8C6819] uppercase">
                            RECOMMENDED ATELIER SIZE
                          </p>
                          <h4 className="text-6xl font-serif font-extrabold text-[#1F1B17] mt-2 tracking-tight">
                            {recommendedSizeStr}
                          </h4>
                        </div>

                        {matchedRow ? (
                          <div className="space-y-3 pt-2">
                            <p className="text-xs text-[#5C5248] font-sans leading-relaxed">
                              This fit is optimized for a height of{' '}
                              <strong className="text-[#1F1B17]">
                                {heightUnit === 'ft' ? `${heightFt}' ${heightIn}"` : `${heightCm} cm`}
                              </strong>{' '}
                              and a weight of{' '}
                              <strong className="text-[#1F1B17]">
                                {weightVal} {weightUnit}
                              </strong>.
                            </p>
                            
                            {/* Recommended Size Specs Table */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 py-3 border-t border-b border-[#E8DFC8] text-[11px] font-sans text-[#6E645A]">
                              {matchedRow.chest !== 'N/A' && (
                                <div>
                                  Chest Measure:{' '}
                                  <span className="text-[#1F1B17] font-semibold font-mono">{matchedRow.chest}</span>
                                </div>
                              )}
                              {matchedRow.waist && (
                                <div>
                                  Waist Range:{' '}
                                  <span className="text-[#1F1B17] font-semibold font-mono">{matchedRow.waist}</span>
                                </div>
                              )}
                              <div>
                                Garment Length:{' '}
                                <span className="text-[#1F1B17] font-semibold font-mono">{matchedRow.length}</span>
                              </div>
                              {matchedRow.sleeve !== 'N/A' && (
                                <div>
                                  Sleeve Length:{' '}
                                  <span className="text-[#1F1B17] font-semibold font-mono">{matchedRow.sleeve}</span>
                                </div>
                              )}
                              {matchedRow.shoulder !== 'N/A' && (
                                <div>
                                  Shoulder Width:{' '}
                                  <span className="text-[#1F1B17] font-semibold font-mono">{matchedRow.shoulder}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-[#6E645A] italic">Calculating exact measurements...</p>
                        )}
                      </div>

                      {onSelectSize ? (
                        <button
                          onClick={handleApplySize}
                          className="w-full mt-6 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] hover:brightness-110 text-[#1F1B17] font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                        >
                          <Check className="h-4 w-4" />
                          <span>Apply Size {recommendedSizeStr}</span>
                        </button>
                      ) : (
                        <button
                          onClick={onClose}
                          className="w-full mt-6 py-3.5 bg-white border border-[#E8DFC8] text-[#1F1B17] hover:border-[#C5A059] hover:bg-[#FAF6ED] font-sans font-semibold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
                        >
                          <span>Confirm Sizing Details</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Sizing Chart Table */}
                  <div className="flex items-start space-x-3 bg-[#FAF8F5] border border-[#E8DFC8] p-4 rounded-xl text-xs text-[#5C5248] leading-relaxed font-sans">
                    <Info className="h-4.5 w-4.5 text-[#8C6819] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-[#1F1B17]">How to Measure Your Perfect Fit:</p>
                      <p>
                        All dimensions are specified in inches. We recommend choosing a size that has a chest width{' '}
                        <strong className="text-[#1F1B17]">3 to 4 inches larger</strong> than your snug body chest measurement to ensure proper fluid movement and comfortable drape.
                      </p>
                    </div>
                  </div>

                  {/* Table wrapper */}
                  <div className="overflow-x-auto border border-[#E8DFC8] rounded-xl bg-white shadow-2xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#FAF8F5] border-b border-[#E8DFC8]">
                          <th className="py-3 px-4 text-[10px] font-sans font-bold tracking-widest uppercase text-[#5C5248]">Size (BD/US)</th>
                          {activeTab !== 'pajama' && (
                            <th className="py-3 px-4 text-[10px] font-sans font-bold tracking-widest uppercase text-[#5C5248]">Chest</th>
                          )}
                          {activeTab === 'pajama' && (
                            <th className="py-3 px-4 text-[10px] font-sans font-bold tracking-widest uppercase text-[#5C5248]">Waist Range</th>
                          )}
                          <th className="py-3 px-4 text-[10px] font-sans font-bold tracking-widest uppercase text-[#5C5248]">Length</th>
                          {activeTab !== 'pajama' && (
                            <>
                              <th className="py-3 px-4 text-[10px] font-sans font-bold tracking-widest uppercase text-[#5C5248]">Sleeve</th>
                              <th className="py-3 px-4 text-[10px] font-sans font-bold tracking-widest uppercase text-[#5C5248]">Shoulder</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8DFC8]">
                        {SIZING_DATA[activeTab]?.map((row) => (
                          <tr key={row.size} className="hover:bg-[#FAF8F5] transition-colors">
                            <td className="py-3 px-4 text-xs font-mono font-bold text-[#8C6819]">{row.size}</td>
                            {activeTab !== 'pajama' && (
                              <td className="py-3 px-4 text-xs font-mono text-[#1F1B17]">{row.chest}</td>
                            )}
                            {activeTab === 'pajama' && (
                              <td className="py-3 px-4 text-xs font-mono text-[#1F1B17]">{row.waist}</td>
                            )}
                            <td className="py-3 px-4 text-xs font-mono text-[#1F1B17]">{row.length}</td>
                            {activeTab !== 'pajama' && (
                              <>
                                <td className="py-3 px-4 text-xs font-mono text-[#6E645A]">{row.sleeve}</td>
                                <td className="py-3 px-4 text-xs font-mono text-[#6E645A]">{row.shoulder}</td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Measuring directions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <h4 className="text-xs font-serif font-bold text-[#1F1B17] uppercase tracking-wider">
                        1. Chest Measurement
                      </h4>
                      <p className="text-xs text-[#6E645A] font-sans leading-relaxed">
                        Measure around the fullest part of your chest, keeping the tape horizontal under your arms and flat across your back. Do not puff out your chest.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-serif font-bold text-[#1F1B17] uppercase tracking-wider">
                        2. Sleeve Length
                      </h4>
                      <p className="text-xs text-[#6E645A] font-sans leading-relaxed">
                        Measure from the outer edge of your shoulder bone straight down to the base of your thumb or desired wrist cuff ending.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with note */}
            <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#E8DFC8] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[#6E645A] font-sans">
              <span>Bespoke or customized sizing options can be requested at checkout.</span>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 bg-white border border-[#E8DFC8] text-[#1F1B17] hover:border-[#C5A059] hover:text-[#8C6819] hover:bg-[#FAF6ED] tracking-wider uppercase text-[9px] font-bold transition-all rounded-lg cursor-pointer shadow-2xs"
              >
                Close Sizing Guide
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
