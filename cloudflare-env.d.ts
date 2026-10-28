declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    OPENAI_API_KEY?: string;
    OPENAI_MODEL?: string;
    OPENAI_IMAGE_MODEL?: string;
    OPENAI_TRANSCRIBE_MODEL?: string;
    DATABASE_PROVIDER?: string;
    SUPABASE_URL?: string;
    SUPABASE_PUBLISHABLE_KEY?: string;
    SUPABASE_SECRET_KEY?: string;
    SUPABASE_JWKS_URL?: string;
  }
}
