
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { format } from "date-fns";

const Logs = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [changeLogData, setChangeLogData] = useState<any[]>([]);
  const [etlStatusData, setEtlStatusData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("changes");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Fetch log data
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      
      try {
        // Fetch change logs
        const { data: changeLogs, error: changeLogError } = await supabase
          .from('change_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (changeLogError) throw changeLogError;
        
        // Fetch ETL status logs
        const { data: etlLogs, error: etlError } = await supabase
          .from('etl_status')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (etlError) throw etlError;
        
        setChangeLogData(changeLogs || []);
        setEtlStatusData(etlLogs || []);
      } catch (error) {
        console.error("Error fetching logs:", error);
        toast({
          title: "Error",
          description: "Failed to load log data",
          variant: "destructive",
        });
        
        // Provide mock data for preview if error occurred
        setChangeLogData([
          {
            id: 'mock-1',
            operation: 'bulk_update',
            row_count: 150,
            actor: '123e4567-e89b-12d3-a456-426614174000',
            diff: {
              before: { status: 'NOT_LIVE' },
              after: { status: 'LIVE', note: 'Ready for global launch' }
            },
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-2',
            operation: 'status_change',
            row_count: 25,
            actor: '123e4567-e89b-12d3-a456-426614174000',
            diff: {
              before: { status: 'LIVE' },
              after: { status: 'ROLLED_BACK', blocker_category: 'Technical' }
            },
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
        
        setEtlStatusData([
          {
            run_id: 'mock-run-1',
            operation: 'csv_import',
            source: 'coverage_fact.csv',
            rows_processed: 2500,
            rows_created: 2000,
            rows_updated: 500,
            errors: [],
            user_id: '123e4567-e89b-12d3-a456-426614174000',
            created_at: new Date().toISOString()
          },
          {
            run_id: 'mock-run-2',
            operation: 'api_refresh',
            source: 'https://api.example.com/data',
            rows_processed: 1800,
            rows_created: 200,
            rows_updated: 1600,
            errors: ['Error processing row 152: Invalid city code'],
            user_id: '123e4567-e89b-12d3-a456-426614174000',
            created_at: new Date(Date.now() - 172800000).toISOString()
          }
        ]);
      }
      
      setIsLoading(false);
    };
    
    fetchLogs();
  }, [toast]);

  const renderDiffContent = (diff: any) => {
    if (!diff) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Before:</h3>
          <pre className="bg-muted p-3 rounded text-sm overflow-auto max-h-40">
            {JSON.stringify(diff.before || {}, null, 2)}
          </pre>
        </div>
        <div>
          <h3 className="font-medium text-sm text-muted-foreground mb-1">After:</h3>
          <pre className="bg-muted p-3 rounded text-sm overflow-auto max-h-40">
            {JSON.stringify(diff.after || {}, null, 2)}
          </pre>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">System Logs</h1>
        <p className="text-muted-foreground">View history of data imports and bulk edits</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="changes">Change Logs</TabsTrigger>
          <TabsTrigger value="etl">Data Import Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="changes">
          <div className="bg-white rounded-md shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Rows Affected</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : changeLogData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      No change logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  changeLogData.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>{format(new Date(log.created_at), "MMM d, yyyy h:mm a")}</TableCell>
                      <TableCell className="capitalize">{log.operation.replace(/_/g, ' ')}</TableCell>
                      <TableCell>{log.row_count}</TableCell>
                      <TableCell>{log.actor ? log.actor.substring(0, 8) + '...' : 'System'}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedLog(log)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="etl">
          <div className="bg-white rounded-md shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : etlStatusData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      No ETL logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  etlStatusData.map(log => (
                    <TableRow key={log.run_id}>
                      <TableCell>{format(new Date(log.created_at), "MMM d, yyyy h:mm a")}</TableCell>
                      <TableCell className="capitalize">{log.operation.replace(/_/g, ' ')}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={log.source}>{log.source}</TableCell>
                      <TableCell>{log.rows_processed}</TableCell>
                      <TableCell>{log.rows_created}</TableCell>
                      <TableCell>{log.rows_updated}</TableCell>
                      <TableCell>
                        {log.errors && log.errors.length > 0 ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => setSelectedLog(log)}
                          >
                            {log.errors.length} Error{log.errors.length > 1 ? 's' : ''}
                          </Button>
                        ) : (
                          <span className="text-green-600 font-medium">Success</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'changes' ? 'Change Log Details' : 'Import Log Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && activeTab === 'changes' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Operation</h3>
                  <p className="capitalize">{selectedLog.operation.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date & Time</h3>
                  <p>{format(new Date(selectedLog.created_at), "MMMM d, yyyy h:mm:ss a")}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">User ID</h3>
                  <p>{selectedLog.actor || 'System'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Rows Affected</h3>
                  <p>{selectedLog.row_count}</p>
                </div>
              </div>
              
              <div className="pt-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Changes</h3>
                {renderDiffContent(selectedLog.diff)}
              </div>
            </div>
          )}
          
          {selectedLog && activeTab === 'etl' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Run ID</h3>
                  <p className="font-mono text-xs">{selectedLog.run_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date & Time</h3>
                  <p>{format(new Date(selectedLog.created_at), "MMMM d, yyyy h:mm:ss a")}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Operation</h3>
                  <p className="capitalize">{selectedLog.operation.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Source</h3>
                  <p className="break-all">{selectedLog.source}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">User ID</h3>
                  <p>{selectedLog.user_id || 'System'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Statistics</h3>
                  <p>
                    Processed: {selectedLog.rows_processed}, 
                    Created: {selectedLog.rows_created}, 
                    Updated: {selectedLog.rows_updated}
                  </p>
                </div>
              </div>
              
              {selectedLog.errors && selectedLog.errors.length > 0 && (
                <div className="pt-2">
                  <h3 className="text-sm font-medium text-red-500 mb-2">Errors ({selectedLog.errors.length})</h3>
                  <div className="bg-red-50 border border-red-200 rounded p-3 max-h-60 overflow-y-auto">
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedLog.errors.map((error: string, index: number) => (
                        <li key={index} className="text-sm text-red-700">{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Logs;
