import Dexie from 'dexie';
import { supabase, isRemoteActive } from './supabase';

export const db = new Dexie('GigaWordsDB');
db.version(4).stores({
  words: '++id, word, translation, status, timestamp, viewCount, testCount, familiarity, analysis, phonetics, images'
}).upgrade(tx => {
  return tx.words.toCollection().modify(word => {
    word.analysis = word.analysis || null;
    word.phonetics = word.phonetics || { dj: '', kk: '' };
    word.images = word.images || [];
  });
});

const calculateFamiliarity = (views, tests) => {
  const score = (views + tests * 2);
  if (score >= 20) return 5;
  if (score >= 12) return 4;
  if (score >= 6) return 3;
  if (score >= 3) return 2;
  return 1;
};

// --- Supabase Mapping Helpers ---
const toSupabase = (word) => ({
  word: word.word,
  translation: word.translation,
  example: word.example,
  status: word.status,
  timestamp: word.timestamp,
  view_count: word.viewCount,
  test_count: word.testCount,
  familiarity: word.familiarity,
  analysis: word.analysis,
  phonetics: word.phonetics,
  images: word.images
});

const fromSupabase = (row) => ({
  id: row.id,
  word: row.word,
  translation: row.translation,
  example: row.example,
  status: row.status,
  timestamp: row.timestamp,
  viewCount: row.view_count,
  testCount: row.test_count,
  familiarity: row.familiarity,
  analysis: row.analysis,
  phonetics: row.phonetics,
  images: row.images
});

// --- Unified API ---

export const addWord = async (wordData) => {
  const data = {
    ...wordData,
    status: wordData.status || 'learning',
    timestamp: Date.now(),
    viewCount: 0,
    testCount: 0,
    familiarity: 1,
    analysis: wordData.analysis || null,
    phonetics: wordData.phonetics || { dj: '', kk: '' },
    images: wordData.images || []
  };

  if (isRemoteActive()) {
    const { data: remoteData, error } = await supabase
      .from('words')
      .insert([toSupabase(data)])
      .select();
    if (error) throw error;
    // Also save to local for cache/offline
    await db.words.add({ ...data, id: remoteData[0].id });
    return remoteData[0].id;
  }

  return await db.words.add(data);
};

export const updateWord = async (id, updates) => {
  if (isRemoteActive()) {
    const { error } = await supabase
      .from('words')
      .update(toSupabase(updates))
      .eq('id', id);
    if (error) {
      // If it's a UUID error, maybe it's still using numeric IDs from Dexie
      console.warn("Supabase update failed, checking if sync needed:", error);
    }
  }
  return await db.words.update(id, updates);
};

export const incrementView = async (id) => {
  const word = await (isRemoteActive() ? getWordById(id) : db.words.get(id));
  if (!word) return;
  const newViews = (word.viewCount || 0) + 1;
  const newFamiliarity = calculateFamiliarity(newViews, word.testCount || 0);

  if (isRemoteActive()) {
    await supabase.from('words').update({ view_count: newViews, familiarity: newFamiliarity }).eq('id', id);
  }
  return await db.words.update(id, { viewCount: newViews, familiarity: newFamiliarity });
};

export const incrementTest = async (id) => {
  const word = await (isRemoteActive() ? getWordById(id) : db.words.get(id));
  if (!word) return;
  const newTests = (word.testCount || 0) + 1;
  const newFamiliarity = calculateFamiliarity(word.viewCount || 0, newTests);

  if (isRemoteActive()) {
    await supabase.from('words').update({ test_count: newTests, familiarity: newFamiliarity }).eq('id', id);
  }
  return await db.words.update(id, { testCount: newTests, familiarity: newFamiliarity });
};

export const getWordById = async (id) => {
  if (isRemoteActive()) {
    const { data, error } = await supabase.from('words').select('*').eq('id', id).single();
    if (data) return fromSupabase(data);
  }
  return await db.words.get(id);
}

export const getAllWords = async () => {
  if (isRemoteActive()) {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) {
      console.error("Supabase fetch failed, falling back to local:", error);
    } else {
      // Sync local cache
      const remoteWords = data.map(fromSupabase);
      await db.words.clear();
      await db.words.bulkAdd(remoteWords);
      return remoteWords;
    }
  }
  return await db.words.orderBy('timestamp').reverse().toArray();
};

export const deleteWord = async (id) => {
  if (isRemoteActive()) {
    await supabase.from('words').delete().eq('id', id);
  }
  return await db.words.delete(id);
};

// --- Migration Tool ---
export const migrateLocalToRemote = async () => {
  if (!isRemoteActive()) throw new Error("Remote not active");
  const localWords = await db.words.toArray();
  if (localWords.length === 0) return { count: 0 };

  const toInsert = localWords.map(w => {
    const s = toSupabase(w);
    // Exclude local auto-increment IDs if they are numeric
    if (typeof w.id === 'number') delete s.id;
    return s;
  });

  const { data, error } = await supabase.from('words').insert(toInsert).select();
  if (error) throw error;

  // Clear local and reload with new UUIDs
  await db.words.clear();
  const synced = data.map(fromSupabase);
  await db.words.bulkAdd(synced);

  return { count: synced.length };
};
