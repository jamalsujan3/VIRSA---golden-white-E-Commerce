import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  Droplets, 
  Scissors, 
  Truck, 
  HelpCircle,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Info,
  Layers,
  Heart
} from 'lucide-react';
import { loadFAQItems, FAQItem as AdminFAQItem, loadFAQCategories, FAQCategory as AdminFAQCategory } from '../lib/adminData';

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: { question: string; answer: string; catId: string }[];
}

const getIcon = (name?: string) => {
  switch (name) {
    case 'Droplets': return <Droplets className="h-4 w-4" />;
    case 'Scissors': return <Scissors className="h-4 w-4" />;
    case 'Truck': return <Truck className="h-4 w-4" />;
    case 'HelpCircle': return <HelpCircle className="h-4 w-4" />;
    case 'Info': return <Info className="h-4 w-4" />;
    case 'Layers': return <Layers className="h-4 w-4" />;
    case 'Heart': return <Heart className="h-4 w-4" />;
    default: return <HelpCircle className="h-4 w-4" />;
  }
};

export default function CustomerFAQs() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [faqItems, setFaqItems] = useState<AdminFAQItem[]>([]);
  const [faqCategories, setFaqCategories] = useState<AdminFAQCategory[]>([]);

  useEffect(() => {
    // Initial load
    setFaqItems(loadFAQItems());
    setFaqCategories(loadFAQCategories());

    const handleUpdate = () => {
      setFaqItems(loadFAQItems());
      setFaqCategories(loadFAQCategories());
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('virsa_faqs_updated', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('virsa_faqs_updated', handleUpdate);
    };
  }, []);

  const categories: FAQCategory[] = faqCategories.map(cat => ({
    id: cat.id,
    title: cat.title,
    icon: getIcon(cat.iconName),
    items: faqItems
      .filter(item => item.catId === cat.id)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  })).filter(cat => cat.items.length > 0); // Hide empty categories

  const handleToggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  const filteredItems = activeCategory === 'all' 
    ? categories.flatMap(cat => cat.items.map(item => ({ ...item, catId: cat.id })))
    : categories.find(cat => cat.id === activeCategory)?.items.map(item => ({ ...item, catId: activeCategory })) || [];



  return (
    <section id="customer-faqs-section" className="bg-[#FAF8F5] border-t border-[#E8DFC8] py-24 relative overflow-hidden text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center space-y-3 mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-white border border-[#E8DFC8] shadow-2xs rounded-full text-[11px] font-sans font-semibold tracking-widest text-[#8C6819] uppercase">
            <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
            <span>VIRSA ATELIER SERVICES</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-wider text-[#1F1B17] uppercase">
            Customer Sanctuary FAQs
          </h2>
          <p className="text-xs font-sans tracking-widest text-[#6E645A] max-w-lg mx-auto uppercase">
            Every query answered regarding luxury fabric curation, custom fitting, and secure transit.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => { setActiveCategory('all'); setOpenIndex(null); }}
            className={`px-4 py-2 text-xs font-sans font-semibold tracking-widest uppercase transition-all rounded-sm flex items-center space-x-2 border cursor-pointer ${
              activeCategory === 'all' 
                ? 'bg-[#C5A059] text-white border-[#C5A059] shadow-sm' 
                : 'bg-white text-[#5C5248] border-[#E8DFC8] hover:border-[#C5A059] hover:text-[#1F1B17]'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>View All</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setOpenIndex(null); }}
              className={`px-4 py-2 text-xs font-sans font-semibold tracking-widest uppercase transition-all rounded-sm flex items-center space-x-2 border cursor-pointer ${
                activeCategory === cat.id 
                  ? 'bg-[#C5A059] text-white border-[#C5A059] shadow-sm' 
                  : 'bg-white text-[#5C5248] border-[#E8DFC8] hover:border-[#C5A059] hover:text-[#1F1B17]'
              }`}
            >
              {cat.icon}
              <span>{cat.title.split(' ')[0]} {cat.title.split(' ')[1] || ''}</span>
            </button>
          ))}
        </div>

        {/* Accordion List Container */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {filteredItems.map((item, index) => {
            const uniqueKey = `${item.catId}-${index}`;
            const isOpen = openIndex === uniqueKey;

            return (
              <div 
                key={uniqueKey}
                className={`border rounded-lg transition-all duration-300 ${
                  isOpen 
                    ? 'border-[#C5A059] bg-white shadow-[0_4px_20px_rgba(197,160,89,0.1)]' 
                    : 'border-[#E8DFC8] bg-white hover:border-[#C5A059]/60'
                }`}
              >
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => handleToggle(uniqueKey)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                >
                  <span className="font-serif text-sm sm:text-base font-semibold text-[#1F1B17] pr-4 tracking-wide">
                    {item.question}
                  </span>
                  <span className={`p-1.5 bg-[#FAF6ED] border border-[#E8DFC8] rounded-full text-[#8C6819] transition-transform duration-300 ${
                    isOpen ? 'rotate-180 bg-[#FAF6ED] border-[#C5A059]' : ''
                  }`}>
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>

                {/* Accordion Content Panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-1 text-sm font-sans text-[#5C5248] border-t border-[#E8DFC8] leading-relaxed space-y-4">
                        <p>{item.answer}</p>
                        
                        {/* Interactive Context Pill depending on category */}
                        {item.catId === 'fabric' && (
                          <div className="flex items-center space-x-2 text-[11px] text-[#8C6819] font-sans font-semibold uppercase bg-[#FAF6ED] px-3 py-1.5 rounded-sm w-fit border border-[#E8DFC8]">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>100% Guaranteed Premium Heritage Threadwork Care Guidance</span>
                          </div>
                        )}
                        {item.catId === 'tailoring' && (
                          <div className="flex items-center space-x-2 text-[11px] text-[#8C6819] font-sans font-semibold uppercase bg-[#FAF6ED] px-3 py-1.5 rounded-sm w-fit border border-[#E8DFC8]">
                            <Scissors className="h-3.5 w-3.5" />
                            <span>Complimentary showroom custom fittings and virtual sizing support</span>
                          </div>
                        )}
                        {item.catId === 'shipping' && (
                          <div className="flex items-center space-x-2 text-[11px] text-[#8C6819] font-sans font-semibold uppercase bg-[#FAF6ED] px-3 py-1.5 rounded-sm w-fit border border-[#E8DFC8]">
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Full unbox-on-delivery inspection & Cash on Delivery supported</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee Seal inside Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-6 py-6 px-8 border border-[#E8DFC8] bg-white rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 text-left">
              <div className="p-2.5 bg-[#FAF6ED] text-[#8C6819] border border-[#E8DFC8] rounded-full">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-sans font-bold text-[#1F1B17] uppercase tracking-wider">Atelier Heritage Assurance</p>
                <p className="text-[11px] text-[#6E645A]">All fabric care, custom fittings, and secure VIP deliveries are fully covered.</p>
              </div>
            </div>
            <div className="h-px sm:h-8 w-12 sm:w-px bg-[#E8DFC8]" />
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-[#6E645A] block uppercase tracking-widest font-sans font-medium">Need Immediate Support?</span>
              <a href="https://wa.me/8801700000000" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#8C6819] hover:underline uppercase tracking-widest font-sans flex items-center justify-center sm:justify-start space-x-1 mt-0.5">
                <span>Contact VIP Concierge Desk</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
