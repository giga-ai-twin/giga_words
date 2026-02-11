import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { analyzeScreenshot } from '../services/ai';

function OCRModal({ onClose, onSave }) {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [targetWord, setTargetWord] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const startAnalysis = async () => {
        if (!image) return;
        setLoading(true);
        try {
            const result = await analyzeScreenshot(image, targetWord);
            setAnalysis(result);
        } catch (error) {
            alert("Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass"
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    padding: window.innerWidth < 768 ? '20px' : '32px',
                    background: 'var(--surface)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>Analyze Screenshot</h2>
                    <button onClick={onClose} className="btn glass" style={{ padding: '8px' }}>
                        <X size={20} />
                    </button>
                </div>

                {!image ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Target Word (Optional)</label>
                            <input
                                className="input"
                                style={{ width: '100%' }}
                                placeholder="Type a word to find in the image..."
                                value={targetWord}
                                onChange={(e) => setTargetWord(e.target.value)}
                            />
                        </div>

                        <div
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                border: '2px dashed var(--glass-border)',
                                borderRadius: '16px',
                                padding: '48px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                background: '#f8f9fa'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f3f4'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}
                        >
                            <Upload size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
                            <p style={{ color: 'var(--text-muted)' }}>Click to upload or drag screenshot</p>
                            <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                        </div>
                    </div>
                ) : !analysis ? (
                    <div style={{ textAlign: 'center' }}>
                        <img src={image} alt="Preview" style={{ width: '100%', borderRadius: '12px', marginBottom: '24px', maxHeight: '300px', objectFit: 'contain' }} />
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn glass" style={{ flex: 1 }} onClick={() => setImage(null)} disabled={loading}>
                                Remove
                            </button>
                            <button className="btn btn-primary" style={{ flex: 2 }} onClick={startAnalysis} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : <Camera size={20} />}
                                {loading ? 'Analyzing...' : 'Start Analysis'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="glass" style={{ padding: '20px', marginBottom: '24px', background: 'rgba(26, 115, 232, 0.05)', boxShadow: 'none' }}>
                            <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '4px' }}>{analysis.word}</h3>
                            <p style={{ fontWeight: '600', marginBottom: '12px' }}>{analysis.translation}</p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{analysis.example}"</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn glass" style={{ flex: 1 }} onClick={() => setAnalysis(null)}>
                                Back
                            </button>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 2 }}
                                onClick={() => {
                                    onSave({ ...analysis, analysis: analysis.pos });
                                    onClose();
                                }}
                            >
                                Add to My List
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default OCRModal;
