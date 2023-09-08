"use client";

import { EColors, IExecution } from "@types";
import { ExecutionCardHeader } from "./ExecutionCardHeader";
import { ExecutionStep } from "./ExecutionStep";
import { useState } from "react";
import { ExecutionAccount } from "./ExecutionAccount";
import { BtnRegular } from "@components/btns/BtnRegular";
import { ExecutionAccounts } from "./ExecutionAccounts";
import { motion } from "framer-motion";

export function ExecutionCard({ execution, index }: { execution: IExecution, index: number }) {
  const [isStep, setIsStep] = useState(true);
  return (
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { delay: index * 0.2, duration: 0.4, ease: "linear" },
        }}
        exit={{ opacity: 0, y: -30 }}
        className="card-container execution drop-shadow-lg"
      > 
      {/* CARD HEADER */}
      <ExecutionCardHeader execution={execution} />
      <div className="pb-2">
        <BtnRegular
          text={isStep ? "Steps" : "Accounts"}
          onClick={() => setIsStep( oldValue => !oldValue)}
          btnClass="sm"
          color={EColors.CYAN}
        />
      </div>

      {isStep ? (
        <>
          <ExecutionAccounts execution={execution} setIsStep={setIsStep} />

          {execution.steps?.map((step, i) => {
            return (
              <ExecutionStep
                key={i}
                execution={execution}
                step={step}
                exIndex={i}
              />
            );
          })}
        </>
      ) : (
        <>
          {execution.accounts?.map((account, i) => {
            return (
              <ExecutionAccount
                key={i}
                execution={execution}
                account={account}
                index={i}
              />
            );
          })}
        </>
      )}
    </motion.div>
  );
}
