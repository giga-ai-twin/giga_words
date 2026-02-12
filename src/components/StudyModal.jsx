import React, { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Volume2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { speak } from '../services/speech';
import { incrementTest } from '../services/db';

function StudyModal({ words: allWords, onClose, onRefresh }) {
    // Randomly select 10 words (or all if less than 10)
    const studyWords = useMemo(() => {
        const shuffled = [...allWords].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 10);
    }, [allWords]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [testedIds, setTestedIds] = useState(new Set());

    const currentWord = studyWords[currentIndex];

    const handleFlip = async () => {
        if (!isFlipped && !testedIds.has(currentWord.id)) {
            await incrementTest(currentWord.id);
            setTestedIds(prev => new Set(prev).add(currentWord.id));
            if (onRefresh) onRefresh();
        }
        setIsFlipped(!isFlipped);
    };

    const handleNext = () => {
        if (currentIndex < studyWords.length - 1) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev - 1);
        }
    };

    // Swipe detection
    const onDragEnd = (event, info) => {
        if (info.offset.x < -100) {
            handleNext();
        } else if (info.offset.x > 100) {
            handlePrev();
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--background)', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Flashcard Study ({currentIndex + 1} / {studyWords.length})</h2>
                <button className="btn glass" onClick={onClose} style={{ padding: '8px' }}>
                    <X size={24} />
                </button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: window.innerWidth < 768 ? '16px' : '24px', gap: '24px' }}>
                <div style={{ width: '100%', maxWidth: '400px', height: window.innerWidth < 768 ? '400px' : '500px', perspective: '1000px' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1, rotateY: isFlipped ? 180 : 0 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{
                                x: { type: 'spring', stiffness: 300, damping: 30 },
                                rotateY: { duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={onDragEnd}
                            style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', cursor: 'pointer' }}
                            onClick={handleFlip}
                        >
                            {/* Front */}
                            <div className="glass" style={{
                                position: 'absolute', inset: 0,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                backfaceVisibility: 'hidden', padding: window.innerWidth < 768 ? '20px' : '32px', textAlign: 'center'
                            }}>
                                <h1 style={{ fontSize: window.innerWidth < 768 ? '2.25rem' : '3rem', marginBottom: '8px' }}>{currentWord.word}</h1>
                                {currentWord.phonetics && (
                                    <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                                        <span>DJ: {currentWord.phonetics.dj}</span>
                                        <span>KK: {currentWord.phonetics.kk}</span>
                                    </div>
                                )}
                                <button
                                    className="btn glass"
                                    onClick={(e) => { e.stopPropagation(); speak(currentWord.word, 'en-US'); }}
                                >
                                    <Volume2 size={24} /> Pronounce
                                </button>
                                <div style={{ position: 'absolute', bottom: '24px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    Tap to flip / Swipe left or right
                                </div>
                            </div>

                            {/* Back */}
                            <div className="glass" style={{
                                position: 'absolute', inset: 0,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', padding: window.innerWidth < 768 ? '20px' : '32px', textAlign: 'center',
                                background: 'rgba(26, 115, 232, 0.05)'
                            }}>
                                <h2 style={{ fontSize: window.innerWidth < 768 ? '2rem' : '2.5rem', color: 'var(--primary)', marginBottom: '8px' }}>{currentWord.translation}</h2>
                                <p style={{ color: 'var(--secondary)', fontWeight: '600', marginBottom: '16px' }}>
                                    {currentWord.analysis?.find(p => p.type.includes('常用'))?.type || '常用'}
                                </p>
                                {currentWord.example && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                                        <button
                                            className="btn glass"
                                            style={{ padding: '6px', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '50%' }}
                                            onClick={(e) => { e.stopPropagation(); speak(currentWord.example, 'en-US'); }}
                                        >
                                            <Volume2 size={16} />
                                        </button>
                                        <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '300px' }}>
                                            "{currentWord.example}"
                                        </p>
                                    </div>
                                )}
                                <div style={{ position: 'absolute', bottom: '24px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                                    <button
                                        className="btn glass"
                                        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                                        onClick={(e) => { e.stopPropagation(); onEdit && onEdit(currentWord); }}
                                    >
                                        Edit Details & Images
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Pagination Dots */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    {studyWords.map((_, idx) => (
                        <div
                            key={idx}
                            style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: idx === currentIndex ? 'var(--primary)' : 'rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    ))}
                </div>
            </div>

            <div style={{ padding: window.innerWidth < 768 ? '24px' : '48px', display: 'flex', justifyContent: 'center', gap: '24px' }}>
                <button className="btn glass" style={{ padding: window.innerWidth < 768 ? '12px' : '16px' }} onClick={handlePrev} disabled={currentIndex === 0}>
                    <ChevronLeft size={window.innerWidth < 768 ? 24 : 32} />
                </button>
                <button className="btn glass" style={{ padding: window.innerWidth < 768 ? '12px' : '16px' }} onClick={handleFlip}>
                    <RotateCcw size={window.innerWidth < 768 ? 24 : 32} />
                </button>
                <button className="btn glass" style={{ padding: window.innerWidth < 768 ? '12px' : '16px' }} onClick={handleNext} disabled={currentIndex === studyWords.length - 1}>
                    <ChevronRight size={window.innerWidth < 768 ? 24 : 32} />
                </button>
            </div>
        </div>
    );
}

export default StudyModal;
