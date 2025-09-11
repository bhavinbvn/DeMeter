export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      crop_predictions: {
        Row: {
          confidence_score: number | null
          created_at: string
          crop_type: string
          fertilizer_used: string | null
          field_area: number
          humidity: number | null
          id: string
          irrigation_method: string | null
          nitrogen_level: number | null
          phosphorus_level: number | null
          potassium_level: number | null
          predicted_yield: number | null
          rainfall: number | null
          recommendations: Json | null
          soil_moisture: number | null
          soil_ph: number | null
          temperature: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          crop_type: string
          fertilizer_used?: string | null
          field_area: number
          humidity?: number | null
          id?: string
          irrigation_method?: string | null
          nitrogen_level?: number | null
          phosphorus_level?: number | null
          potassium_level?: number | null
          predicted_yield?: number | null
          rainfall?: number | null
          recommendations?: Json | null
          soil_moisture?: number | null
          soil_ph?: number | null
          temperature?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          crop_type?: string
          fertilizer_used?: string | null
          field_area?: number
          humidity?: number | null
          id?: string
          irrigation_method?: string | null
          nitrogen_level?: number | null
          phosphorus_level?: number | null
          potassium_level?: number | null
          predicted_yield?: number | null
          rainfall?: number | null
          recommendations?: Json | null
          soil_moisture?: number | null
          soil_ph?: number | null
          temperature?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      device_data: {
        Row: {
          data_type: string
          device_id: string
          id: string
          metadata: Json | null
          timestamp: string
          unit: string | null
          value: number
        }
        Insert: {
          data_type: string
          device_id: string
          id?: string
          metadata?: Json | null
          timestamp?: string
          unit?: string | null
          value: number
        }
        Update: {
          data_type?: string
          device_id?: string
          id?: string
          metadata?: Json | null
          timestamp?: string
          unit?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "device_data_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "iot_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      iot_devices: {
        Row: {
          created_at: string
          device_id: string
          device_name: string
          device_type: string
          id: string
          is_active: boolean
          last_data_received: string | null
          location: string | null
          metadata: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_id: string
          device_name: string
          device_type?: string
          id?: string
          is_active?: boolean
          last_data_received?: string | null
          location?: string | null
          metadata?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_id?: string
          device_name?: string
          device_type?: string
          id?: string
          is_active?: boolean
          last_data_received?: string | null
          location?: string | null
          metadata?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          farm_name: string | null
          farm_size: number | null
          full_name: string | null
          id: string
          location: string | null
          phone_number: string | null
          primary_crops: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          farm_name?: string | null
          farm_size?: number | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone_number?: string | null
          primary_crops?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          farm_name?: string | null
          farm_size?: number | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone_number?: string | null
          primary_crops?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          category: string
          created_at: string
          description: string
          expected_impact: string | null
          id: string
          implementation_cost: number | null
          prediction_id: string
          priority: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          expected_impact?: string | null
          id?: string
          implementation_cost?: number | null
          prediction_id: string
          priority?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          expected_impact?: string | null
          id?: string
          implementation_cost?: number | null
          prediction_id?: string
          priority?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "crop_predictions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
