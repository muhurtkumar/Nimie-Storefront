import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const FAQ_DATA = [
  {
    question: "Are these pieces handmade?",
    answer:
      "Yes, every Nimie piece is hand-embroidered by skilled Chikankari artisans in Lucknow.",
  },
  {
    question: "Where is Nimie based?",
    answer:
      "Nimie is a Lucknow-based brand, embracing the old traditional process of Chikankari.",
  },
  {
    question: "Will the colour bleed?",
    answer:
      "Our pieces are carefully finished, but we recommend following the care instructions to prevent colour bleeding.",
  },
  {
    question: "How do I select my size?",
    answer:
      "You’ll find a detailed size chart on every product page. Please check it before ordering.",
  },
  {
    question: "How can I track my order?",
    answer:
      "You’ll receive all order updates via WhatsApp, on the website, and email. You can also reach us at teamnimie@gmail.com.",
  },
  {
    question: "Can I cancel my order?",
    answer:
      "Orders can be cancelled within 24 hours of placing them. After that, cancellations aren’t accepted.",
  },
  {
    question: "Can I return my order?",
    answer:
      "Unworn, unused, unwashed, unaltered and undamaged items with original tags can be returned within 7 days of delivery. Please refer to our Return & Exchange Policy for details.",
  },
];

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faqs"
      className="
        w-full
        bg-[#FFF8EA]
        px-4
        py-12
        sm:px-6
        sm:py-14
        md:py-16
      "
    >
      <div className="mx-auto w-full max-w-[660px] px-4 sm:px-6">

        {/* Heading */}
        <h2
          className="
            mb-5
            text-center
            text-[48px]
            font-weight-600
            leading-none
            text-[#345525]
            sm:text-[48px]
            md:text-[54px]
            lg:text-[60px]
          "
        >
          FAQs
        </h2>

        {/* FAQ List */}
        <div className="space-y-4">
          {FAQ_DATA.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className="
                  overflow-hidden
                  rounded-[12px]
                  border
                  border-[#E5E3DD]
                  bg-white
                  shadow-[0_2px_8px_rgba(0,0,0,0.06)]
                "
              >
                {/* Question */}
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-4
                    px-5
                    py-5
                    text-left
                    sm:px-5
                    sm:py-5
                  "
                >
                  <span
                    className="
                      text-[14px]
                      font-weight-500
                      leading-[1.4]
                      text-[#17134F]
                      sm:text-[14px]
                      md:text-[15px]
                    "
                  >
                    {faq.question}
                  </span>

                  {/* Arrow Circle */}
                  <span
                    className={`
                      flex
                      h-[24px]
                      w-[24px]
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      transition-all
                      duration-300
                      ${
                        isOpen
                          ? "bg-[#345525] text-white"
                          : "bg-[#DDE1DB] text-[#222222]"
                      }
                    `}
                  >
                    {isOpen ? (
                      <ChevronDown
                        className="h-[14px] w-[14px]"
                        strokeWidth={2}
                      />
                    ) : (
                      <ChevronRight
                        className="h-[14px] w-[14px]"
                        strokeWidth={2}
                      />
                    )}
                  </span>
                </button>

                {/* Answer */}
                <div
                  className={`
                    grid
                    transition-all
                    duration-300
                    ease-in-out
                    ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }
                  `}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="px-5 pb-5">
                      <p
                        className="
                          m-0
                          text-[12px]
                          leading-[1.7]
                          text-[#777777]
                          sm:text-[12px]
                          md:text-[13px]
                        "
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}