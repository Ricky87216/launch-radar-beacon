export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cell_comment: {
        Row: {
          answer: string | null
          answered_at: string | null
          author_id: string
          city_id: string
          comment_id: string
          created_at: string
          product_id: string
          question: string
          status: string
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          author_id: string
          city_id: string
          comment_id?: string
          created_at?: string
          product_id: string
          question: string
          status?: string
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          author_id?: string
          city_id?: string
          comment_id?: string
          created_at?: string
          product_id?: string
          question?: string
          status?: string
        }
        Relationships: []
      }
      change_log: {
        Row: {
          actor: string | null
          created_at: string
          diff: Json
          id: string
          operation: string
          row_count: number
        }
        Insert: {
          actor?: string | null
          created_at?: string
          diff: Json
          id?: string
          operation: string
          row_count: number
        }
        Update: {
          actor?: string | null
          created_at?: string
          diff?: Json
          id?: string
          operation?: string
          row_count?: number
        }
        Relationships: []
      }
      coverage_fact: {
        Row: {
          city_id: string
          id: number
          product_id: string
          status: string
          updated_at: string
        }
        Insert: {
          city_id: string
          id?: number
          product_id: string
          status: string
          updated_at?: string
        }
        Update: {
          city_id?: string
          id?: number
          product_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coverage_fact_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "market_dim"
            referencedColumns: ["city_id"]
          },
        ]
      }
      escalation: {
        Row: {
          aligned_at: string | null
          business_case_url: string | null
          city_id: string | null
          country_code: string | null
          created_at: string
          esc_id: string
          poc: string
          product_id: string
          raised_by: string
          reason: string
          reason_type: string | null
          region: string | null
          resolved_at: string | null
          scope_level: Database["public"]["Enums"]["scope_level_enum"]
          status: Database["public"]["Enums"]["escalation_status_enum"]
        }
        Insert: {
          aligned_at?: string | null
          business_case_url?: string | null
          city_id?: string | null
          country_code?: string | null
          created_at?: string
          esc_id?: string
          poc: string
          product_id: string
          raised_by: string
          reason: string
          reason_type?: string | null
          region?: string | null
          resolved_at?: string | null
          scope_level: Database["public"]["Enums"]["scope_level_enum"]
          status?: Database["public"]["Enums"]["escalation_status_enum"]
        }
        Update: {
          aligned_at?: string | null
          business_case_url?: string | null
          city_id?: string | null
          country_code?: string | null
          created_at?: string
          esc_id?: string
          poc?: string
          product_id?: string
          raised_by?: string
          reason?: string
          reason_type?: string | null
          region?: string | null
          resolved_at?: string | null
          scope_level?: Database["public"]["Enums"]["scope_level_enum"]
          status?: Database["public"]["Enums"]["escalation_status_enum"]
        }
        Relationships: []
      }
      escalation_history: {
        Row: {
          changed_at: string
          escalation_id: string
          id: string
          new_status: Database["public"]["Enums"]["escalation_status_enum"]
          notes: string | null
          old_status:
            | Database["public"]["Enums"]["escalation_status_enum"]
            | null
          user_id: string
        }
        Insert: {
          changed_at?: string
          escalation_id: string
          id?: string
          new_status: Database["public"]["Enums"]["escalation_status_enum"]
          notes?: string | null
          old_status?:
            | Database["public"]["Enums"]["escalation_status_enum"]
            | null
          user_id: string
        }
        Update: {
          changed_at?: string
          escalation_id?: string
          id?: string
          new_status?: Database["public"]["Enums"]["escalation_status_enum"]
          notes?: string | null
          old_status?:
            | Database["public"]["Enums"]["escalation_status_enum"]
            | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "escalation_history_escalation_id_fkey"
            columns: ["escalation_id"]
            isOneToOne: false
            referencedRelation: "escalation"
            referencedColumns: ["esc_id"]
          },
        ]
      }
      etl_status: {
        Row: {
          created_at: string
          errors: string[]
          operation: string
          rows_created: number
          rows_processed: number
          rows_updated: number
          run_id: string
          source: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          errors?: string[]
          operation: string
          rows_created?: number
          rows_processed?: number
          rows_updated?: number
          run_id?: string
          source: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          errors?: string[]
          operation?: string
          rows_created?: number
          rows_processed?: number
          rows_updated?: number
          run_id?: string
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      market_dim: {
        Row: {
          city_id: string
          city_name: string
          country_code: string
          country_name: string
          created_at: string
          gb_weight: number
          id: number
          region: string
          updated_at: string
        }
        Insert: {
          city_id: string
          city_name: string
          country_code: string
          country_name: string
          created_at?: string
          gb_weight: number
          id?: number
          region: string
          updated_at?: string
        }
        Update: {
          city_id?: string
          city_name?: string
          country_code?: string
          country_name?: string
          created_at?: string
          gb_weight?: number
          id?: number
          region?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_meta: {
        Row: {
          company_priority: string | null
          description: string | null
          launch_date: string | null
          newsletter_url: string | null
          pm_poc: string | null
          prd_link: string | null
          prod_ops_poc: string | null
          product_id: string
          screenshot_url: string | null
          xp_plan: string | null
        }
        Insert: {
          company_priority?: string | null
          description?: string | null
          launch_date?: string | null
          newsletter_url?: string | null
          pm_poc?: string | null
          prd_link?: string | null
          prod_ops_poc?: string | null
          product_id: string
          screenshot_url?: string | null
          xp_plan?: string | null
        }
        Update: {
          company_priority?: string | null
          description?: string | null
          launch_date?: string | null
          newsletter_url?: string | null
          pm_poc?: string | null
          prd_link?: string | null
          prod_ops_poc?: string | null
          product_id?: string
          screenshot_url?: string | null
          xp_plan?: string | null
        }
        Relationships: []
      }
      user_pref: {
        Row: {
          countries: string[]
          created_at: string
          regions: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          countries?: string[]
          created_at?: string
          regions?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          countries?: string[]
          created_at?: string
          regions?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_watchlist: {
        Row: {
          created_at: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_market_escalated: {
        Args: { p_product_id: string; p_market_id: string }
        Returns: boolean
      }
    }
    Enums: {
      escalation_status_enum: "OPEN" | "ALIGNED" | "RESOLVED"
      scope_level_enum: "CITY" | "COUNTRY" | "STATE" | "REGION"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      escalation_status_enum: ["OPEN", "ALIGNED", "RESOLVED"],
      scope_level_enum: ["CITY", "COUNTRY", "STATE", "REGION"],
    },
  },
} as const
