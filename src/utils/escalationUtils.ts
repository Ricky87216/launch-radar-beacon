
import { supabase } from "@/integrations/supabase/client";
import { EscalationStatus, mapAppStatusToDatabaseStatus } from "@/types";

export type MarketType = 'city' | 'country' | 'region';

export interface EscalationFormData {
  poc: string;
  reason: string;
  businessCaseUrl: string;
  reasonType: string;
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
  formData: EscalationFormData, 
  productId: string, 
  marketId: string, 
  marketType: MarketType, 
  userName: string
) => {
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
    status: dbStatus,
  };
  
  return await supabase
    .from("escalation")
    .insert(insertData as any)
    .select();
};

export const logEscalationAction = async (product: string, market: string) => {
  return await supabase.from("change_log").insert({
    operation: "create_escalation",
    rows_processed: 1,
    diff: { product, market }
  } as any);
};
