import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Check,
  Building2,
  Globe,
  Compass,
  FileText,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { LocationData } from '../types/civic';
import { DoodleSparkle } from './Doodles';

interface LocationPickerProps {
  location: LocationData;
  onChange: (location: LocationData) => void;
  disabled?: boolean;
}

// Complete Pakistan Regions and Cities Database
export const PAKISTAN_REGIONS: Record<
  string,
  {
    cities: { name: string; lat: number; lng: number }[];
  }
> = {
  Punjab: {
    cities: [
      { name: 'Lahore', lat: 31.5204, lng: 74.3587 },
      { name: 'Rawalpindi', lat: 33.5651, lng: 73.0169 },
      { name: 'Faisalabad', lat: 31.4504, lng: 73.135 },
      { name: 'Multan', lat: 30.1575, lng: 71.5249 },
      { name: 'Gujranwala', lat: 32.1877, lng: 74.1945 },
      { name: 'Sialkot', lat: 32.4945, lng: 74.5229 },
      { name: 'Bahawalpur', lat: 29.3956, lng: 71.6836 },
      { name: 'Sargodha', lat: 32.0836, lng: 72.6711 },
      { name: 'Sheikhupura', lat: 31.7131, lng: 73.9783 },
      { name: 'Jhelum', lat: 32.9425, lng: 73.7257 },
      { name: 'Sahiwal', lat: 30.6682, lng: 73.1114 },
      { name: 'Rahim Yar Khan', lat: 28.4212, lng: 70.2989 },
      { name: 'Gujrat', lat: 32.5742, lng: 74.0754 },
      { name: 'Kasur', lat: 31.1167, lng: 74.45 },
      { name: 'Okara', lat: 30.8138, lng: 73.4534 },
      { name: 'Dera Ghazi Khan', lat: 30.0561, lng: 70.6403 },
      { name: 'Chakwal', lat: 32.9334, lng: 72.8585 },
      { name: 'Attock', lat: 33.7667, lng: 72.3667 },
      { name: 'Mianwali', lat: 32.5833, lng: 71.5333 },
      { name: 'Khanewal', lat: 30.3017, lng: 71.9321 },
      { name: 'Vehari', lat: 30.0419, lng: 72.3528 },
      { name: 'Muzaffargarh', lat: 30.0703, lng: 71.1933 },
      { name: 'Mandi Bahauddin', lat: 32.5861, lng: 73.4917 },
      { name: 'Bahawalnagar', lat: 29.9986, lng: 73.2536 },
      { name: 'Hafizabad', lat: 32.0719, lng: 73.6872 },
    ],
  },
  Sindh: {
    cities: [
      { name: 'Karachi', lat: 24.8607, lng: 67.0011 },
      { name: 'Hyderabad', lat: 25.396, lng: 68.3578 },
      { name: 'Sukkur', lat: 27.7052, lng: 68.8574 },
      { name: 'Larkana', lat: 27.559, lng: 68.212 },
      { name: 'Nawabshah (Shaheed Benazirabad)', lat: 26.2483, lng: 68.4096 },
      { name: 'Mirpur Khas', lat: 25.5276, lng: 69.0125 },
      { name: 'Jacobabad', lat: 28.2835, lng: 68.4388 },
      { name: 'Thatta', lat: 24.7475, lng: 67.9235 },
      { name: 'Badin', lat: 24.656, lng: 68.837 },
      { name: 'Shikarpur', lat: 27.9556, lng: 68.6382 },
      { name: 'Khairpur', lat: 27.5295, lng: 68.7592 },
      { name: 'Dadu', lat: 26.7329, lng: 67.7763 },
      { name: 'Jamshoro', lat: 25.4347, lng: 68.2809 },
      { name: 'Ghotki', lat: 28.0064, lng: 69.3161 },
      { name: 'Umerkot', lat: 25.3614, lng: 69.7369 },
      { name: 'Tando Allahyar', lat: 25.4667, lng: 68.7167 },
    ],
  },
  'Islamabad Capital Territory': {
    cities: [
      { name: 'Islamabad', lat: 33.6844, lng: 73.0479 },
      { name: 'Rawat / Sihala Zone', lat: 33.5283, lng: 73.1952 },
      { name: 'Bhara Kahu', lat: 33.7431, lng: 73.1819 },
      { name: 'Bani Gala', lat: 33.7144, lng: 73.1417 },
      { name: 'Tarnol', lat: 33.6492, lng: 72.9083 },
    ],
  },
  'Khyber Pakhtunkhwa': {
    cities: [
      { name: 'Peshawar', lat: 34.0151, lng: 71.5249 },
      { name: 'Abbottabad', lat: 34.1688, lng: 73.2215 },
      { name: 'Mardan', lat: 34.1989, lng: 72.0404 },
      { name: 'Swat (Mingora)', lat: 34.7717, lng: 72.3602 },
      { name: 'Kohat', lat: 33.5869, lng: 71.4414 },
      { name: 'Dera Ismail Khan', lat: 31.8314, lng: 70.9019 },
      { name: 'Haripur', lat: 33.9999, lng: 72.9341 },
      { name: 'Nowshera', lat: 34.0153, lng: 71.9747 },
      { name: 'Bannu', lat: 32.9854, lng: 70.6027 },
      { name: 'Mansehra', lat: 34.3333, lng: 73.2 },
      { name: 'Charsadda', lat: 34.1481, lng: 71.7408 },
      { name: 'Swabi', lat: 34.1202, lng: 72.4698 },
      { name: 'Malakand', lat: 34.5667, lng: 71.9333 },
      { name: 'Dir (Timergara)', lat: 34.8265, lng: 71.8401 },
      { name: 'Chitral', lat: 35.851, lng: 71.7864 },
    ],
  },
  Balochistan: {
    cities: [
      { name: 'Quetta', lat: 30.1798, lng: 66.975 },
      { name: 'Gwadar', lat: 25.1264, lng: 62.3225 },
      { name: 'Turbat (Kech)', lat: 26.0031, lng: 63.054 },
      { name: 'Khuzdar', lat: 27.8119, lng: 66.6083 },
      { name: 'Sibi', lat: 29.5448, lng: 67.8764 },
      { name: 'Hub', lat: 25.0294, lng: 66.8856 },
      { name: 'Chaman', lat: 30.9236, lng: 66.4512 },
      { name: 'Loralai', lat: 30.3705, lng: 68.5979 },
      { name: 'Zhob', lat: 31.3411, lng: 69.4486 },
      { name: 'Pishin', lat: 30.5803, lng: 66.9961 },
      { name: 'Mastung', lat: 29.7997, lng: 66.8455 },
      { name: 'Jafarabad', lat: 28.4319, lng: 68.2256 },
    ],
  },
  'Gilgit-Baltistan': {
    cities: [
      { name: 'Gilgit', lat: 35.9221, lng: 74.3087 },
      { name: 'Skardu', lat: 35.2971, lng: 75.6333 },
      { name: 'Hunza (Karimabad)', lat: 36.3262, lng: 74.6622 },
      { name: 'Diamer (Chilas)', lat: 35.4222, lng: 74.0964 },
      { name: 'Ghizer', lat: 36.1736, lng: 73.7667 },
      { name: 'Ghanche', lat: 35.1583, lng: 76.3333 },
      { name: 'Astore', lat: 35.3672, lng: 74.8569 },
      { name: 'Nagar', lat: 36.25, lng: 74.5 },
    ],
  },
  'Azad Jammu & Kashmir': {
    cities: [
      { name: 'Muzaffarabad', lat: 34.3705, lng: 73.4711 },
      { name: 'Mirpur', lat: 33.1478, lng: 73.7519 },
      { name: 'Rawalakot', lat: 33.8584, lng: 73.7604 },
      { name: 'Kotli', lat: 33.5156, lng: 73.9019 },
      { name: 'Bhimber', lat: 32.9744, lng: 74.0786 },
      { name: 'Bagh', lat: 33.9817, lng: 73.7761 },
      { name: 'Neelum Valley (Athmuqam)', lat: 34.5878, lng: 73.9039 },
      { name: 'Palandri (Sudhanoti)', lat: 33.7167, lng: 73.6833 },
      { name: 'Hattian Bala', lat: 34.1686, lng: 73.7431 },
      { name: 'Haveli', lat: 33.8833, lng: 74.15 },
    ],
  },
};

export const PROVINCE_NAMES = Object.keys(PAKISTAN_REGIONS);

// Popular presets for instant testing
const PAKISTAN_LANDMARKS = [
  {
    name: 'Liberty Market & Main Boulevard',
    city: 'Lahore',
    province: 'Punjab',
    streetAddress: 'Main Boulevard Gulberg III, near Liberty Roundabout',
    lat: 31.5118,
    lng: 74.3444,
  },
  {
    name: 'F-7 Jinnah Super Market',
    city: 'Islamabad',
    province: 'Islamabad Capital Territory',
    streetAddress: 'College Road, Sector F-7 Markaz',
    lat: 33.7206,
    lng: 73.0567,
  },
  {
    name: 'Clifton Beach Block 4',
    city: 'Karachi',
    province: 'Sindh',
    streetAddress: 'Sea View Road, Block 4, Clifton',
    lat: 24.8138,
    lng: 67.0311,
  },
  {
    name: 'University Town / Saddar Road',
    city: 'Peshawar',
    province: 'Khyber Pakhtunkhwa',
    streetAddress: 'Jamrud Road, University Town',
    lat: 33.9982,
    lng: 71.4873,
  },
  {
    name: 'Zarghoon Road Civil Secretariat',
    city: 'Quetta',
    province: 'Balochistan',
    streetAddress: 'Zarghoon Road, near Railway Station',
    lat: 30.1989,
    lng: 66.9981,
  },
];

export const LocationPicker: React.FC<LocationPickerProps> = ({
  location,
  onChange,
  disabled = false,
}) => {
  // 1. Selected Province state
  const [selectedProvince, setSelectedProvince] = useState<string>(
    location.province || ''
  );

  // 2. Selected City state
  const [selectedCity, setSelectedCity] = useState<string>(
    location.city || ''
  );

  // Custom city input toggle for non-listed towns
  const [isCustomCity, setIsCustomCity] = useState<boolean>(false);
  const [customCityName, setCustomCityName] = useState<string>('');

  // 3. Street / Specific address typed further
  const [streetAddress, setStreetAddress] = useState<string>(
    location.streetAddress || ''
  );

  const [isLocating, setIsLocating] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // Sync internal state if parent props change (e.g. form reset or sample preset)
  useEffect(() => {
    if (location.province && location.province !== selectedProvince) {
      setSelectedProvince(location.province);
    }
    if (location.city && location.city !== selectedCity) {
      setSelectedCity(location.city);
    }
    if (location.streetAddress !== undefined && location.streetAddress !== streetAddress) {
      setStreetAddress(location.streetAddress);
    }
  }, [location.province, location.city, location.streetAddress]);

  // Available cities for currently selected province
  const currentCities = PAKISTAN_REGIONS[selectedProvince]?.cities || [];

  // Helper to construct full address string and sync with parent
  const syncLocation = (
    province: string,
    city: string,
    street: string,
    coords?: { lat: number; lng: number }
  ) => {
    const cleanStreet = street.trim();
    const cityObj = PAKISTAN_REGIONS[province]?.cities.find((c) => c.name === city);
    const lat = coords?.lat ?? cityObj?.lat ?? 31.5204;
    const lng = coords?.lng ?? cityObj?.lng ?? 74.3587;

    // Full address composed as: [Street Address], [City], [Province], Pakistan
    const fullAddress = `${cleanStreet ? cleanStreet + ', ' : ''}${city}, ${province}, Pakistan`;

    onChange({
      address: fullAddress,
      country: 'Pakistan',
      province,
      city,
      streetAddress: cleanStreet,
      lat,
      lng,
      landmark: cleanStreet,
    });
  };

  // Step 2: Province change handler
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvince = e.target.value;
    setSelectedProvince(newProvince);
    setIsCustomCity(false);
    setCustomCityName('');

    const newCities = PAKISTAN_REGIONS[newProvince]?.cities || [];
    const firstCity = newCities[0]?.name || '';
    setSelectedCity(firstCity);

    syncLocation(newProvince, firstCity, streetAddress);
  };

  // Step 3: City change handler
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomCity(true);
      return;
    }
    setIsCustomCity(false);
    setSelectedCity(val);
    syncLocation(selectedProvince, val, streetAddress);
  };

  // Custom city name typed by user
  const handleCustomCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomCityName(val);
    setSelectedCity(val || 'Custom City');
    syncLocation(selectedProvince, val || 'Custom City', streetAddress);
  };

  // Step 4: Street / Specific address input change (typed further)
  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStreet = e.target.value;
    setStreetAddress(newStreet);
    syncLocation(selectedProvince, selectedCity, newStreet);
  };

  // "Use Current GPS Location" simulation
  const handleUseCurrentLocation = () => {
    if (disabled) return;
    setIsLocating(true);

    setTimeout(() => {
      setSelectedProvince('Punjab');
      setSelectedCity('Lahore');
      setIsCustomCity(false);
      const gpsStreet = 'Gulberg Main Boulevard, Near Siddique Trade Centre';
      setStreetAddress(gpsStreet);

      syncLocation('Punjab', 'Lahore', gpsStreet, {
        lat: 31.5255,
        lng: 74.3482,
      });

      setIsLocating(false);
    }, 500);
  };

  // Preset Landmark selection
  const selectLandmark = (item: (typeof PAKISTAN_LANDMARKS)[0]) => {
    setSelectedProvince(item.province);
    setSelectedCity(item.city);
    setIsCustomCity(false);
    setStreetAddress(item.streetAddress);
    setShowPresets(false);

    syncLocation(item.province, item.city, item.streetAddress, {
      lat: item.lat,
      lng: item.lng,
    });
  };

  return (
    <div className="space-y-4">
      {/* Title & Quick Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[#8DA399]/20">
        <div>
          <label className="text-sm font-bold text-[#4A4955] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8DA399]"></span>
            <span>Incident Location in Pakistan</span>
            <span className="text-rose-500 font-bold">*</span>
          </label>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-[11px] text-[#6E867B] hover:text-[#4A4955] font-semibold bg-[#EBF0ED] hover:bg-[#8DA399]/20 px-2.5 py-1 rounded-lg border border-[#8DA399]/30 transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-[#8DA399]" />
            <span>Landmarks</span>
          </button>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={disabled || isLocating}
            className="text-[11px] text-white bg-[#8DA399] hover:bg-[#7D9489] font-medium px-2.5 py-1 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting Location...' : 'Auto Detect'}</span>
          </button>
        </div>
      </div>

      {/* POPULAR LANDMARKS QUICK CARD (Dropdown overlay) */}
      {showPresets && (
        <div className="bg-[#FDFBF7] border border-[#8DA399]/35 rounded-xl shadow-lg p-3 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#8DA399]/20 text-[10px] font-bold text-[#8DA399] uppercase tracking-wider">
            <span>Quick Municipal Presets in Pakistan</span>
            <button
              type="button"
              onClick={() => setShowPresets(false)}
              className="text-[#9C9BA8] hover:text-[#4A4955] px-1 text-xs"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PAKISTAN_LANDMARKS.map((lm, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectLandmark(lm)}
                className="text-left px-2.5 py-2 rounded-lg bg-white hover:bg-[#EBF0ED] border border-[#8DA399]/20 transition-all flex items-start gap-2 group"
              >
                <MapPin className="w-3.5 h-3.5 text-[#8DA399] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#4A4955] truncate">{lm.name}</p>
                  <p className="text-[10px] text-[#9C9BA8] truncate">
                    {lm.streetAddress}, {lm.city} ({lm.province})
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1, 2, 3: COUNTRY (FIXED) -> PROVINCE (DROPDOWN) -> CITY (DROPDOWN) */}
      <div className="flex flex-col gap-4">
        {/* OPTION 1: COUNTRY (Fixed to Pakistan as requested) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#4A4955] flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[#8DA399] text-white text-[10px] flex items-center justify-center font-bold">
              1
            </span>
            <Globe className="w-3.5 h-3.5 text-[#8DA399]" />
            <span>Country / ملک</span>
          </label>
          <div
            className="w-full px-3 py-2.5 bg-[#EBF0ED] border border-[#8DA399]/40 rounded-xl text-xs text-[#2F3E37] font-semibold flex items-center justify-between shadow-2xs select-none"
            title="Country is permanently set to Pakistan"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🇵🇰</span>
              <span>Pakistan</span>
            </div>
            <span className="text-[9px] uppercase tracking-wider text-[#6E867B] font-bold bg-white/80 px-2 py-0.5 rounded border border-[#8DA399]/20">
              Fixed
            </span>
          </div>
          <p className="text-[10px] text-[#6B6A75] pl-1">
            Service territory: Pakistan only
          </p>
        </div>

        {/* OPTION 2: PROVINCE (Dropdown Menu) */}
        <div className="space-y-1.5">
          <label
            htmlFor="province-dropdown"
            className="text-xs font-bold text-[#4A4955] flex items-center gap-1.5"
          >
            <span className="w-4 h-4 rounded-full bg-[#8DA399] text-white text-[10px] flex items-center justify-center font-bold">
              2
            </span>
            <Compass className="w-3.5 h-3.5 text-[#8DA399]" />
            <span>Select Province / صوبہ</span>
            <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="relative">
            <select
              id="province-dropdown"
              value={selectedProvince}
              onChange={handleProvinceChange}
              disabled={disabled}
              className="w-full appearance-none px-3.5 py-2.5 pr-8 bg-white border border-[#8DA399]/35 rounded-xl text-xs text-[#4A4955] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8DA399]/40 focus:border-[#8DA399] transition-all cursor-pointer shadow-2xs hover:border-[#8DA399]"
            >
              <option value="" disabled>Select Province</option>
              {PROVINCE_NAMES.map((prov) => (
                <option key={prov} value={prov} className="py-1">
                  {prov}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#8DA399] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <p className="text-[10px] text-[#6B6A75] pl-1">
            Choose your administrative region
          </p>
        </div>

        {/* OPTION 3: CITY (Dropdown Menu filtered by selected province) */}
        <div className="space-y-1.5">
          <label
            htmlFor="city-dropdown"
            className="text-xs font-bold text-[#4A4955] flex items-center gap-1.5"
          >
            <span className="w-4 h-4 rounded-full bg-[#8DA399] text-white text-[10px] flex items-center justify-center font-bold">
              3
            </span>
            <Building2 className="w-3.5 h-3.5 text-[#8DA399]" />
            <span>Select City / شہر</span>
            <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="relative">
            <select
              id="city-dropdown"
              value={isCustomCity ? '__custom__' : selectedCity}
              onChange={handleCityChange}
              disabled={disabled}
              className="w-full appearance-none px-3.5 py-2.5 pr-8 bg-white border border-[#8DA399]/35 rounded-xl text-xs text-[#4A4955] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8DA399]/40 focus:border-[#8DA399] transition-all cursor-pointer shadow-2xs hover:border-[#8DA399]"
            >
              <option value="" disabled>Select City</option>
              {currentCities.map((c) => (
                <option key={c.name} value={c.name} className="py-1">
                  {c.name}
                </option>
              ))}
              <option value="__custom__" className="font-bold text-[#8DA399]">
                ➕ Other City / Tehsil (Type Manually)
              </option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#8DA399] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <p className="text-[10px] text-[#6B6A75] pl-1">
            {currentCities.length} cities available in {selectedProvince}
          </p>
        </div>
      </div>

      {/* CONDITIONAL MANUAL CITY INPUT IF "OTHER CITY" SELECTED */}
      {isCustomCity && (
        <div className="p-3 rounded-xl bg-[#EBF0ED]/60 border border-[#8DA399]/30 space-y-1.5 animate-in fade-in">
          <label
            htmlFor="custom-city-input"
            className="text-xs font-bold text-[#4A4955] flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-[#8DA399]" />
            <span>Specify Your City / Town / Tehsil Name</span>
            <span className="text-rose-500 font-bold">*</span>
          </label>
          <input
            id="custom-city-input"
            type="text"
            value={customCityName}
            onChange={handleCustomCityChange}
            placeholder={`Type town or city in ${selectedProvince}...`}
            className="w-full px-3.5 py-2 bg-white border border-[#8DA399]/40 rounded-xl text-xs text-[#4A4955] placeholder:text-[#9C9BA8] focus:outline-none focus:ring-2 focus:ring-[#8DA399]/40 focus:border-[#8DA399] shadow-2xs"
          />
        </div>
      )}

      {/* STEP 4: SPECIFIC STREET / AREA ADDRESS (Type krke likhein) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="street-address-input"
            className="text-xs font-bold text-[#4A4955] flex items-center gap-1.5"
          >
            <span className="w-4 h-4 rounded-full bg-[#8DA399] text-white text-[10px] flex items-center justify-center font-bold">
              4
            </span>
            <FileText className="w-3.5 h-3.5 text-[#8DA399]" />
            <span>Type Specific Address / گلی، روڈ، سیکٹر یا پتہ</span>
            <span className="text-rose-500 font-bold">*</span>
          </label>
          <span className="text-[10px] text-[#8DA399] font-medium">
            Include street, sector, or nearby landmark
          </span>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8DA399]">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="street-address-input"
            type="text"
            value={streetAddress}
            onChange={handleStreetChange}
            disabled={disabled}
            placeholder={`e.g. Street 4, House 12, Sector F-8/2, or Main Market (${selectedCity})...`}
            className="w-full pl-10 pr-28 py-2.5 bg-white border border-[#8DA399]/35 rounded-xl text-xs text-[#4A4955] placeholder:text-[#9C9BA8] focus:outline-none focus:ring-2 focus:ring-[#8DA399]/40 focus:border-[#8DA399] transition-all shadow-2xs"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-[#EBF0ED] px-2 py-0.5 rounded text-[10px] text-[#6E867B] font-semibold border border-[#8DA399]/20 pointer-events-none">
            <span>{selectedCity}</span>
          </div>
        </div>
        <p className="text-[10px] text-[#6B6A75] pl-1">
          Example: <span className="italic">"Opposite Government Degree College, Street 7"</span> or <span className="italic">"Near Shell Pump, Main Canal Road"</span>
        </p>
      </div>

      {/* FULL SYNTHESIZED VERIFIED ADDRESS SUMMARY CARD (Clean, Minimalist) */}
      <div className="p-3.5 rounded-xl bg-white border border-[#8DA399]/30 shadow-2xs flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-[#EBF0ED] text-[#8DA399] flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#4A4955] truncate">
            {streetAddress ? `${streetAddress}, ` : ''}{selectedCity}, {selectedProvince}, Pakistan
          </p>
        </div>
      </div>
    </div>
  );
};
