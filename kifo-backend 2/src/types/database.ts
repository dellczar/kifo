export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12"
  }
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null; email: string | null; avatar_url: string | null; plan: string; bio: string | null; created_at: string; updated_at: string }
        Insert: { id: string; full_name?: string | null; email?: string | null; avatar_url?: string | null; plan?: string; bio?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; full_name?: string | null; email?: string | null; avatar_url?: string | null; plan?: string; bio?: string | null; created_at?: string; updated_at?: string }
        Relationships: never[]
      }
      memorials: {
        Row: { id: string; owner_id: string; slug: string; first_name: string; middle_name: string | null; last_name: string; date_of_birth: string | null; date_of_passing: string | null; birthplace: string | null; biography: string | null; profile_photo_url: string | null; cover_photo_url: string | null; theme: string; privacy: string; plan: string; visitor_count: number; created_at: string; updated_at: string }
        Insert: { id?: string; owner_id: string; slug: string; first_name: string; middle_name?: string | null; last_name: string; date_of_birth?: string | null; date_of_passing?: string | null; birthplace?: string | null; biography?: string | null; profile_photo_url?: string | null; cover_photo_url?: string | null; theme?: string; privacy?: string; plan?: string; visitor_count?: number; created_at?: string; updated_at?: string }
        Update: { id?: string; owner_id?: string; slug?: string; first_name?: string; middle_name?: string | null; last_name?: string; date_of_birth?: string | null; date_of_passing?: string | null; birthplace?: string | null; biography?: string | null; profile_photo_url?: string | null; cover_photo_url?: string | null; theme?: string; privacy?: string; plan?: string; visitor_count?: number; created_at?: string; updated_at?: string }
        Relationships: never[]
      }
      tributes: {
        Row: { id: string; memorial_id: string; author_name: string; author_relationship: string | null; content: string; heart_count: number; is_ai_assisted: boolean; created_at: string }
        Insert: { id?: string; memorial_id: string; author_name: string; author_relationship?: string | null; content: string; heart_count?: number; is_ai_assisted?: boolean; created_at?: string }
        Update: { id?: string; memorial_id?: string; author_name?: string; author_relationship?: string | null; content?: string; heart_count?: number; is_ai_assisted?: boolean; created_at?: string }
        Relationships: never[]
      }
      candles: {
        Row: { id: string; memorial_id: string; lit_by_name: string; message: string | null; created_at: string }
        Insert: { id?: string; memorial_id: string; lit_by_name: string; message?: string | null; created_at?: string }
        Update: { id?: string; memorial_id?: string; lit_by_name?: string; message?: string | null; created_at?: string }
        Relationships: never[]
      }
      photos: {
        Row: { id: string; memorial_id: string; url: string; caption: string | null; taken_at: string | null; created_at: string }
        Insert: { id?: string; memorial_id: string; url: string; caption?: string | null; taken_at?: string | null; created_at?: string }
        Update: { id?: string; memorial_id?: string; url?: string; caption?: string | null; taken_at?: string | null; created_at?: string }
        Relationships: never[]
      }
      events: {
        Row: { id: string; memorial_id: string; title: string; description: string | null; event_date: string; location: string | null; is_virtual: boolean; created_at: string }
        Insert: { id?: string; memorial_id: string; title: string; description?: string | null; event_date: string; location?: string | null; is_virtual?: boolean; created_at?: string }
        Update: { id?: string; memorial_id?: string; title?: string; description?: string | null; event_date?: string; location?: string | null; is_virtual?: boolean; created_at?: string }
        Relationships: never[]
      }
      rsvps: {
        Row: { id: string; event_id: string; name: string; email: string; attending: boolean; created_at: string }
        Insert: { id?: string; event_id: string; name: string; email: string; attending?: boolean; created_at?: string }
        Update: { id?: string; event_id?: string; name?: string; email?: string; attending?: boolean; created_at?: string }
        Relationships: never[]
      }
      reminders: {
        Row: { id: string; memorial_id: string; user_id: string; reminder_type: string; reminder_date: string; is_active: boolean; last_sent_at: string | null; created_at: string }
        Insert: { id?: string; memorial_id: string; user_id: string; reminder_type: string; reminder_date: string; is_active?: boolean; last_sent_at?: string | null; created_at?: string }
        Update: { id?: string; memorial_id?: string; user_id?: string; reminder_type?: string; reminder_date?: string; is_active?: boolean; last_sent_at?: string | null; created_at?: string }
        Relationships: never[]
      }
      ai_usage: {
        Row: { id: string; user_id: string; tool: string; tokens_used: number; created_at: string }
        Insert: { id?: string; user_id: string; tool: string; tokens_used: number; created_at?: string }
        Update: { id?: string; user_id?: string; tool?: string; tokens_used?: number; created_at?: string }
        Relationships: never[]
      }
      memorial_admins: {
        Row: { id: string; memorial_id: string; user_id: string; role: string; created_at: string }
        Insert: { id?: string; memorial_id: string; user_id: string; role?: string; created_at?: string }
        Update: { id?: string; memorial_id?: string; user_id?: string; role?: string; created_at?: string }
        Relationships: never[]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
