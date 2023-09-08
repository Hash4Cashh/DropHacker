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

export function ProviderContainer({
  providers,
}: {
  providers: Array<IProvider>;
}) {
  const providersFns = useNestedArrayObject(providers);
  const [bools, setBools] = useObjectBool([["inProgress", false]]);

  return (
    <div className="flex gap-4 flex-col">
      {providers?.map((provider, i) => {
        return (
          <ProviderCard
            key={i}
            provider={providersFns.setIndex(i).getValue()}
            setProvider={providersFns.setIndex(i)}
            index={i}
          />
        );
      })}

      <motion.div initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { delay: providers?.length * 0.2, duration: 0.4, ease: "linear" },
        }}
        exit={{ opacity: 0, y: -20 }}>
        <BtnPrimary
          prefix={bools.inProgress && <Spinner fill="#fff" color="#fff0" />}
          inProgress={bools.inProgress}
          text="Save"
          onClick={async () => {
            setBools.inProgress(true);

            console.log("providersFns.getValue()",providersFns.getValue())
            const newProviders = await apiMethodRequest("/api/settings/providers", "POST", providersFns.getValue());
            console.log("newProviders", newProviders);
            
            providersFns.setValue(newProviders);
            setBools.inProgress(false);
          }}
        />
      </motion.div>
    </div>
  );
}
