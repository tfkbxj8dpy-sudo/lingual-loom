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
      book_vocabulary: {
        Row: {
          book_id: string
          created_at: string | null
          definition: string | null
          id: string
          word: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          definition?: string | null
          id?: string
          word: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          definition?: string | null
          id?: string
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_vocabulary_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string | null
          cover_url: string | null
          created_at: string | null
          id: string
          language_id: string
          rating: number | null
          review: string | null
          summary: string | null
          title: string
          user_id: string
        }
        Insert: {
          author?: string | null
          cover_url?: string | null
          created_at?: string | null
          id?: string
          language_id: string
          rating?: number | null
          review?: string | null
          summary?: string | null
          title: string
          user_id: string
        }
        Update: {
          author?: string | null
          cover_url?: string | null
          created_at?: string | null
          id?: string
          language_id?: string
          rating?: number | null
          review?: string | null
          summary?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          language_id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          language_id: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          language_id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_exercises: {
        Row: {
          answer: string
          created_at: string | null
          exercise_type: string | null
          explanation: string | null
          id: string
          options: Json | null
          question: string
          questions: Json | null
          rule_id: string
          sentences: string[] | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          exercise_type?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          question: string
          questions?: Json | null
          rule_id: string
          sentences?: string[] | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          exercise_type?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          question?: string
          questions?: Json | null
          rule_id?: string
          sentences?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "grammar_exercises_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "grammar_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_rules: {
        Row: {
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          language_id: string
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          language_id: string
          title: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          language_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grammar_rules_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          created_at: string | null
          flag_emoji: string | null
          id: string
          name: string
          role: Database["public"]["Enums"]["language_role"] | null
          teacher_user_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          flag_emoji?: string | null
          id?: string
          name: string
          role?: Database["public"]["Enums"]["language_role"] | null
          teacher_user_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          flag_emoji?: string | null
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["language_role"] | null
          teacher_user_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      movie_vocabulary: {
        Row: {
          created_at: string | null
          definition: string | null
          id: string
          movie_id: string
          word: string
        }
        Insert: {
          created_at?: string | null
          definition?: string | null
          id?: string
          movie_id: string
          word: string
        }
        Update: {
          created_at?: string | null
          definition?: string | null
          id?: string
          movie_id?: string
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "movie_vocabulary_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      movies: {
        Row: {
          created_at: string | null
          id: string
          language_id: string
          poster_url: string | null
          rating: number | null
          review: string | null
          summary: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language_id: string
          poster_url?: string | null
          rating?: number | null
          review?: string | null
          summary?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language_id?: string
          poster_url?: string | null
          rating?: number | null
          review?: string | null
          summary?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movies_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      music: {
        Row: {
          artist: string | null
          cover_url: string | null
          created_at: string | null
          id: string
          language_id: string
          lyrics: string | null
          title: string
          translation: string | null
          user_id: string
        }
        Insert: {
          artist?: string | null
          cover_url?: string | null
          created_at?: string | null
          id?: string
          language_id: string
          lyrics?: string | null
          title: string
          translation?: string | null
          user_id: string
        }
        Update: {
          artist?: string | null
          cover_url?: string | null
          created_at?: string | null
          id?: string
          language_id?: string
          lyrics?: string | null
          title?: string
          translation?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "music_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          username?: string | null
        }
        Relationships: []
      }
      review_feedback: {
        Row: {
          created_at: string
          feedback: string
          id: string
          item_id: string
          item_type: string
          student_user_id: string
          teacher_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          feedback: string
          id?: string
          item_id: string
          item_type: string
          student_user_id: string
          teacher_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          feedback?: string
          id?: string
          item_id?: string
          item_type?: string
          student_user_id?: string
          teacher_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      speaking_questions: {
        Row: {
          created_at: string | null
          id: string
          question: string
          topic_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          question: string
          topic_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          question?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "speaking_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "speaking_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      speaking_recordings: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          question_id: string
          recording_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          question_id: string
          recording_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          question_id?: string
          recording_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "speaking_recordings_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "speaking_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      speaking_topics: {
        Row: {
          created_at: string | null
          id: string
          language_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "speaking_topics_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      words: {
        Row: {
          category_id: string | null
          created_at: string | null
          definition: string
          difficulty: string | null
          example_sentence: string | null
          forgot_count: number | null
          id: string
          image_url: string | null
          language_id: string
          learned: boolean | null
          user_id: string
          word: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          definition: string
          difficulty?: string | null
          example_sentence?: string | null
          forgot_count?: number | null
          id?: string
          image_url?: string | null
          language_id: string
          learned?: boolean | null
          user_id: string
          word: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          definition?: string
          difficulty?: string | null
          example_sentence?: string | null
          forgot_count?: number | null
          id?: string
          image_url?: string | null
          language_id?: string
          learned?: boolean | null
          user_id?: string
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "words_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "words_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_starter_language_data: {
        Args:
          | {
              p_flag_emoji: string
              p_language_name: string
              p_role?: Database["public"]["Enums"]["language_role"]
              p_teacher_user_id?: string
              p_user_id: string
            }
          | { p_flag_emoji: string; p_language_name: string; p_user_id: string }
        Returns: string
      }
    }
    Enums: {
      language_role: "teacher" | "student"
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
    Enums: {
      language_role: ["teacher", "student"],
    },
  },
} as const
