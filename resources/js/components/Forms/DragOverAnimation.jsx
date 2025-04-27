import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud } from 'react-icons/fi';

const DragOverAnimation = ({ isDragging, className = '' }) => {
    return (
        <AnimatePresence>
            {isDragging && (
                <motion.div
                    className={`absolute inset-0 flex items-center justify-center rounded-lg bg-emerald-500/20 backdrop-blur-sm z-10 ${className}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 10 }}
                        animate={{
                            scale: 1,
                            y: 0,
                            transition: {
                                type: "spring",
                                stiffness: 260,
                                damping: 20
                            }
                        }}
                        className="flex flex-col items-center"
                    >
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                                transition: {
                                    duration: 1.5,
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    ease: "easeInOut"
                                }
                            }}
                        >
                            <FiUploadCloud className="h-16 w-16 text-white" />
                        </motion.div>
                        <motion.p
                            className="mt-3 text-lg font-semibold text-white"
                            animate={{
                                opacity: [0.7, 1, 0.7],
                                transition: {
                                    duration: 1.8,
                                    repeat: Infinity,
                                    repeatType: "loop"
                                }
                            }}
                        >
                            Drop files here
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DragOverAnimation;