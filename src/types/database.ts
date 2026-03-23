export type Database = {
  public: {
    Tables: {
      profiles: { Row: { id: string; full_name: string | null; email: string | null; avatar_url: string | null; plan: string; bio: string | null; created_at: string; updated_at: string } }
      memorials: { Row: { id: string; owner_id: string; slug: string; first_name: string; middle_name: string | null; last_name: string; date_of_birth: string | null; date_of_passing: string | null; birthplace: string | null; biography: string | null; profile_photo_url: string | null; cover_photo_url: string | null; theme: string; privacy: string; plan: string; visitor_count: number; created_at: string; updated_at: string } }
      tributes: { Row: { id: string; memorial_id: string; author_name: string; author_relationship: string | null; content: string; heart_count: number; is_ai_assisted: boolean; created_at: string } }
      candles: { Row: { id: string; memorial_id: string; lit_by_name: string; message: string | null; created_at: string } }
      photos: { Row: { id: string; memorial_id: string; url: string; caption: string | null; taken_at: string | null; created_at: string } }
      events: { Row: { id: string; memorial_id: string; title: string; description: string | null; event_date: string; location: string | null; is_virtual: boolean; created_at: string } }
      rsvps: { Row: { id: string; event_id: string; name: string; email: string; attending: boolean; created_at: string } }
      reminders: { Row: { id: string; memorial_id: string; user_id: string; reminder_type: string; reminder_date: string; is_active: boolean; last_sent_at: string | null; created_at: string } }
      ai_usage: { Row: { id: string; user_id: string; tool: string; tokens_used: number; created_at: string } }
      memorial_admins: { Row: { id: string; memorial_id: string; user_id: string; role: string; created_at: string } }
    }
    Views: {}
    Functions: {}
  }
}
