
import React from "react";

interface HistoryRecord {
  id: string;
  old_status?: string;
  new_status: string;
  changed_at: string;
  user_id: string;
  notes?: string;
}

interface EscalationHistoryProps {
  history: HistoryRecord[];
}

const EscalationHistory: React.FC<EscalationHistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No history found for this escalation.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((record) => (
        <div
          key={record.id}
          className="border rounded p-3 text-sm"
        >
          <div className="flex justify-between mb-1">
            <span className="font-medium">
              {record.old_status || 'Created'} → {record.new_status}
            </span>
            <span className="text-muted-foreground">
              {new Date(record.changed_at).toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            By: {record.user_id}
          </div>
          {record.notes && (
            <div className="mt-1 text-sm">{record.notes}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EscalationHistory;
