import { supabase, isSupabaseConfigured } from './supabase';

const LEVELS = ['info', 'warn', 'error', 'success'];

const writeLog = async (level, source, message, details = null) => {
  if (!isSupabaseConfigured()) return null;
  if (!LEVELS.includes(level)) return null;

  try {
    const { data, error } = await supabase
      .from('app_logs')
      .insert({
        level,
        source,
        message,
        details: details ? JSON.stringify(details) : null,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[AppLogger] Failed to write log:', err.message);
    return null;
  }
};

export const appLogger = {
  info: (source, message, details) => writeLog('info', source, message, details),
  warn: (source, message, details) => writeLog('warn', source, message, details),
  error: (source, message, details) => writeLog('error', source, message, details),
  success: (source, message, details) => writeLog('success', source, message, details),
};

export const fetchLogs = async ({ level, source, search, limit = 50, offset = 0 } = {}) => {
  if (!isSupabaseConfigured()) return { logs: [], total: 0 };

  try {
    let query = supabase
      .from('app_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (level && level !== 'all') {
      query = query.eq('level', level);
    }
    if (source && source !== 'all') {
      query = query.eq('source', source);
    }
    if (search) {
      query = query.ilike('message', `%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return { logs: data || [], total: count || 0 };
  } catch (err) {
    console.error('[AppLogger] Failed to fetch logs:', err.message);
    return { logs: [], total: 0 };
  }
};

export const fetchLogSources = async () => {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('app_logs')
      .select('source')
      .order('source');

    if (error) throw error;

    const unique = [...new Set((data || []).map((r) => r.source))];
    return unique;
  } catch {
    return [];
  }
};

export default appLogger;
