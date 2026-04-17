-- Phase 07.5: Glitch Tech reviews vertical — foundation schema
-- Applied to dev DB via direct postgres-js push (drizzle-kit generate had
-- an unrelated interactive-prompt block on orders.total_cents schema drift).
-- This file mirrors the tables created so schema history is documented.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tech_spec_field_type') THEN
    CREATE TYPE tech_spec_field_type AS ENUM ('text', 'number', 'enum', 'boolean');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tech_review_status') THEN
    CREATE TYPE tech_review_status AS ENUM ('draft', 'published');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tech_benchmark_direction') THEN
    CREATE TYPE tech_benchmark_direction AS ENUM ('higher_is_better', 'lower_is_better');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS tech_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id uuid REFERENCES tech_categories(id) ON DELETE RESTRICT,
  level integer NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS tech_spec_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL UNIQUE REFERENCES tech_categories(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS tech_spec_fields (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid NOT NULL REFERENCES tech_spec_templates(id) ON DELETE CASCADE,
  name text NOT NULL,
  type tech_spec_field_type NOT NULL,
  unit text,
  enum_options jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS tech_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES tech_categories(id) ON DELETE RESTRICT,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  manufacturer text,
  hero_image_id uuid REFERENCES media_assets(id),
  summary text,
  price_usd numeric(10, 2),
  affiliate_url text,
  release_date text,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS tech_product_specs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES tech_products(id) ON DELETE CASCADE,
  field_id uuid NOT NULL REFERENCES tech_spec_fields(id) ON DELETE CASCADE,
  value_text text,
  value_number numeric(14, 4),
  value_boolean boolean,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS tech_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES tech_products(id) ON DELETE CASCADE,
  reviewer_id text NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  verdict text NOT NULL,
  body_html text NOT NULL,
  rating_performance integer NOT NULL,
  rating_build integer NOT NULL,
  rating_value integer NOT NULL,
  rating_design integer NOT NULL,
  overall_override numeric(3, 1),
  hero_image_id uuid NOT NULL REFERENCES media_assets(id),
  video_url text,
  audience_for text,
  audience_not_for text,
  status tech_review_status NOT NULL DEFAULT 'draft',
  published_at timestamp,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS tech_review_pros (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid NOT NULL REFERENCES tech_reviews(id) ON DELETE CASCADE,
  text text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tech_review_cons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid NOT NULL REFERENCES tech_reviews(id) ON DELETE CASCADE,
  text text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tech_review_gallery (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid NOT NULL REFERENCES tech_reviews(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tech_benchmark_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL UNIQUE REFERENCES tech_categories(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS tech_benchmark_tests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid NOT NULL REFERENCES tech_benchmark_templates(id) ON DELETE CASCADE,
  name text NOT NULL,
  unit text NOT NULL,
  direction tech_benchmark_direction NOT NULL DEFAULT 'higher_is_better',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS tech_benchmark_runs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES tech_products(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES tech_benchmark_tests(id) ON DELETE CASCADE,
  score numeric(14, 4) NOT NULL,
  notes text,
  recorded_at timestamp DEFAULT now() NOT NULL,
  created_by text REFERENCES "user"(id)
);
