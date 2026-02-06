"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";

interface ResultActionPlanProps {
  steps: string[];
  watchOutFor: string;
  themeColor: string;
}

export function ResultActionPlan({
  steps,
  watchOutFor,
  themeColor,
}: ResultActionPlanProps) {
  return (
    <div className="space-y-8">
      {/* Timeline */}
      <div className="relative pl-12">
        {/* Vertical line */}
        <div
          className="absolute left-[15px] top-1 bottom-1 w-0.5 rounded-full"
          style={{ backgroundColor: `${themeColor}18` }}
        />

        <div className="space-y-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="relative"
            >
              {/* Numbered circle */}
              <div
                className="absolute -left-12 top-0.5 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: themeColor }}
              >
                {i + 1}
              </div>
              <p className="text-foreground/90 leading-relaxed">{step}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Watch-out-for callout */}
      {watchOutFor && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-start gap-3.5 rounded-2xl bg-blue-50/50 border border-blue-100/50 px-5 py-4"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 shrink-0">
            <Info className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <p className="font-semibold text-sm text-blue-900/90 mb-1">
              Good to Know
            </p>
            <p className="text-sm text-blue-800/70 leading-relaxed">
              {watchOutFor}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
