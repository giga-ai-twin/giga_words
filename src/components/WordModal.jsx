import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, Loader2, Check, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { translateWord } from '../services/ai';

function WordModal({ onClose, onSave, initialData }) {
    const [word, setWord] = useState(initialData?.word || '');
    const [translation, setTranslation] = useState(initialData?.translation || '');
    const [example, setExample] = useState(initialData?.example || '');
    const [phonetics, setPhonetics] = useState(initialData?.phonetics || { dj: '', kk: '' });
    const [images, setImages] = useState(initialData?.images || []);
    const [aiAnalysis, setAiAnalysis] = useState(initialData?.analysis || null);
    const [loading, setLoading] = useState(false);

    const handleTranslate = async () => {
        if (!word) return;
        setLoading(true);
        try {
            const result = await translateWord(word);
            setAiAnalysis(result.pos);
            setPhonetics(result.phonetics);
            if (result.pos.length > 0) {
                setTranslation(result.pos[0].translation);
                setExample(result.pos[0].example);
            }
        } catch (e) {
            alert("Translation failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages([...images, reader.result]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!word) return;
        onSave({
            ...initialData,
            word,
            translation,
            example,
            phonetics,
            images,
            analysis: aiAnalysis
        });
        onClose();
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '16px' }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass"
                style={{ width: '100%', maxWidth: '600px', padding: '32px', background: '#1e293b', maxHeight: '90vh', overflowY: 'auto' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>{initialData ? 'Edit Word Details' : 'Add New Word'}</h2>
                    <button onClick={onClose} className="btn glass" style={{ padding: '8px' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>English Word</label>
                            <input
                                autoFocus
                                className="input"
                                style={{ width: '100%' }}
                                value={word}
                                onChange={(e) => setWord(e.target.value)}
                                placeholder="e.g. Resilience"
                            />
                        </div>
                        <button
                            type="button"
                            className="btn glass"
                            style={{ height: '46px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                            onClick={handleTranslate}
                            disabled={loading || !word}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                            AI Analyze
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>DJ Phonetic</label>
                            <input
                                className="input"
                                style={{ width: '100%' }}
                                value={phonetics.dj}
                                onChange={(e) => setPhonetics({ ...phonetics, dj: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>KK Phonetic</label>
                            <input
                                className="input"
                                style={{ width: '100%' }}
                                value={phonetics.kk}
                                onChange={(e) => setPhonetics({ ...phonetics, kk: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Primary Translation</label>
                        <input
                            className="input"
                            style={{ width: '100%' }}
                            value={translation}
                            onChange={(e) => setTranslation(e.target.value)}
                        />
                    </div>

                    {aiAnalysis && (
                        <div className="glass" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Analysis & Parts of Speech</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {aiAnalysis.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="glass"
                                        style={{
                                            padding: '10px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            cursor: 'pointer',
                                            border: translation === item.translation ? '1px solid var(--primary)' : '1px solid transparent',
                                            background: translation === item.translation ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                                        }}
                                        onClick={() => {
                                            setTranslation(item.translation);
                                            setExample(item.example);
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{item.type}</span>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setAiAnalysis(aiAnalysis.filter((_, i) => i !== idx)); }}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', padding: 0 }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div style={{ fontSize: '0.9rem' }}>{item.translation}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{item.example}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Associated OCR Images</label>
                            <label className="btn glass" style={{ padding: '4px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                <Plus size={16} /> Add Image
                                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px' }}>
                            {images.map((img, idx) => (
                                <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                                    <img src={img} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(idx)}
                                        style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            {images.length === 0 && (
                                <div style={{ width: '80px', height: '80px', borderRadius: '8px', border: '2px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                    <ImageIcon size={24} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Main Example Sentence</label>
                        <textarea
                            className="input"
                            style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                            value={example}
                            onChange={(e) => setExample(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '12px', height: '50px', fontSize: '1.1rem' }}>
                        <Save size={20} /> {initialData ? 'Update Word' : 'Save Word'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

export default WordModal;
