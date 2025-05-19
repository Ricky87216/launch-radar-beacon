
import { Badge } from "@/components/ui/badge";
import { Blocker } from "@/types";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { formatRelativeTime } from "@/utils/dateUtils";
import EscalationBadge from "../EscalationBadge";
import { ExtendedBlocker } from "@/types";

interface BlockersTableProps {
  blockers: Blocker[];
  getMarketById: (id: string) => any;
  viewEscalation: (escalationId: string) => void;
}

export function BlockersTable({ blockers, getMarketById, viewEscalation }: BlockersTableProps) {
  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="whitespace-nowrap">Market</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="whitespace-nowrap">Type</TableHead>
            <TableHead className="whitespace-nowrap">Owner</TableHead>
            <TableHead className="whitespace-nowrap">Created</TableHead>
            <TableHead className="whitespace-nowrap">ETA</TableHead>
            <TableHead className="whitespace-nowrap">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Show blockers, sorted by most recent */}
          {blockers
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .map(blocker => (
              <TableRow key={blocker.id}>
                <TableCell className="py-2 whitespace-nowrap">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate block max-w-[100px]">
                          {getMarketById(blocker.market_id)?.name}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getMarketById(blocker.market_id)?.name}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="py-2 whitespace-nowrap">
                  {(blocker as ExtendedBlocker).escalation ? (
                    <EscalationBadge 
                      status={(blocker as ExtendedBlocker).escalation!.status} 
                      onClick={() => viewEscalation((blocker as ExtendedBlocker).escalation!.id)}
                      className="cursor-pointer"
                    />
                  ) : (
                    <Badge variant="outline">No Escalation</Badge>
                  )}
                </TableCell>
                <TableCell className="py-2 whitespace-nowrap">
                  {(blocker as ExtendedBlocker).escalation?.reason_type || blocker.category || "N/A"}
                </TableCell>
                <TableCell className="py-2 whitespace-nowrap">
                  {(blocker as ExtendedBlocker).escalation?.raised_by || blocker.owner}
                </TableCell>
                <TableCell className="py-2 whitespace-nowrap">
                  {formatRelativeTime((blocker as ExtendedBlocker).escalation?.created_at || blocker.created_at)}
                </TableCell>
                <TableCell className="py-2 whitespace-nowrap">
                  {formatRelativeTime(blocker.eta)}
                </TableCell>
                <TableCell className="py-2 max-w-xs break-words">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate">
                          {(blocker as ExtendedBlocker).escalation?.notes || "-"}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        {(blocker as ExtendedBlocker).escalation?.notes || "No notes available"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          {blockers.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No blockers found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
