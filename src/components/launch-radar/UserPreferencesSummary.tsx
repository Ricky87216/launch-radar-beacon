
import { Badge } from "@/components/ui/badge";
import { Market } from "@/types";

interface UserPreferencesSummaryProps {
  userPrefs: { regions: string[], countries: string[] };
  getMarketById: (id: string) => Market | undefined;
}

export function UserPreferencesSummary({ userPrefs, getMarketById }: UserPreferencesSummaryProps) {
  if (!userPrefs) return null;
  
  return (
    <div className="bg-muted/50 rounded-lg p-3 mb-6">
      <p className="text-sm font-medium">Showing products with blockers in:</p>
      <div className="flex flex-wrap gap-1 mt-1">
        {userPrefs.regions.map(region => (
          <Badge key={region} variant="secondary" className="text-xs">
            {getMarketById(region)?.name || region}
          </Badge>
        ))}
        {userPrefs.countries.map(country => (
          <Badge key={country} variant="secondary" className="text-xs">
            {getMarketById(country)?.name || country}
          </Badge>
        ))}
      </div>
    </div>
  );
}
