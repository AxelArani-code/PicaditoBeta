"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ShowcaseHeroCard {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

interface ShowcaseInfoCard {
  title: string;
  description: string;
  icon: ReactNode;
  className: string;
  textClassName: string;
}

interface ShowcaseWideCard {
  title: string;
  description: string;
  tags: string[];
  imageSrc: string;
  imageAlt: string;
  className: string;
  textClassName: string;
  imageLayout?: "background" | "side";
}

export interface BenefitsShowcaseSectionProps {
  badge: string;
  heading: string;
  supportingText: string;
  reverse?: boolean;
  heroCard: ShowcaseHeroCard;
  infoCardOne: ShowcaseInfoCard;
  infoCardTwo: ShowcaseInfoCard;
  wideCard: ShowcaseWideCard;
}

export function BenefitsShowcaseSection({
  badge,
  heading,
  supportingText,
  reverse = false,
  heroCard,
  infoCardOne,
  infoCardTwo,
  wideCard,
}: BenefitsShowcaseSectionProps) {
  const wideImageLayout = wideCard.imageLayout ?? "background";

  return (
    <section className="py-24  max-w-7xl mx-auto border-b border-black/5">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div className="max-w-xl">
          <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs mb-4 block">{badge}</span>
          <h2 className="text-4xl md:text-6xl font-black text-[#ffffff] tracking-tight leading-none">{heading}</h2>
        </div>
        <p className="text-slate-300 text-lg max-w-sm">{supportingText}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={
            'md:col-span-4 relative h-[450px] rounded-[3rem] overflow-hidden group shadow-2xl shadow-black/5 ' +
            (reverse ? 'md:order-2' : 'md:order-1')
          }
        >
          <img
            src={heroCard.imageSrc}
            alt={heroCard.imageAlt}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-12 left-12 right-12">
            <h3 className="text-4xl font-bold text-white mb-4">{heroCard.title}</h3>
            <p className="text-white/80 text-lg max-w-md leading-relaxed">{heroCard.description}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={infoCardOne.className + ' ' + (reverse ? 'md:order-1' : 'md:order-2')}
        >
          <div className="space-y-6">
            <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center">{infoCardOne.icon}</div>
            <h3 className={infoCardOne.textClassName + " text-3xl font-bold"}>{infoCardOne.title}</h3>
            <p className={infoCardOne.textClassName + " text-lg leading-relaxed"}>{infoCardOne.description}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className={infoCardTwo.className + ' ' + (reverse ? 'md:order-4' : 'md:order-3')}
        >
          <div className="space-y-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">{infoCardTwo.icon}</div>
            <h3 className={infoCardTwo.textClassName + " text-3xl font-bold"}>{infoCardTwo.title}</h3>
            <p className={infoCardTwo.textClassName + " text-lg leading-relaxed"}>{infoCardTwo.description}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className={wideCard.className + ' ' + (reverse ? 'md:order-3' : 'md:order-4')}
        >
          {wideImageLayout === "background" ? (
            <>
              <img
                src={wideCard.imageSrc}
                alt={wideCard.imageAlt}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </>
          ) : null}

          <div className="relative z-10 w-full md:w-3/5">
            <h3 className={wideCard.textClassName + " text-4xl font-bold mb-6"}>{wideCard.title}</h3>
            <p className={wideCard.textClassName + " text-lg leading-relaxed mb-8"}>{wideCard.description}</p>
            <div className="flex gap-4 flex-wrap">
              {wideCard.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 text-white bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {wideImageLayout === "side" ? (
            <div
              className={
                'absolute bottom-0 w-full h-[120%] md:w-3/4 md:h-[130%] pointer-events-none ' +
                (reverse ? 'left-[-10%]' : 'right-[-10%]')
              }
            >
              <img
                src={wideCard.imageSrc}
                alt={wideCard.imageAlt}
                className="w-full h-full object-contain object-bottom transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
