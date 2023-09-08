"use client";

import { IProvider } from "@types";
import React from "react";
import { ProviderCard } from "./providerCard";
import { useNestedArrayObject } from "@hooks/useNestedObjectArray";
import { BtnPrimary } from "@components/btns/btnPrimary";
import { useObjectBool } from "@hooks/useObjectBool";
import Spinner from "@components/spinner";
import { apiMethodRequest } from "@utils/apiRequest";
import { motion } from "framer-motion";
import { Exchange } from "@prisma/client";
import { ExchangeCard } from "./exchangeCard";

export function ExchangesContainer({
  exchanges,
}: {
  exchanges: Array<Exchange>;
}) {
  const exchangesFns = useNestedArrayObject(exchanges);
  const [bools, setBools] = useObjectBool([["inProgress", false]]);

  return (
    <div className="flex gap-4 flex-col">
      {exchangesFns.getValue().map((exchange, i) => {
        return (
          <ExchangeCard
            key={i}
            exchange={exchange as any}
            setExchange={exchangesFns.setIndex(i)}
            index={i}
          />
        );
      })}

      <motion.div initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { delay: exchanges?.length * 0.2, duration: 0.4, ease: "linear" },
        }}
        exit={{ opacity: 0, y: -20 }}>
        <BtnPrimary
          prefix={bools.inProgress && <Spinner fill="#fff" color="#fff0" />}
          inProgress={bools.inProgress}
          text="Save"
          onClick={async () => {
            setBools.inProgress(true);

            console.log("exchangesFns.getValue()",exchangesFns.getValue())
            const newExchanges = await apiMethodRequest("/api/settings/exchanges", "POST", exchangesFns.getValue());
            console.log("newExchanges", newExchanges);
            
            exchangesFns.setValue(newExchanges);
            setBools.inProgress(false);
          }}
        />
      </motion.div>
    </div>
  );
}
