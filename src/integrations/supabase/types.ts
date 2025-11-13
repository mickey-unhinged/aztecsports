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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      about: {
        Row: {
          created_at: string | null
          hero_image_url: string | null
          id: string
          mission: string
          subtitle: string
          title: string
          updated_at: string | null
          vision: string
        }
        Insert: {
          created_at?: string | null
          hero_image_url?: string | null
          id?: string
          mission: string
          subtitle: string
          title: string
          updated_at?: string | null
          vision: string
        }
        Update: {
          created_at?: string | null
          hero_image_url?: string | null
          id?: string
          mission?: string
          subtitle?: string
          title?: string
          updated_at?: string | null
          vision?: string
        }
        Relationships: []
      }
      about_stats: {
        Row: {
          about_id: string | null
          created_at: string | null
          id: string
          label: string
          number: string
          order_index: number | null
        }
        Insert: {
          about_id?: string | null
          created_at?: string | null
          id?: string
          label: string
          number: string
          order_index?: number | null
        }
        Update: {
          about_id?: string | null
          created_at?: string | null
          id?: string
          label?: string
          number?: string
          order_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "about_stats_about_id_fkey"
            columns: ["about_id"]
            isOneToOne: false
            referencedRelation: "about"
            referencedColumns: ["id"]
          },
        ]
      }
      about_values: {
        Row: {
          about_id: string | null
          created_at: string | null
          description: string
          icon: string | null
          id: string
          order_index: number | null
          title: string
        }
        Insert: {
          about_id?: string | null
          created_at?: string | null
          description: string
          icon?: string | null
          id?: string
          order_index?: number | null
          title: string
        }
        Update: {
          about_id?: string | null
          created_at?: string | null
          description?: string
          icon?: string | null
          id?: string
          order_index?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "about_values_about_id_fkey"
            columns: ["about_id"]
            isOneToOne: false
            referencedRelation: "about"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          category: string
          content: string | null
          created_at: string | null
          excerpt: string
          featured_image_url: string | null
          id: string
          priority: string
          published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string | null
          excerpt: string
          featured_image_url?: string | null
          id?: string
          priority?: string
          published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string | null
          excerpt?: string
          featured_image_url?: string | null
          id?: string
          priority?: string
          published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_info: {
        Row: {
          address: string
          created_at: string | null
          email: string
          id: string
          phone: string
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          email: string
          id?: string
          phone: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          email?: string
          id?: string
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          away_team_logo_url: string | null
          away_team_name: string
          away_team_score: number | null
          competition: string
          created_at: string | null
          date: string
          highlights: string | null
          home_team_logo_url: string | null
          home_team_name: string
          home_team_score: number | null
          id: string
          match_report: string | null
          published: boolean | null
          status: string
          updated_at: string | null
          venue: string
        }
        Insert: {
          away_team_logo_url?: string | null
          away_team_name: string
          away_team_score?: number | null
          competition: string
          created_at?: string | null
          date: string
          highlights?: string | null
          home_team_logo_url?: string | null
          home_team_name: string
          home_team_score?: number | null
          id?: string
          match_report?: string | null
          published?: boolean | null
          status?: string
          updated_at?: string | null
          venue: string
        }
        Update: {
          away_team_logo_url?: string | null
          away_team_name?: string
          away_team_score?: number | null
          competition?: string
          created_at?: string | null
          date?: string
          highlights?: string | null
          home_team_logo_url?: string | null
          home_team_name?: string
          home_team_score?: number | null
          id?: string
          match_report?: string | null
          published?: boolean | null
          status?: string
          updated_at?: string | null
          venue?: string
        }
        Relationships: []
      }
      membership_plans: {
        Row: {
          button_text: string | null
          created_at: string | null
          description: string
          featured: boolean | null
          features: string[] | null
          icon: string | null
          id: string
          name: string
          order_index: number | null
          period: string
          price: string
          published: boolean | null
          stripe_price_id: string | null
          updated_at: string | null
        }
        Insert: {
          button_text?: string | null
          created_at?: string | null
          description: string
          featured?: boolean | null
          features?: string[] | null
          icon?: string | null
          id?: string
          name: string
          order_index?: number | null
          period?: string
          price: string
          published?: boolean | null
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Update: {
          button_text?: string | null
          created_at?: string | null
          description?: string
          featured?: boolean | null
          features?: string[] | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number | null
          period?: string
          price?: string
          published?: boolean | null
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          plan_name: string
          status: string
          stripe_payment_id: string
          stripe_subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          plan_name: string
          status: string
          stripe_payment_id: string
          stripe_subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          plan_name?: string
          status?: string
          stripe_payment_id?: string
          stripe_subscription_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          membership_end_date: string | null
          membership_plan_id: string | null
          membership_start_date: string | null
          membership_status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          membership_end_date?: string | null
          membership_plan_id?: string | null
          membership_start_date?: string | null
          membership_status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          membership_end_date?: string | null
          membership_plan_id?: string | null
          membership_start_date?: string | null
          membership_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_membership_plan_id_fkey"
            columns: ["membership_plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      social_links: {
        Row: {
          contact_info_id: string | null
          created_at: string | null
          icon: string | null
          id: string
          order_index: number | null
          platform: string
          url: string
        }
        Insert: {
          contact_info_id?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          order_index?: number | null
          platform: string
          url: string
        }
        Update: {
          contact_info_id?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          order_index?: number | null
          platform?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_links_contact_info_id_fkey"
            columns: ["contact_info_id"]
            isOneToOne: false
            referencedRelation: "contact_info"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          about_id: string | null
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          order_index: number | null
          role: string
        }
        Insert: {
          about_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          order_index?: number | null
          role: string
        }
        Update: {
          about_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          order_index?: number | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_about_id_fkey"
            columns: ["about_id"]
            isOneToOne: false
            referencedRelation: "about"
            referencedColumns: ["id"]
          },
        ]
      }
      training_bookings: {
        Row: {
          created_at: string
          id: string
          session_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_bookings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          coach_name: string | null
          created_at: string
          date: string
          description: string | null
          duration: number
          id: string
          location: string
          max_participants: number | null
          published: boolean | null
          session_type: string
          title: string
          updated_at: string
        }
        Insert: {
          coach_name?: string | null
          created_at?: string
          date: string
          description?: string | null
          duration?: number
          id?: string
          location: string
          max_participants?: number | null
          published?: boolean | null
          session_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          coach_name?: string | null
          created_at?: string
          date?: string
          description?: string | null
          duration?: number
          id?: string
          location?: string
          max_participants?: number | null
          published?: boolean | null
          session_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
