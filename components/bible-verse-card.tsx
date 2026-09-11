"use client";

import { useEffect, useState } from "react";
import { BookHeart, RefreshCw } from "lucide-react";

const verses = [
  {
    reference: "Psalm 23:1",
    english: "The Lord is my shepherd; I shall not want.",
    khmer: "ព្រះអម្ចាស់ជាអ្នកគង្វាលរបស់ខ្ញុំ ដូច្នេះខ្ញុំមិនខ្វះអ្វីឡើយ។",
  },
  {
    reference: "Philippians 4:13",
    english: "I can do all things through Christ which strengtheneth me.",
    khmer: "ខ្ញុំអាចធ្វើអ្វីៗបានទាំងអស់ ដោយសារព្រះគ្រីស្ទដែលប្រទានកម្លាំងដល់ខ្ញុំ។",
  },
  {
    reference: "Proverbs 3:5",
    english: "Trust in the Lord with all thine heart; and lean not unto thine own understanding.",
    khmer: "ចូរទុកចិត្តលើព្រះអម្ចាស់អស់ពីចិត្ត ហើយកុំពឹងតែលើការយល់ដឹងរបស់ខ្លួន។",
  },
  {
    reference: "Psalm 46:10",
    english: "Be still, and know that I am God.",
    khmer: "ចូរស្ងប់ចិត្ត ហើយដឹងថា ទ្រង់ជាព្រះ។",
  },
  {
    reference: "Matthew 11:28",
    english: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
    khmer: "អ្នកដែលនឿយហត់ និងមានបន្ទុកធ្ងន់ ចូរមករកព្រះអង្គ ហើយព្រះអង្គនឹងប្រទានការសម្រាក។",
  },
  {
    reference: "Romans 8:28",
    english: "All things work together for good to them that love God.",
    khmer: "គ្រប់ការទាំងអស់រួមគ្នាបង្កើតផលល្អ សម្រាប់អ្នកដែលស្រឡាញ់ព្រះ។",
  },
  {
    reference: "Isaiah 41:10",
    english: "Fear thou not; for I am with thee.",
    khmer: "កុំភ័យខ្លាច ដ្បិតព្រះអង្គគង់នៅជាមួយអ្នក។",
  },
  {
    reference: "Psalm 119:105",
    english: "Thy word is a lamp unto my feet, and a light unto my path.",
    khmer: "ព្រះបន្ទូលរបស់ទ្រង់ជាចង្កៀងបំភ្លឺជំហាន និងជាពន្លឺបំភ្លឺផ្លូវរបស់ខ្ញុំ។",
  },
] as const;

function randomIndex(excluding?: number) {
  if (verses.length < 2) return 0;
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  const candidate = values[0] % verses.length;
  return candidate === excluding ? (candidate + 1) % verses.length : candidate;
}

export function BibleVerseCard() {
  const [verseIndex, setVerseIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => setVerseIndex(randomIndex()), []);

  const verse = verses[verseIndex];
  const chooseAnother = () => {
    setSpinning(true);
    setVerseIndex((current) => randomIndex(current));
    window.setTimeout(() => setSpinning(false), 450);
  };

  return (
    <section className="float-in relative overflow-hidden rounded-[1.75rem] border border-[#eadbf7] bg-gradient-to-br from-white/90 via-[#fff9fc]/90 to-[#f4efff]/90 p-5 shadow-[0_18px_50px_rgba(120,92,150,0.09)] backdrop-blur-sm md:col-span-2 xl:col-span-1 sm:p-6">
      <div aria-hidden="true" className="absolute -right-7 -top-8 text-8xl opacity-[0.08]">✝</div>
      <div className="relative">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#9b75b3]">Verse for today</p>
            <h2 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#624d71]">A little light ✨</h2>
          </div>
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#eee5fb] text-[#8869a2]">
            <BookHeart className="h-5 w-5" />
          </div>
        </div>

        <blockquote key={verse.reference} className="verse-reveal rounded-2xl border border-white/90 bg-white/65 p-4">
          <p className="font-[family-name:var(--font-fraunces)] text-lg font-semibold leading-7 text-[#5f4b69]">“{verse.english}”</p>
          <div className="my-3 h-px bg-gradient-to-r from-transparent via-[#ead8ee] to-transparent" />
          <p lang="km" className="text-base font-medium leading-8 text-[#725d7c]">{verse.khmer}</p>
          <cite className="mt-3 block text-sm font-extrabold not-italic text-[#a1637d]">— {verse.reference}</cite>
        </blockquote>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-[#a48d9e]">KJV · អត្ថន័យជាភាសាខ្មែរ</p>
          <button type="button" onClick={chooseAnother} className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[#decbea] bg-white/80 px-3 text-sm font-extrabold text-[#86679c] transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#eadff3]">
            <RefreshCw className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} />
            Another verse
          </button>
        </div>
      </div>
    </section>
  );
}
