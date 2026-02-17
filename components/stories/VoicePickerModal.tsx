"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, Mic, Coins } from "lucide-react";
import { TTS_VOICES } from "@/lib/constants";

interface VoicePickerModalProps {
  pageCount: number;
  creditCostPerPage: number;
  onConfirm: (voice: string) => void;
  onClose: () => void;
}

export default function VoicePickerModal({
  pageCount,
  creditCostPerPage,
  onConfirm,
  onClose,
}: VoicePickerModalProps) {
  const [selectedVoice, setSelectedVoice] = useState("nova");
  const totalCost = pageCount * creditCostPerPage;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="card max-w-md w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="icon-container-lg mx-auto mb-4">
              <Mic className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-display font-bold text-brand-800 mb-2">
              Elegir voz para narrar
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Selecciona la voz que narrara el cuento
            </p>
          </div>

          <div className="space-y-2 mb-6">
            {TTS_VOICES.map((voice) => (
              <button
                key={voice.value}
                onClick={() => setSelectedVoice(voice.value)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                  selectedVoice === voice.value
                    ? "border-brand-500 bg-brand-50"
                    : "border-gray-200 hover:border-brand-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-heading font-bold text-sm text-brand-800">
                      {voice.label}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">{voice.description}</p>
                  </div>
                  <Volume2
                    className={`w-4 h-4 ${
                      selectedVoice === voice.value ? "text-brand-500" : "text-gray-300"
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mb-4 text-sm text-gray-500">
            <Coins className="w-4 h-4 text-amber-500" />
            <span>
              Costo: <strong className="text-brand-700">{totalCost} creditos</strong>{" "}
              ({creditCostPerPage} x {pageCount} paginas)
            </span>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onConfirm(selectedVoice)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              Narrar cuento ({totalCost} cr)
            </button>
            <button onClick={onClose} className="btn-secondary w-full">
              Cancelar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
