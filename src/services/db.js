import Dexie from 'dexie';

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
  // Simple logic: Each test counts for double, threshold based
  const score = (views + tests * 2);
  if (score >= 20) return 5;
  if (score >= 12) return 4;
  if (score >= 6) return 3;
  if (score >= 3) return 2;
  return 1;
};

export const addWord = async (wordData) => {
  return await db.words.add({
    ...wordData,
    status: wordData.status || 'learning',
    timestamp: Date.now(),
    viewCount: 0,
    testCount: 0,
    familiarity: 1,
    analysis: wordData.analysis || null,
    phonetics: wordData.phonetics || { dj: '', kk: '' },
    images: wordData.images || []
  });
};

export const updateWord = async (id, updates) => {
  return await db.words.update(id, updates);
};

export const incrementView = async (id) => {
  const word = await db.words.get(id);
  if (!word) return;
  const newViews = (word.viewCount || 0) + 1;
  const newFamiliarity = calculateFamiliarity(newViews, word.testCount || 0);
  return await db.words.update(id, {
    viewCount: newViews,
    familiarity: newFamiliarity
  });
};

export const incrementTest = async (id) => {
  const word = await db.words.get(id);
  if (!word) return;
  const newTests = (word.testCount || 0) + 1;
  const newFamiliarity = calculateFamiliarity(word.viewCount || 0, newTests);
  return await db.words.update(id, {
    testCount: newTests,
    familiarity: newFamiliarity
  });
};

export const getAllWords = async () => {
  return await db.words.orderBy('timestamp').reverse().toArray();
};

export const deleteWord = async (id) => {
  return await db.words.delete(id);
};
