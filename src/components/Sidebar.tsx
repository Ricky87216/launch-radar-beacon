import { Filter } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { getLinesOfBusiness, getSubTeams } from "../data/mockData";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  return <aside className="bg-gray-50 border-r w-64 min-w-64 h-full overflow-y-auto p-4">
      <div className="flex items-center mb-6">
        <Filter className="h-5 w-5 mr-2" />
        <h2 className="text-lg font-medium">Filters</h2>
      </div>
      
      {/* Coverage Type */}
      <div className="mb-6">
        <h3 className="font-medium text-base mb-3">Coverage Type</h3>
        <div className="flex space-x-2 mb-2">
          <button onClick={() => setCoverageType('city_percentage')} className={`px-4 py-2 text-sm rounded-md ${coverageType === 'city_percentage' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            City %
          </button>
          <button onClick={() => setCoverageType('gb_weighted')} className={`px-4 py-2 text-sm rounded-md ${coverageType === 'gb_weighted' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            GB Weighted
          </button>
        </div>
      </div>
      
      {/* Addressable Markets */}
      <div className="mb-6">
        <h3 className="font-medium text-base mb-3">Addressable Markets</h3>
        <RadioGroup value={useTam ? "tam_only" : "all_markets"} onValueChange={value => setUseTam(value === "tam_only")}>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="all_markets" id="all_markets" />
            <Label htmlFor="all_markets">All Markets</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="tam_only" id="tam_only" />
            <Label htmlFor="tam_only">TAM Only</Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Line of Business */}
      <div className="mb-6">
        <h3 className="font-medium text-base mb-3">Line of Business</h3>
        <div className="space-y-2">
          {linesOfBusiness.map(lob => <div key={lob} className="flex items-center space-x-2">
              <Checkbox id={`lob-${lob}`} checked={selectedLOBs.includes(lob)} onCheckedChange={() => toggleLOB(lob)} />
              <label htmlFor={`lob-${lob}`} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {lob}
              </label>
            </div>)}
        </div>
      </div>
      
      {/* Sub-Team */}
      <div className="mb-6">
        <h3 className="font-medium text-base mb-3">Sub-Team</h3>
        <div className="space-y-2">
          {subTeams.map(subTeam => <div key={subTeam} className="flex items-center space-x-2">
              <Checkbox id={`subteam-${subTeam}`} checked={selectedSubTeams.includes(subTeam)} onCheckedChange={() => toggleSubTeam(subTeam)} />
              <label htmlFor={`subteam-${subTeam}`} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {subTeam}
              </label>
            </div>)}
        </div>
      </div>
      
      {/* Options */}
      <div className="mb-6">
        
        
      </div>
    </aside>;
}