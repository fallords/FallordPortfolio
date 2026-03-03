"use client";

import { motion } from "framer-motion";

const testimonials = [
    {
        quote: "Fadhlan perfectly bridged the gap between our design team's wild ideas and the technical reality. The final product is a masterpiece.",
        author: "Ilham F.",
        role: "CEO, Forteza"
    },
    {
        quote: "Working with Fadhlan was a smooth experience from start to finish. He truly listened to what we needed and delivered something beyond our expectations.",
        author: "Anshar A.",
        role: "Stakeholder, PT Agni Persada"
    }
];

export default function Testimonials() {
    return (
        <section className="py-32 px-6 md:px-12 lg:px-24 bg-[#050505] text-white">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-zinc-500 uppercase tracking-widest text-xs font-semibold mb-16 text-center">
                    Client Feedback
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
                    {testimonials.map((test, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 0.8, delay: i * 0.2 }}
                            className="flex flex-col gap-8"
                        >
                            <p className="text-xl md:text-4xl font-heading font-medium tracking-tight leading-snug">
                                &quot;{test.quote}&quot;
                            </p>
                            <div className="flex gap-4 items-center mt-auto">
                                <div className="w-12 h-12 bg-zinc-800 rounded-full flex justify-center items-center text-xl font-heading font-bold">
                                    {test.author[0]}
                                </div>
                                <div>
                                    <h4 className="font-sans font-bold text-lg">{test.author}</h4>
                                    <span className="text-zinc-500 uppercase tracking-widest text-xs font-semibold">{test.role}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
