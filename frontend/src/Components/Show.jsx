import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

import Partner from "../assets/Partner.jpg";
import Pan from "../assets/Pan.jpg";
import Car from "../assets/Car.jpg";
import In from "../assets/Insurance.jpg";

function Show() {
  const slides = [
    {
      title: "Partner Program",
      text: "Join hands and grow your business with our partner solution",
      bgValue: Partner,
    },
    {
      title: "Pan Card",
      text: "Quick and secure PAN card related services online.",
      bgValue: Pan,
    },
    {
      title: "Certificate",
      text: "Get verified certificates easily with our trusted process.",
      bgValue: Car,
    },
    {
      title: "Insurance",
      text: "Protect your future with our reliable insurance services.",
      bgValue: In,
    },
  ];

  return (
    <section id="showcase" className="py-8 sm:py-10 mb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-lg sm:text-xl md:text-3xl font-extrabold text-center"
        >
          Our Services
        </motion.h2>

        <div className="mt-6 sm:mt-8">
          <Swiper
            modules={[EffectCoverflow, Autoplay, Pagination]}
            effect="coverflow"
            grabCursor
            centeredSlides
            slidesPerView={1.05}
            spaceBetween={10}
            breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 8 },
              480: { slidesPerView: 1.05, spaceBetween: 10 },
              640: { slidesPerView: 1.2, spaceBetween: 12 },
              768: { slidesPerView: 2, spaceBetween: 16 },
              1024: { slidesPerView: 2.5, spaceBetween: 20 },
            }}
            autoplay={{ delay: 400, disableOnInteraction: false }}
            coverflowEffect={{
              rotate: 0,
              stretch: 15,
              depth: 60,
              modifier: 2,
              slideShadows: false,
            }}
            // pagination={{ clickable: true }}
          >
            {slides.map((s, i) => (
              <SwiperSlide key={i}>
                <div
                  className="rounded-2xl sm:rounded-3xl border border-black/10 shadow-lg flex flex-col justify-between overflow-hidden relative w-full"
                  style={{
                    backgroundImage: `url(${s.bgValue})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    aspectRatio: "4/3",
                  }}
                >
                  {/* Responsive Text Box */}
                  <div className="absolute bottom-3 left-3 z-10 bg-white/90 p-2 sm:p-3 rounded-lg max-w-[75%] sm:max-w-[70%]">
                    <h3 className="text-xs sm:text-sm font-semibold text-black">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-[10px] sm:text-xs text-black/90">
                      {s.text}
                    </p>
                  </div>

                  {/* Responsive Button */}
                  <Link
                    to={`/category/${(s.title || '').toLowerCase().replace(/\s+/g, '-').replace('pan-card','pan')}`}
                    className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 rounded-lg bg-black px-2 py-1 text-white text-[10px] sm:text-xs"
                  >
                    Explore <ArrowRight size={14} />
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

export default Show;
