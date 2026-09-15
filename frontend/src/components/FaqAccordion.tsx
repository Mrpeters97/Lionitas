"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import PillLink from "@/components/PillLink";

interface FaqItem {
  question: string;
  answer: string | null;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-5">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className="rounded-panel bg-surface px-6 py-5 sm:px-9">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center gap-6 text-left text-faq text-foreground"
              aria-expanded={isOpen}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue text-blue text-xl leading-none">
                {isOpen ? "−" : "+"}
              </span>
              {item.question}
            </button>
            <AnimatePresence initial={false}>
              {isOpen && item.answer && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-1.5 pl-14">
                    <p className="text-body text-foreground">{item.answer}</p>
                    {index === 0 && (
                      <PillLink href="/lid-worden" variant="blue" className="mt-6">
                        Lid worden
                      </PillLink>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
