import React, { useState, useEffect } from 'react';
import { Plus, Search, Book, Image as ImageIcon, Volume2, Trash2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllWords, addWord, deleteWord, incrementView, updateWord, migrateLocalToRemote } from './services/db';
import { isRemoteActive } from './services/supabase';
import { speak } from './services/speech';
import WordModal from './components/WordModal';
import OCRModal from './components/OCRModal';
import StudyModal from './components/StudyModal';
import './index.css';

const FamiliarityStars = ({ level }) => {
  return (
    <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <div
          key={star}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: star <= level ? 'var(--secondary)' : '#e8eaed'
          }}
        />
      ))}
    </div>
  );
};

function App() {
  const [words, setWords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showOCR, setShowOCR] = useState(false);
  const [showStudy, setShowStudy] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingWord, setEditingWord] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [remoteActive, setRemoteActive] = useState(isRemoteActive());

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    const allWords = await getAllWords();
    setWords(allWords);
  };

  const handleSave = async (wordData) => {
    if (wordData.id) {
      await updateWord(wordData.id, wordData);
    } else {
      await addWord(wordData);
    }
    loadWords();
    setEditingWord(null);
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this word?')) {
      await deleteWord(id);
      loadWords();
    }
  };

  const handleSyncMigration = async () => {
    if (!remoteActive) return;
    if (confirm('Migrate your local words to Supabase Cloud? This will enable cross-device sync.')) {
      setSyncing(true);
      try {
        const result = await migrateLocalToRemote();
        alert(`Successfully migrated ${result.count} words to the cloud!`);
        loadWords();
      } catch (e) {
        console.error(e);
        alert("Migration failed: " + e.message);
      } finally {
        setSyncing(false);
      }
    }
  };

  const handleSpeak = async (id, text, lang) => {
    speak(text, lang);
    await incrementView(id);
    loadWords();
  };

  const filteredWords = words.filter(w =>
    w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.translation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <div className="header">
        <h1 className="title">GigaWords</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {remoteActive && (
            <div
              title="Cloud Sync Active"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                fontSize: '0.8rem',
                fontWeight: '600',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              Cloud Active
            </div>
          )}
          <button className="btn glass" onClick={() => setShowStudy(true)} disabled={words.length === 0}>
            <Book size={20} /> Study
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} /> Add Word
          </button>
          <button className="btn glass" onClick={() => setShowOCR(true)}>
            <ImageIcon size={20} /> OCR
          </button>
        </div>
      </div>

      {remoteActive && words.length > 0 && !words[0].id.toString().includes('-') && (
        <div className="glass" style={{ padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'var(--primary)' }}>
          <div style={{ fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Local words detected.</span> Would you like to sync them to your Supabase cloud?
          </div>
          <button
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            onClick={handleSyncMigration}
            disabled={syncing}
          >
            {syncing ? <Sparkles className="animate-spin" size={16} /> : <Sparkles size={16} />}
            Sync to Cloud
          </button>
        </div>
      )}

      <div className="glass" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input"
            placeholder="Search words..."
            style={{ width: '100%', paddingLeft: '48px', height: '48px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        <AnimatePresence>
          {filteredWords.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass"
              style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{item.word}</h3>
                  <FamiliarityStars level={item.familiarity} />
                </div>

                {item.phonetics && (item.phonetics.dj || item.phonetics.kk) && (
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {item.phonetics.dj && <span>DJ: [{item.phonetics.dj}]</span>}
                    {item.phonetics.kk && <span>KK: /{item.phonetics.kk}/</span>}
                  </div>
                )}

                <p style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '4px' }}>{item.translation}</p>

                {item.example && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <button
                      className="btn glass"
                      style={{ padding: '6px', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '50%' }}
                      onClick={() => handleSpeak(item.id, item.example, 'en-US')}
                      title="Speak Example"
                    >
                      <Volume2 size={12} />
                    </button>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', flex: 1 }}>"{item.example}"</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <span>Views: {item.viewCount || 0}</span>
                  <span>Tests: {item.testCount || 0}</span>
                  {item.analysis && (
                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, fontSize: '0.75rem', textDecoration: 'underline' }}
                    >
                      {expandedId === item.id ? 'Hide Details' : 'Show Details'}
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {expandedId === item.id && item.analysis && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden', marginBottom: '12px' }}
                    >
                      <div className="glass" style={{ padding: '12px', background: '#f8f9fa', fontSize: '0.85rem', boxShadow: 'none' }}>
                        {item.analysis.map((pos, idx) => (
                          <div key={idx} style={{ marginBottom: '8px' }}>
                            <span style={{ fontWeight: '700', color: 'var(--secondary)' }}>{pos.type}</span>: {pos.translation}
                            <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>"{pos.example}"</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn glass" style={{ padding: '10px' }} onClick={() => handleSpeak(item.id, item.word, 'en-US')}>
                  <Volume2 size={18} /> US
                </button>
                <button className="btn glass" style={{ padding: '10px' }} onClick={() => handleSpeak(item.id, item.word, 'en-GB')}>
                  <Volume2 size={18} /> UK
                </button>
                <button
                  className="btn glass"
                  style={{ padding: '8px' }}
                  onClick={() => setEditingWord(item)}
                >
                  <Sparkles size={18} /> Edit
                </button>
                <button
                  className="btn glass"
                  style={{ padding: '10px', color: 'var(--accent)' }}
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredWords.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
            No words found. Start by adding some!
          </div>
        )}
      </div>

      {(showModal || editingWord) && (
        <WordModal
          onClose={() => { setShowModal(false); setEditingWord(null); }}
          onSave={handleSave}
          initialData={editingWord}
        />
      )}

      {showOCR && (
        <OCRModal
          onClose={() => setShowOCR(false)}
          onSave={handleSave}
        />
      )}

      {showStudy && words.length > 0 && (
        <StudyModal
          words={words}
          onClose={() => setShowStudy(false)}
          onRefresh={loadWords}
          onEdit={(word) => {
            setShowStudy(false);
            setEditingWord(word);
          }}
        />
      )}
    </div>
  );
}

export default App;
