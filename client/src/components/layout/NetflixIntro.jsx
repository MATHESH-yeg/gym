import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Activity, Zap } from "lucide-react";

export default function NetflixIntro({ onComplete }) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Step 0: "N" animation (Dumbbell)
        setTimeout(() => setStep(1), 1200);
        // Step 1: Scale out and fade to black
        setTimeout(() => setStep(2), 2500);
        // Step 2: Complete
        setTimeout(() => onComplete(), 3000);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {step < 2 && (
                <motion.div
                    key="intro-container"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "black",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                    }}
                >
                    {step === 0 && (
                        <motion.div
                            initial={{ scale: 3, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "1rem",
                            }}
                        >
                            <div style={{ position: "relative" }}>
                                {/* Netflix-style "N" formed by Dumbbell/Activity */}
                                <motion.div
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1, ease: "easeInOut" }}
                                >
                                    <Dumbbell
                                        size={120}
                                        color="#35e509ff" // Netflix Red
                                        strokeWidth={1.5}
                                        style={{ filter: "drop-shadow(0 0 20px rgba(9, 229, 31, 0.6))" }}
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                    style={{ position: 'absolute', bottom: -10, left: 0, height: '4px', background: '#E50914', borderRadius: '2px', boxShadow: '0 0 10px #E50914' }}
                                />
                            </div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                style={{
                                    color: "#09e510ff",
                                    fontSize: "3rem",
                                    fontWeight: "900",
                                    letterSpacing: "0.2rem",
                                    fontFamily: "'Bebas Neue', sans-serif", // Netflix-ish font if available, fallback sans
                                    textShadow: "0 0 20px rgba(9, 229, 42, 0.5)",
                                }}
                            >
                                OLIVA
                            </motion.h1>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            initial={{ scale: 1.5, opacity: 1 }}
                            animate={{ scale: 40, opacity: 0 }}
                            transition={{ duration: 1, ease: "easeIn" }}
                            style={{
                                position: 'absolute',
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(38, 229, 9, 1) 0%, rgba(0,0,0,0) 70%)',
                            }}
                        />
                    )}

                    {/* Sound Effect Simulation Visuals */}
                    {step === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: [0, 1, 0], scale: 1.2 }}
                            transition={{ delay: 0.1, duration: 0.8 }}
                            style={{
                                position: 'absolute',
                                width: '300px',
                                height: '300px',
                                border: '2px solid rgba(20, 229, 9, 0.3)',
                                borderRadius: '50%',
                            }}
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
