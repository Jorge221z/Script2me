import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud } from 'react-icons/fi';

const GlobalDragOver = ({ onFilesDropped }) => {
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        // Counter to track drag events
        let dragCounter = 0;

        const handleDragEnter = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter++;
            setIsDragging(true);
        };

        const handleDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Needed to allow drop
        };

        const handleDragLeave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter--;

            // Only set isDragging to false when all drag elements have left
            if (dragCounter === 0) {
                setIsDragging(false);
            }
        };

        const handleDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            dragCounter = 0;

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                onFilesDropped(Array.from(e.dataTransfer.files));
            }
        };

        // Add global event listeners
        document.addEventListener('dragenter', handleDragEnter);
        document.addEventListener('dragover', handleDragOver);
        document.addEventListener('dragleave', handleDragLeave);
        document.addEventListener('drop', handleDrop);

        // Cleanup
        return () => {
            document.removeEventListener('dragenter', handleDragEnter);
            document.removeEventListener('dragover', handleDragOver);
            document.removeEventListener('dragleave', handleDragLeave);
            document.removeEventListener('drop', handleDrop);
        };
    }, [onFilesDropped]);

    return (
        <AnimatePresence>
            {isDragging && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{
                            scale: 1,
                            transition: {
                                type: "spring",
                                stiffness: 300,
                                damping: 25
                            }
                        }}
                        className="flex flex-col items-center rounded-xl bg-emerald-500/20 p-16 shadow-lg"
                    >
                        <motion.div
                            animate={{
                                y: [0, -15, 0],
                                transition: {
                                    duration: 1.8,
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    ease: "easeInOut"
                                }
                            }}
                        >
                            <FiUploadCloud className="h-24 w-24 text-white" />
                        </motion.div>
                        <motion.p
                            className="mt-4 text-2xl font-bold text-white"
                            animate={{
                                opacity: [0.7, 1, 0.7],
                                scale: [1, 1.05, 1],
                                transition: {
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "loop"
                                }
                            }}
                        >
                            Drop files anywhere to upload
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GlobalDragOver;