import React from 'react';
import {
  DoodlePothole,
  DoodleLamp,
  DoodleTrashBin,
  DoodleSprout,
  DoodleWaterDrop,
  DoodleHouse,
  DoodleCamera,
  DoodleSparkle,
} from './Doodles';
import { HelpCircle } from 'lucide-react';

interface CategoryPickerProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  customCategoryDetail?: string;
  onChangeCustomCategory?: (detail: string) => void;
  disabled?: boolean;
}

export const CATEGORIES_CONFIG = [
  {
    id: 'Potholes & Road Damage',
    label: 'Roads & Potholes',
    icon: DoodlePothole,
    dept: 'Dept. of Transportation',
    hint: 'Cracked asphalt, craters, sinkholes',
  },
  {
    id: 'Streetlights & Traffic Signals',
    label: 'Lights & Signals',
    icon: DoodleLamp,
    dept: 'Lighting & Electrical',
    hint: 'Outages, flickering lamps, signal timing',
  },
  {
    id: 'Waste & Illegal Dumping',
    label: 'Waste & Litter',
    icon: DoodleTrashBin,
    dept: 'Sanitation Dept.',
    hint: 'Overflowing bins, abandoned debris',
  },
  {
    id: 'Parks & Public Greenery',
    label: 'Parks & Trees',
    icon: DoodleSprout,
    dept: 'Parks & Urban Forestry',
    hint: 'Fallen branches, overgrown shrubs',
  },
  {
    id: 'Water Leakage & Drainage',
    label: 'Water & Leaks',
    icon: DoodleWaterDrop,
    dept: 'Water & Stormwater',
    hint: 'Burst pipes, clogged storm drains',
  },
  {
    id: 'Sidewalks & Pedestrian Hazards',
    label: 'Sidewalks & Ramps',
    icon: DoodleHouse,
    dept: 'Public Works',
    hint: 'Uneven slabs, broken curbs, ramps',
  },
  {
    id: 'Graffiti & Vandalism',
    label: 'Graffiti Cleanup',
    icon: DoodleCamera,
    dept: 'Civic Beautification',
    hint: 'Defacement on public facilities',
  },
  {
    id: 'Other',
    label: 'Other Issues',
    icon: DoodleSparkle,
    dept: 'Specialized Dispatch',
    hint: 'Custom civic requests & hazards',
  },
];

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  selectedCategory,
  onSelectCategory,
  customCategoryDetail = '',
  onChangeCustomCategory,
  disabled = false,
}) => {
  const isOtherSelected = selectedCategory === 'Other';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[#4A4955] flex items-center gap-2">
          <span>Complaint Category</span>
          <span className="text-xs text-rose-500 font-bold">*</span>
        </label>
        <span className="text-xs text-[#9C9BA8]">Choose closest match</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {CATEGORIES_CONFIG.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComp = cat.icon;

          return (
            <button
              key={cat.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectCategory(cat.id)}
              className={`relative text-left p-3 rounded-[1rem] border transition-all duration-200 flex flex-col justify-between group
                ${
                  isSelected
                    ? 'border-[#8DA399] bg-[#EBF0ED] shadow-xs ring-1 ring-[#8DA399]/40'
                    : 'border-[#8DA399]/20 bg-white/70 hover:border-[#8DA399]/60 hover:bg-[#FDFBF7]'
                }
                ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105
                    ${isSelected ? 'bg-white text-[#6E867B]' : 'bg-[#F4EFEB] text-[#8DA399]'}`}
                >
                  <IconComp className="w-5 h-5" color={isSelected ? '#6E867B' : '#8DA399'} />
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-[#8DA399] animate-pulse" />
                )}
              </div>

              <div>
                <p
                  className={`text-xs font-semibold leading-tight line-clamp-1
                    ${isSelected ? 'text-[#3E4A44]' : 'text-[#4A4955]'}`}
                >
                  {cat.label}
                </p>
                <p className="text-[10px] text-[#9C9BA8] line-clamp-1 mt-0.5">
                  {cat.dept}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Conditionally rendered additional text input when 'Other' is selected */}
      {isOtherSelected && (
        <div className="p-3.5 rounded-[1rem] bg-[#EBF0ED]/70 border border-[#8DA399]/30 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <label
              htmlFor="other-category-specify"
              className="text-xs font-semibold text-[#4A4955] flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#8DA399]" />
              <span>Specify Issue Category</span>
              <span className="text-xs text-rose-500 font-bold">*</span>
            </label>
            <span className="text-[11px] text-[#8DA399] font-medium">Custom Civic Department</span>
          </div>

          <input
            id="other-category-specify"
            type="text"
            value={customCategoryDetail}
            onChange={(e) => onChangeCustomCategory && onChangeCustomCategory(e.target.value)}
            disabled={disabled}
            placeholder="e.g. Broken playground swing, buzzing transformer, wild beehive on sidewalk..."
            className="w-full px-3.5 py-2.5 bg-white border border-[#8DA399]/35 rounded-xl text-xs text-[#4A4955] placeholder:text-[#9C9BA8] focus:outline-none focus:ring-2 focus:ring-[#8DA399]/40 focus:border-[#8DA399] transition-all"
          />
          <p className="text-[11px] text-[#6B6A75] italic">
            Please name the specific issue so administrators can forward it to the appropriate municipal team.
          </p>
        </div>
      )}
    </div>
  );
};
