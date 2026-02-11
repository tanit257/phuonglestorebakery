import { createClient } from '@supabase/supabase-js';

const getSupabase = () => {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
};

export const serverLogger = {
  async info(source, message, details = null) {
    return this._write('info', source, message, details);
  },
  async warn(source, message, details = null) {
    return this._write('warn', source, message, details);
  },
  async error(source, message, details = null) {
    return this._write('error', source, message, details);
  },
  async success(source, message, details = null) {
    return this._write('success', source, message, details);
  },
  async _write(level, source, message, details) {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('app_logs')
        .insert({
          level,
          source,
          message,
          details: details ? JSON.stringify(details) : null,
        });

      if (error) {
        console.error('[ServerLogger] DB write failed:', error.message);
      }
    } catch (err) {
      console.error('[ServerLogger] Failed:', err.message);
    }
  },
};

export default serverLogger;
