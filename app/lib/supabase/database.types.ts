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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      bookmarks: {
        Row: {
          chapter_slug: string
          created_at: string
          id: string
          label: string | null
          user_id: string
        }
        Insert: {
          chapter_slug: string
          created_at?: string
          id?: string
          label?: string | null
          user_id: string
        }
        Update: {
          chapter_slug?: string
          created_at?: string
          id?: string
          label?: string | null
          user_id?: string
        }
        Relationships: []
      }
      canvases: {
        Row: {
          created_at: string
          doc: Json
          id: string
          name: string
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doc?: Json
          id?: string
          name?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doc?: Json
          id?: string
          name?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      case_submissions: {
        Row: {
          body: string
          case_id: string
          id: string
          pm_ai_response: Json | null
          started_at: string
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          case_id: string
          id?: string
          pm_ai_response?: Json | null
          started_at?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          case_id?: string
          id?: string
          pm_ai_response?: Json | null
          started_at?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chapter_reads: {
        Row: {
          book: string | null
          chapter_slug: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          book?: string | null
          chapter_slug: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          book?: string | null
          chapter_slug?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_log: {
        Row: {
          body: string
          created_at: string
          day: string
          id: string
          locked: boolean
          node_tag: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          day?: string
          id?: string
          locked?: boolean
          node_tag?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          day?: string
          id?: string
          locked?: boolean
          node_tag?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      diagnostic_results: {
        Row: {
          answers: Json
          created_at: string
          id: string
          score: Json
          seeded_nodes: string[]
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          score?: Json
          seeded_nodes?: string[]
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          score?: Json
          seeded_nodes?: string[]
          user_id?: string
        }
        Relationships: []
      }
      game_attempts: {
        Row: {
          created_at: string
          detail: Json
          game: string
          id: string
          level: number
          passed: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: Json
          game: string
          id?: string
          level: number
          passed: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          detail?: Json
          game?: string
          id?: string
          level?: number
          passed?: boolean
          user_id?: string
        }
        Relationships: []
      }
      game_scores: {
        Row: {
          game: string
          id: string
          level: number
          meta: Json
          played_at: string
          score: number
          user_id: string
        }
        Insert: {
          game: string
          id?: string
          level?: number
          meta?: Json
          played_at?: string
          score?: number
          user_id: string
        }
        Update: {
          game?: string
          id?: string
          level?: number
          meta?: Json
          played_at?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      heatmap_activity: {
        Row: {
          created_at: string
          day: string
          id: string
          source: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          day?: string
          id?: string
          source: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          day?: string
          id?: string
          source?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      node_progress: {
        Row: {
          completed_at: string | null
          id: string
          node_id: string
          node_level: string
          started_at: string | null
          state: string
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          node_id: string
          node_level: string
          started_at?: string | null
          state?: string
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          node_id?: string
          node_level?: string
          started_at?: string | null
          state?: string
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          body: string
          id: string
          node_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          id?: string
          node_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          id?: string
          node_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pm_ai_declines: {
        Row: {
          case_id: string | null
          created_at: string
          id: string
          kind: string
          prompt_summary: string
          response: string | null
          user_id: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          id?: string
          kind: string
          prompt_summary: string
          response?: string | null
          user_id: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          prompt_summary?: string
          response?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pm_ai_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          handle: string | null
          id: string
          onboarding_done: boolean
          reduce_effects: boolean
          share_public: boolean
          skin: string
          theme: string
          updated_at: string
          wallpaper_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          handle?: string | null
          id: string
          onboarding_done?: boolean
          reduce_effects?: boolean
          share_public?: boolean
          skin?: string
          theme?: string
          updated_at?: string
          wallpaper_id?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          handle?: string | null
          id?: string
          onboarding_done?: boolean
          reduce_effects?: boolean
          share_public?: boolean
          skin?: string
          theme?: string
          updated_at?: string
          wallpaper_id?: string
        }
        Relationships: []
      }
      review_items: {
        Row: {
          concept: string
          created_at: string
          due_on: string
          ease: number
          id: string
          interval_days: number
          last_reviewed_at: string | null
          node_id: string
          reps: number
          user_id: string
        }
        Insert: {
          concept: string
          created_at?: string
          due_on?: string
          ease?: number
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          node_id: string
          reps?: number
          user_id: string
        }
        Update: {
          concept?: string
          created_at?: string
          due_on?: string
          ease?: number
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          node_id?: string
          reps?: number
          user_id?: string
        }
        Relationships: []
      }
      tool_installs: {
        Row: {
          id: string
          installed_at: string
          tool_id: string
          user_id: string
        }
        Insert: {
          id?: string
          installed_at?: string
          tool_id: string
          user_id: string
        }
        Update: {
          id?: string
          installed_at?: string
          tool_id?: string
          user_id?: string
        }
        Relationships: []
      }
      video_catalog: {
        Row: {
          channel: string
          created_at: string
          difficulty: string | null
          duration_seconds: number | null
          id: string
          skill_tags: string[]
          title: string
        }
        Insert: {
          channel: string
          created_at?: string
          difficulty?: string | null
          duration_seconds?: number | null
          id: string
          skill_tags?: string[]
          title: string
        }
        Update: {
          channel?: string
          created_at?: string
          difficulty?: string | null
          duration_seconds?: number | null
          id?: string
          skill_tags?: string[]
          title?: string
        }
        Relationships: []
      }
      video_watches: {
        Row: {
          id: string
          note: string | null
          user_id: string
          video_id: string
          watched_at: string
        }
        Insert: {
          id?: string
          note?: string | null
          user_id: string
          video_id: string
          watched_at?: string
        }
        Update: {
          id?: string
          note?: string | null
          user_id?: string
          video_id?: string
          watched_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_watches_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_queue: {
        Row: {
          added_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          added_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_queue_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_events: {
        Row: {
          action: string
          amount: number
          created_at: string
          id: string
          meta: Json
          user_id: string
        }
        Insert: {
          action: string
          amount: number
          created_at?: string
          id?: string
          meta?: Json
          user_id: string
        }
        Update: {
          action?: string
          amount?: number
          created_at?: string
          id?: string
          meta?: Json
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      shared_progress: { Args: { p_handle: string }; Returns: Json }
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
