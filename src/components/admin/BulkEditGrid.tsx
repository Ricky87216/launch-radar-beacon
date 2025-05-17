import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface BulkEditGridProps {
  data: any[];
  isLoading: boolean;
  selectedRows: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

const BulkEditGrid: React.FC<BulkEditGridProps> = ({
  data,
  isLoading,
  selectedRows,
  onSelectionChange,
}) => {
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [showUnselection, setShowUnselection] = useState(false);
  
  // Check if all visible rows are selected
  const allSelected = data.length > 0 && data.every(row => selectedRows.includes(row.id));
  
  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
      setShowUnselection(false);
    } else {
      const allIds = data.map(row => row.id);
      onSelectionChange(allIds);
      setShowUnselection(true);
    }
  };
  
  const toggleRow = (rowId: string) => {
    if (selectedRows.includes(rowId)) {
      onSelectionChange(selectedRows.filter(id => id !== rowId));
    } else {
      onSelectionChange([...selectedRows, rowId]);
    }
  };
  
  const handleCellClick = (rowId: string, field: string, value: string) => {
    setEditingCell({ rowId, field });
    setEditValue(value || "");
  };
  
  const handleCellBlur = () => {
    // In a real implementation, this would update the data
    setEditingCell(null);
  };
  
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {showUnselection && data.length >= 10 && (
        <div className="bg-primary/10 p-3 border-b flex items-center justify-between">
          <p>
            <span className="font-medium">All {data.length} filtered rows selected.</span> 
            <span className="ml-1 text-muted-foreground">Unselect individually to exclude.</span>
          </p>
          <Button variant="outline" size="sm" onClick={() => setShowUnselection(false)}>
            Dismiss
          </Button>
        </div>
      )}
      
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-10">
                <Checkbox 
                  checked={allSelected} 
                  onCheckedChange={toggleAll} 
                  aria-label="Select all rows" 
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Blocker</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10">
                  Loading data...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10">
                  No results found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            ) : (
              data.map(row => (
                <TableRow key={row.id} className={selectedRows.includes(row.id) ? "bg-primary/5" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedRows.includes(row.id)} 
                      onCheckedChange={() => toggleRow(row.id)} 
                      aria-label={`Select row ${row.product_name}`} 
                    />
                  </TableCell>
                  <TableCell>{row.product_name}</TableCell>
                  <TableCell>{row.region}</TableCell>
                  <TableCell>{row.country}</TableCell>
                  <TableCell>{row.city}</TableCell>
                  <TableCell 
                    className="cursor-pointer"
                    onClick={() => handleCellClick(row.id, 'status', row.status)}
                  >
                    {editingCell?.rowId === row.id && editingCell?.field === 'status' ? (
                      <Input 
                        value={editValue} 
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={handleCellBlur}
                        className="h-8 w-24"
                        autoFocus
                      />
                    ) : (
                      <span className={
                        row.status === 'LIVE' ? 'text-green-600' : 
                        row.status === 'BLOCKED' ? 'text-red-600 font-medium' :
                        row.status === 'ROLLED_BACK' ? 'text-red-600' : 
                        'text-amber-600'
                      }>
                        {row.status}
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => handleCellClick(row.id, 'blocker_category', row.blocker_category || '')}
                  >
                    {editingCell?.rowId === row.id && editingCell?.field === 'blocker_category' ? (
                      <Input 
                        value={editValue} 
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={handleCellBlur}
                        className="h-8 w-full"
                        autoFocus
                      />
                    ) : (
                      row.blocker_category || "-"
                    )}
                  </TableCell>
                  <TableCell className="cursor-pointer">
                    {editingCell?.rowId === row.id && editingCell?.field === 'eta' ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-8">
                            {editValue ? format(new Date(editValue), "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={editValue ? new Date(editValue) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                setEditValue(date.toISOString());
                                setEditingCell(null);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span onClick={() => handleCellClick(row.id, 'eta', row.eta || '')}>
                        {row.eta ? format(new Date(row.eta), "MMM d, yyyy") : "-"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    className="cursor-pointer max-w-60 truncate"
                    onClick={() => handleCellClick(row.id, 'note', row.note || '')}
                  >
                    {editingCell?.rowId === row.id && editingCell?.field === 'note' ? (
                      <Input 
                        value={editValue} 
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={handleCellBlur}
                        className="h-8 w-full"
                        autoFocus
                      />
                    ) : (
                      row.note || "-"
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BulkEditGrid;
