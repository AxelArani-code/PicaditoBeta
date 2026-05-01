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
    <section className="mx-auto w-full max-w-7xl border-b border-black/5 px-4 py-14 sm:px-6 sm:py-16 md:py-24">
      <div className="mb-10 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs mb-4 block">{badge}</span>
          <h2 className="text-3xl font-black leading-[0.95] tracking-tight text-[#ffffff] sm:text-5xl md:text-6xl">{heading}</h2>
        </div>
        <p className="max-w-md text-base leading-relaxed text-slate-300 sm:text-lg">{supportingText}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={
            'group relative min-h-[320px] overflow-hidden rounded-[2rem] shadow-2xl shadow-black/5 sm:min-h-[420px] md:col-span-4 md:min-h-[450px] md:rounded-[3rem] ' +
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
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 md:bottom-12 md:left-12 md:right-12">
            <h3 className="mb-3 text-2xl font-bold leading-tight text-white sm:mb-4 sm:text-3xl md:text-4xl">{heroCard.title}</h3>
            <p className="max-w-md text-sm leading-relaxed text-white/85 sm:text-base md:text-lg">{heroCard.description}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={
            infoCardOne.className +
            ' !relative !overflow-hidden !rounded-[2rem] !p-6 !h-auto !min-h-[260px] sm:!rounded-[2.5rem] sm:!p-8 sm:!min-h-[320px] md:!rounded-[3rem] md:!p-10 md:!min-h-[450px] !flex !flex-col !justify-end ' +
            (reverse ? 'md:order-1' : 'md:order-2')
          }
        >
          <div className="space-y-4 sm:space-y-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/5 sm:h-16 sm:w-16">{infoCardOne.icon}</div>
            <h3 className={infoCardOne.textClassName + " text-2xl font-bold leading-tight sm:text-3xl"}>{infoCardOne.title}</h3>
            <p className={infoCardOne.textClassName + " text-base leading-relaxed sm:text-lg"}>{infoCardOne.description}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className={
            infoCardTwo.className +
            ' !relative !overflow-hidden !rounded-[2rem] !p-6 !h-auto !min-h-[260px] sm:!rounded-[2.5rem] sm:!p-8 sm:!min-h-[320px] md:!rounded-[3rem] md:!p-10 md:!min-h-[450px] !flex !flex-col !justify-end ' +
            (reverse ? 'md:order-4' : 'md:order-3')
          }
        >
          <div className="space-y-4 sm:space-y-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 sm:h-16 sm:w-16">{infoCardTwo.icon}</div>
            <h3 className={infoCardTwo.textClassName + " text-2xl font-bold leading-tight sm:text-3xl"}>{infoCardTwo.title}</h3>
            <p className={infoCardTwo.textClassName + " text-base leading-relaxed sm:text-lg"}>{infoCardTwo.description}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className={
            wideCard.className +
            ' !relative !overflow-hidden !rounded-[2rem] !p-6 !h-auto !min-h-[320px] sm:!rounded-[2.5rem] sm:!p-8 sm:!min-h-[380px] md:!rounded-[3rem] md:!p-10 md:!min-h-[450px] !flex !flex-col !justify-end ' +
            (reverse ? 'md:order-3' : 'md:order-4')
          }
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
            <h3 className={wideCard.textClassName + " mb-4 text-2xl font-bold leading-tight sm:mb-6 sm:text-3xl md:text-4xl"}>{wideCard.title}</h3>
            <p className={wideCard.textClassName + " mb-6 text-base leading-relaxed sm:mb-8 sm:text-lg"}>{wideCard.description}</p>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              {wideCard.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white sm:px-4 sm:py-2 sm:text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {wideImageLayout === "side" ? (
            <div
              className={
                'pointer-events-none absolute bottom-0 h-[115%] w-full opacity-55 md:h-[130%] md:w-3/4 md:opacity-100 ' +
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
