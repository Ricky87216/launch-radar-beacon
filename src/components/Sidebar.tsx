
import { Filter, Check } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { 
  getLinesOfBusiness, 
  getSubTeams 
} from "../data/mockData";

export default function Sidebar() {
  const { 
    selectedLOBs, 
    setSelectedLOBs, 
    selectedSubTeams, 
    setSelectedSubTeams,
    hideFullCoverage,
    setHideFullCoverage,
    coverageType,
    setCoverageType,
    useTam,
    setUseTam
  } = useDashboard();
  
  const linesOfBusiness = getLinesOfBusiness();
  const subTeams = getSubTeams();
  
  const toggleLOB = (lob: string) => {
    if (selectedLOBs.includes(lob)) {
      setSelectedLOBs(selectedLOBs.filter(l => l !== lob));
    } else {
      setSelectedLOBs([...selectedLOBs, lob]);
    }
  };
  
  const toggleSubTeam = (subTeam: string) => {
    if (selectedSubTeams.includes(subTeam)) {
      setSelectedSubTeams(selectedSubTeams.filter(st => st !== subTeam));
    } else {
      setSelectedSubTeams([...selectedSubTeams, subTeam]);
    }
  };
  
  return (
    <aside className="bg-sidebar border-r w-64 min-w-64 h-full overflow-y-auto p-4">
      <div className="flex items-center mb-6">
        <Filter className="h-5 w-5 mr-2" />
        <h2 className="text-lg font-medium">Filters</h2>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Coverage Type</h3>
        <div className="flex items-center space-x-2 mb-2">
          <button
            onClick={() => setCoverageType('city_percentage')}
            className={`px-3 py-1 text-sm rounded-md ${
              coverageType === 'city_percentage' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            City %
          </button>
          <button
            onClick={() => setCoverageType('gb_weighted')}
            className={`px-3 py-1 text-sm rounded-md ${
              coverageType === 'gb_weighted' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            GB Weighted
          </button>
          <button
            onClick={() => setCoverageType('tam_percentage')}
            className={`px-3 py-1 text-sm rounded-md ${
              coverageType === 'tam_percentage' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            TAM %
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Addressable Markets</h3>
        <div className="flex flex-col space-y-2">
          <div
            className="flex items-center cursor-pointer p-1 hover:bg-gray-100 rounded"
            onClick={() => setUseTam(false)}
          >
            <div className={`w-4 h-4 rounded-full border mr-2 flex items-center justify-center ${
              !useTam ? 'bg-primary border-primary' : 'border-gray-300'
            }`}>
              {!useTam && <div className="w-2 h-2 rounded-full bg-white"></div>}
            </div>
            <span className="text-sm">All Markets</span>
          </div>
          <div
            className="flex items-center cursor-pointer p-1 hover:bg-gray-100 rounded"
            onClick={() => setUseTam(true)}
          >
            <div className={`w-4 h-4 rounded-full border mr-2 flex items-center justify-center ${
              useTam ? 'bg-primary border-primary' : 'border-gray-300'
            }`}>
              {useTam && <div className="w-2 h-2 rounded-full bg-white"></div>}
            </div>
            <span className="text-sm">TAM Only</span>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Line of Business</h3>
        <div className="space-y-1">
          {linesOfBusiness.map(lob => (
            <div 
              key={lob} 
              className="flex items-center cursor-pointer p-1 hover:bg-gray-100 rounded"
              onClick={() => toggleLOB(lob)}
            >
              <div className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${
                selectedLOBs.includes(lob) ? 'bg-primary border-primary' : 'border-gray-300'
              }`}>
                {selectedLOBs.includes(lob) && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className="text-sm">{lob}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Sub-Team</h3>
        <div className="space-y-1">
          {subTeams.map(subTeam => (
            <div 
              key={subTeam} 
              className="flex items-center cursor-pointer p-1 hover:bg-gray-100 rounded"
              onClick={() => toggleSubTeam(subTeam)}
            >
              <div className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${
                selectedSubTeams.includes(subTeam) ? 'bg-primary border-primary' : 'border-gray-300'
              }`}>
                {selectedSubTeams.includes(subTeam) && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className="text-sm">{subTeam}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Options</h3>
        <div 
          className="flex items-center cursor-pointer p-1 hover:bg-gray-100 rounded"
          onClick={() => setHideFullCoverage(!hideFullCoverage)}
        >
          <div className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${
            hideFullCoverage ? 'bg-primary border-primary' : 'border-gray-300'
          }`}>
            {hideFullCoverage && <Check className="h-3 w-3 text-white" />}
          </div>
          <span className="text-sm">Hide Full Coverage</span>
        </div>
      </div>
    </aside>
  );
}
