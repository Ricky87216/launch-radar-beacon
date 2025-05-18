import { supabase } from "@/integrations/supabase/client";
import { EscalationStatus, DatabaseEscalationStatus, mapAppStatusToDatabaseStatus, mapDatabaseStatusToAppStatus } from "@/types";

export type MarketType = 'city' | 'country' | 'region';

export interface EscalationFormData {
  poc: string;
  reason: string;
  businessCaseUrl: string;
  reasonType: string;
}

export interface ExtendedEscalationFormData extends EscalationFormData {
  techPoc?: string;
  techSponsor?: string;
  opsPoc?: string;
  opsSponsor?: string;
  additionalStakeholders?: string;
}

// Type for escalation history/comments from the database
export interface EscalationHistoryItem {
  id: string;
  escalation_id: string;
  user_id: string;
  old_status?: DatabaseEscalationStatus | null;
  new_status?: DatabaseEscalationStatus;
  notes?: string | null;
  changed_at: string;
}

export const getMarketIdField = (marketType: MarketType) => {
  switch (marketType) {
    case 'city':
      return 'city_id';
    case 'country':
      return 'country_code';
    case 'region':
      return 'region';
    default:
      return 'city_id';
  }
};

export const getScopeLevel = (marketType: MarketType): "CITY" | "COUNTRY" | "REGION" => {
  return marketType.toUpperCase() as "CITY" | "COUNTRY" | "REGION";
};

export const loadEscalationHistory = async (productId: string, marketId: string, marketType: MarketType) => {
  try {
    // Look for existing escalation first
    const { data: escalations } = await supabase
      .from("escalation")
      .select("esc_id")
      .eq("product_id", productId)
      .eq(getMarketIdField(marketType), marketId)
      .eq("scope_level", getScopeLevel(marketType));
    
    if (escalations && escalations.length > 0) {
      const escalationId = escalations[0].esc_id;
      
      // Now get history for this escalation
      const { data: historyData } = await supabase
        .from("escalation_history")
        .select("*")
        .eq("escalation_id", escalationId)
        .order("changed_at", { ascending: false });
      
      return historyData || [];
    }
    return [];
  } catch (error) {
    console.error("Failed to load escalation history:", error);
    return [];
  }
};

export const submitEscalation = async (
  formData: ExtendedEscalationFormData, 
  productId: string, 
  marketId: string, 
  marketType: MarketType, 
  userName: string
) => {
  try {
    // Create the escalation record
    const appStatus: EscalationStatus = "SUBMITTED";
    const dbStatus = mapAppStatusToDatabaseStatus(appStatus);
    
    const insertData = {
      product_id: productId,
      scope_level: getScopeLevel(marketType),
      ...(marketType === 'city' ? { city_id: marketId } : {}),
      ...(marketType === 'country' ? { country_code: marketId } : {}),
      ...(marketType === 'region' ? { region: marketId } : {}),
      raised_by: userName,
      poc: formData.poc,
      reason: formData.reason,
      reason_type: formData.reasonType,
      business_case_url: formData.businessCaseUrl || null,
      tech_poc: formData.techPoc || null,
      tech_sponsor: formData.techSponsor || null,
      ops_poc: formData.opsPoc || null,
      ops_sponsor: formData.opsSponsor || null,
      additional_stakeholders: formData.additionalStakeholders || null,
      status: dbStatus,
    };
    
    // Insert the escalation
    const { data, error } = await supabase
      .from("escalation")
      .insert(insertData as any)
      .select();
      
    if (error) throw error;
    
    // Create initial history record (important for showing in the log)
    if (data && data.length > 0) {
      const escalationId = data[0].esc_id;
      
      // Add initial history record
      await supabase
        .from("escalation_history")
        .insert({
          escalation_id: escalationId,
          user_id: userName,
          old_status: null,
          new_status: dbStatus,
          notes: `Escalation created: ${formData.reason.substring(0, 50)}${formData.reason.length > 50 ? '...' : ''}`
        });
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Error submitting escalation:", error);
    return { data: null, error };
  }
};

export const updateEscalationStatus = async (
  escalationId: string,
  newStatus: EscalationStatus,
  note: string = ""
) => {
  // Convert app status to database status
  const dbStatus = mapAppStatusToDatabaseStatus(newStatus);
  
  // Get current status first
  const { data: currentEscalation } = await supabase
    .from("escalation")
    .select("status")
    .eq("esc_id", escalationId)
    .single();
    
  if (!currentEscalation) {
    throw new Error("Escalation not found");
  }
  
  // Update the escalation status
  const updateData = {
    status: dbStatus,
    ...(newStatus === 'RESOLVED_LAUNCHED' ? { aligned_at: new Date().toISOString() } : {}),
    ...(newStatus.startsWith('RESOLVED_') ? { resolved_at: new Date().toISOString() } : {})
  };
  
  const { data, error } = await supabase
    .from("escalation")
    .update(updateData as any)
    .eq("esc_id", escalationId)
    .select();
    
  if (error) throw error;
  
  // Log the status change in history
  await supabase
    .from("escalation_history")
    .insert({
      escalation_id: escalationId,
      user_id: "Current user", // This should be the actual user ID in production
      old_status: currentEscalation.status,
      new_status: dbStatus,
      notes: note || `Status changed to ${newStatus}`
    });
    
  return data;
};

export const addEscalationComment = async (
  escalationId: string,
  userId: string,
  comment: string
) => {
  // Get current status first
  const { data: currentEscalation } = await supabase
    .from("escalation")
    .select("status")
    .eq("esc_id", escalationId)
    .single();
    
  if (!currentEscalation) {
    throw new Error("Escalation not found");
  }
  
  // Add comment to history without changing status
  return await supabase
    .from("escalation_history")
    .insert({
      escalation_id: escalationId,
      user_id: userId,
      old_status: currentEscalation.status,
      new_status: currentEscalation.status, // Same status, just adding a comment
      notes: comment
    });
};

export const getEscalationDetails = async (escalationId: string) => {
  // Get the escalation details
  const { data, error } = await supabase
    .from("escalation")
    .select("*")
    .eq("esc_id", escalationId)
    .single();
  
  if (error) throw error;
  
  // Get the comments/history
  const { data: historyData } = await supabase
    .from("escalation_history")
    .select("*")
    .eq("escalation_id", escalationId)
    .order("changed_at", { ascending: false });
    
  return {
    ...data,
    status: mapDatabaseStatusToAppStatus(data.status),
    history: historyData || []
  };
};

export const logEscalationAction = async (product: string, market: string) => {
  return await supabase.from("change_log").insert({
    operation: "create_escalation",
    rows_processed: 1,
    diff: { product, market }
  } as any);
};
