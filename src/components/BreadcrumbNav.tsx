
import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { ChevronRight } from "lucide-react";

const BreadcrumbNav = () => {
  const {
    drillLevel,
    selectedRegion,
    selectedCountry,
    resetToLevel,
    getMarketById
  } = useDashboard();
  
  // Get country name from ID if available
  const getCountryName = (countryCode: string) => {
    const market = getMarketById(`country-${countryCode}`);
    return market ? market.country_name : countryCode;
  };
  
  return (
    <div className="flex items-center text-sm mb-4">
      <button
        onClick={() => resetToLevel(0)}
        className={`hover:underline ${drillLevel === 0 ? 'font-medium' : 'text-gray-600'}`}
      >
        Regions
      </button>
      
      {drillLevel >= 1 && selectedRegion && (
        <>
          <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
          <button
            onClick={() => resetToLevel(1)}
            className={`hover:underline ${drillLevel === 1 ? 'font-medium' : 'text-gray-600'}`}
          >
            {selectedRegion}
          </button>
        </>
      )}
      
      {drillLevel >= 2 && selectedCountry && (
        <>
          <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
          <span className="font-medium">
            {getCountryName(selectedCountry)}
          </span>
        </>
      )}
    </div>
  );
};

export default BreadcrumbNav;
