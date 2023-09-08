"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";

const variants = {
  fadeIn: {
    y: 100,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  inactive: {
    opacity: 1,
    y: 60,
    transition: {
      duration: 1,
      ease: "easeInOut",
    },
  },
  fadeOut: {
    opacity: 0,
    y: -100,
    transition: {
      duration: 1,
      ease: "easeInOut",
    },
  },
};

export default function PageWrapper({ children }: any) {
  return (
    <>
    <AnimatePresence>
      {/* <motion.div
        className="full-width flex flex-1 justify-center"
        // key={asPath}
        variants={variants}
        initial="fadeIn"
        animate="inactive"
        exit="fadeOut"
      > */}
        {children}
      {/* </motion.div> */}
    </AnimatePresence>
    </>
  );
}
