"use client";

import { InputTextDropDown } from "@components/inputs/inputTextDropDown";
import Spinner from "@components/spinner";
import React, { useEffect, useState } from "react";
import { debounce } from "lodash";
import { UseNestedObject } from "@hooks/useNestedObject";
import { motion } from "framer-motion";
import { Exchange } from "@prisma/client";
import { apiMethodRequest } from "@utils/apiRequest";
import { EStatuses, IExchange } from "@types";
import IconWatch from "@components/icons/iconWatch";
import { useObjectBool } from "@hooks/useObjectBool";
import { getStatusColor } from "@providers/utils/getStatusColor";

export function ExchangeCard({
  exchange,
  setExchange,
  index,
}: {
  exchange: IExchange;
  setExchange: UseNestedObject;
  index: number;
}) {
  const [status, setStatus] = useState(EStatuses.PENDING);
  const [bools, setBools, toggle] = useObjectBool([
    ["loading", false],
    ["showApi", true],
    ["showSecret", false],
    ["showPhrase", false],
    ["fetchAgain", false],
  ]);
  const [ping, setPing] = useState(0);

  const color = getStatusColor(status);

  const devounceExchange = debounce(
    async () => {
      try {
        const now = Date.now();

        const res = await apiMethodRequest(
          "/api/settings/exchanges/check",
          "POST",
          exchange
        );
        console.log(res);

        const timePast = Date.now();
        setPing((timePast - now) / 1000);

        setStatus(res.status);
      } catch (e) {
        console.log(e);
        setPing(999);
        setStatus(EStatuses.FAILED);
      } finally {
        setBools.loading(false);
      }
    },
    1000
    // { loading: true, trailing: true }
  );

  useEffect(() => {
    if (!exchange.url) return;
    setBools.loading(true);

    devounceExchange();

    return () => {
      devounceExchange.cancel();
    };
  }, [
    exchange.credentials.apiKey,
    exchange.credentials.passphrase,
    exchange.credentials.secretKey,
    bools.fetchAgain,
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.2, duration: 0.4, ease: "linear" },
      }}
      exit={{ opacity: 0, y: -20 }}
      className="card-container settings drop-shadow-lg"
    >
      <div className="relative flex flex-inline justify-between items-center">
        <h3 className="font-bold text-xl ml-2 capitalize">{exchange.name}</h3>

        {/* <div className="absolute text-gray-600 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="font-semibold">LastBlock:</span>
          <span className="ml-1">{blockNumber}</span>
        </div> */}

        <div className="text-gray-600">
          <span className="font-semibold">Ping:</span>
          <span className="ml-1">{ping}s</span>
        </div>
      </div>

      {/* MAINET */}
      <div className="flex flex-inline gap-4 items-end justify-between mt-4">
        <div className="flex flex-1">
          <InputTextDropDown
            prefix={
              <IconWatch
                size="18px"
                active={bools.showApi}
                onClick={() => toggle("showApi")}
              />
            }
            type={bools.showApi ? "test" : "password"}
            inputStyles={{ paddingLeft: "2.25rem" }}
            label="Api key"
            value={exchange.credentials.apiKey!}
            setValue={setExchange.setKey("credentials").setKey("apiKey").setValue}
            width="100%"
          />
        </div>
        <div className="flex flex-1">
          <InputTextDropDown
            prefix={
              <IconWatch
                size="18px"
                active={bools.showSecret}
                onClick={() => toggle("showSecret")}
              />
            }
            type={bools.showSecret ? "test" : "password"}
            inputStyles={{ paddingLeft: "2.25rem" }}
            label="Secret key"
            value={exchange.credentials.secretKey!}
            setValue={setExchange.setKey("credentials").setKey("secretKey").setValue}
            width="100%"
          />
        </div>
        <div className="flex flex-1">
          <InputTextDropDown
            prefix={
              <IconWatch
                size="18px"
                active={bools.showPhrase}
                onClick={() => toggle("showPhrase")}
              />
            }
            type={bools.showPhrase ? "test" : "password"}
            inputStyles={{ paddingLeft: "2.25rem" }}
            label="Passphrase"
            value={exchange.credentials.passphrase!}
            setValue={setExchange.setKey("credentials").setKey("passphrase").setValue}
            width="100%"
          />
        </div>
        <div
          onClick={() => toggle("fetchAgain")}
          className="flex flex-inline items-center justify-center font-medium border py-1 px-4 rounded-md"
          style={{
            border: `1px solid ${color}66`,
            color: `${color}CC`,
            background: `${color}22`,
            minWidth: "120px",
            cursor: "pointer",
          }}
        >
          {bools.loading && <Spinner fill={color} color="#0000" />} {status}
        </div>
      </div>
    </motion.div>
  );
}
