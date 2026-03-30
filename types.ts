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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_active: boolean
          question: string
          section: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          section?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          section?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      inventory_reservations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          product_id: string
          quantity: number
          size: string
          status: string
          stripe_session_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          product_id: string
          quantity: number
          size: string
          status?: string
          stripe_session_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          product_id?: string
          quantity?: number
          size?: string
          status?: string
          stripe_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reservations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string | null
          delivery_option: Database["public"]["Enums"]["delivery_option"]
          id: string
          items: Json
          notes: string | null
          shipping_address: Json | null
          status: Database["public"]["Enums"]["order_status"]
          stripe_session_id: string | null
          total: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name?: string | null
          delivery_option: Database["public"]["Enums"]["delivery_option"]
          id?: string
          items?: Json
          notes?: string | null
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_session_id?: string | null
          total: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string | null
          delivery_option?: Database["public"]["Enums"]["delivery_option"]
          id?: string
          items?: Json
          notes?: string | null
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_session_id?: string | null
          total?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          badge: string | null
          brand: string
          category: Database["public"]["Enums"]["product_category"]
          category_id: string | null
          compare_at_price: number | null
          condition: Database["public"]["Enums"]["product_condition"]
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          inventory_count: number
          is_active: boolean
          is_best_seller: boolean
          price: number
          sizes: Json | null
          slug: string
          sort_order: number
          subcategory_id: string | null
          title: string
          updated_at: string
          variant_group_id: string | null
          variant_label: string | null
        }
        Insert: {
          badge?: string | null
          brand: string
          category: Database["public"]["Enums"]["product_category"]
          category_id?: string | null
          compare_at_price?: number | null
          condition?: Database["public"]["Enums"]["product_condition"]
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          inventory_count?: number
          is_active?: boolean
          is_best_seller?: boolean
          price: number
          sizes?: Json | null
          slug: string
          sort_order?: number
          subcategory_id?: string | null
          title: string
          updated_at?: string
          variant_group_id?: string | null
          variant_label?: string | null
        }
        Update: {
          badge?: string | null
          brand?: string
          category?: Database["public"]["Enums"]["product_category"]
          category_id?: string | null
          compare_at_price?: number | null
          condition?: Database["public"]["Enums"]["product_condition"]
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          inventory_count?: number
          is_active?: boolean
          is_best_seller?: boolean
          price?: number
          sizes?: Json | null
          slug?: string
          sort_order?: number
          subcategory_id?: string | null
          title?: string
          updated_at?: string
          variant_group_id?: string | null
          variant_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      site_content: {
        Row: {
          discord_url: string | null
          featured_button_link: string
          featured_button_text: string
          featured_description: string
          featured_image: string | null
          featured_label: string
          featured_title: string
          hero_button_link: string
          hero_button_text: string
          hero_images: string[] | null
          hero_secondary_button_link: string
          hero_secondary_button_text: string
          hero_subtitle: string
          hero_title: string
          id: string
          instagram_url: string | null
          lifestyle_image_links: string[] | null
          lifestyle_images: string[] | null
          tiktok_url: string | null
          tiktok_url_2: string | null
          updated_at: string
          vendors_button_text: string
          vendors_description: string
          vendors_image: string | null
          vendors_label: string
          vendors_title: string
        }
        Insert: {
          discord_url?: string | null
          featured_button_link?: string
          featured_button_text?: string
          featured_description?: string
          featured_image?: string | null
          featured_label?: string
          featured_title?: string
          hero_button_link?: string
          hero_button_text?: string
          hero_images?: string[] | null
          hero_secondary_button_link?: string
          hero_secondary_button_text?: string
          hero_subtitle?: string
          hero_title?: string
          id?: string
          instagram_url?: string | null
          lifestyle_image_links?: string[] | null
          lifestyle_images?: string[] | null
          tiktok_url?: string | null
          tiktok_url_2?: string | null
          updated_at?: string
          vendors_button_text?: string
          vendors_description?: string
          vendors_image?: string | null
          vendors_label?: string
          vendors_title?: string
        }
        Update: {
          discord_url?: string | null
          featured_button_link?: string
          featured_button_text?: string
          featured_description?: string
          featured_image?: string | null
          featured_label?: string
          featured_title?: string
          hero_button_link?: string
          hero_button_text?: string
          hero_images?: string[] | null
          hero_secondary_button_link?: string
          hero_secondary_button_text?: string
          hero_subtitle?: string
          hero_title?: string
          id?: string
          instagram_url?: string | null
          lifestyle_image_links?: string[] | null
          lifestyle_images?: string[] | null
          tiktok_url?: string | null
          tiktok_url_2?: string | null
          updated_at?: string
          vendors_button_text?: string
          vendors_description?: string
          vendors_image?: string | null
          vendors_label?: string
          vendors_title?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          logo_url: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          logo_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          logo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          category_id: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["product_category"]
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          location: string
          name: string
          rating: number
          sort_order: number
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          location: string
          name: string
          rating?: number
          sort_order?: number
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string
          name?: string
          rating?: number
          sort_order?: number
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_products: {
        Row: {
          beacons_url: string
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_best_deal: boolean | null
          original_price: number
          price: number
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          beacons_url: string
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_best_deal?: boolean | null
          original_price: number
          price: number
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          beacons_url?: string
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_best_deal?: boolean | null
          original_price?: number
          price?: number
          sort_order?: number
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
      cleanup_expired_reservations: { Args: never; Returns: undefined }
      finalize_reservation: {
        Args: { p_stripe_session_id: string }
        Returns: boolean
      }
      get_available_stock: {
        Args: { p_product_id: string; p_size: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      release_reservation: {
        Args: { p_stripe_session_id: string }
        Returns: boolean
      }
      reserve_inventory: {
        Args: {
          p_expires_at: string
          p_product_id: string
          p_quantity: number
          p_size: string
          p_stripe_session_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      delivery_option: "gta-meetup" | "canada-shipping" | "worldwide-agent"
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "completed"
        | "cancelled"
      product_category:
        | "hoodies"
        | "jackets"
        | "shoes"
        | "bags"
        | "scarves"
        | "fragrance"
        | "electronics"
        | "accessories"
      product_condition: "new" | "like-new" | "good" | "fair"
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
      app_role: ["admin", "user"],
      delivery_option: ["gta-meetup", "canada-shipping", "worldwide-agent"],
      order_status: [
        "pending",
        "processing",
        "shipped",
        "completed",
        "cancelled",
      ],
      product_category: [
        "hoodies",
        "jackets",
        "shoes",
        "bags",
        "scarves",
        "fragrance",
        "electronics",
        "accessories",
      ],
      product_condition: ["new", "like-new", "good", "fair"],
    },
  },
} as const
