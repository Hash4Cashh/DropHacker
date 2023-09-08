"use client";
import { BtnPrimary } from "@components/btns/btnPrimary";
import IconRefresh from "@components/icons/iconRefresh";
import Spinner from "@components/spinner";
import { useObjectBool } from "@hooks/useObjectBool";
import { apiGetRequest, apiMethodRequest } from "@utils/apiRequest";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";

export function ExecutionHeader() {
  const router = useRouter();
  const [bools, setBools] = useObjectBool([["inProgress", false]]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {

    return () => { 
      if(intervalRef.current){
        clearInterval(intervalRef.current)
      }
    };
  }, []);

  function handleInterval() {
    if(!intervalRef.current) {
      setBools.inProgress(true);
      apiGetRequest("/api/executions/execute").catch(console.log)
      intervalRef.current = setInterval( async () => {
        await apiGetRequest("/api/executions/execute");
      }, 30000);
    } else {
      clearInterval(intervalRef.current)
      setBools.inProgress(false);
      intervalRef.current = null;
    }
  }
  console.log("bools",bools)
  return (
    <div className="flex flex-inline justify-between">
      <h1 className="text-4xl font-black ">Executions</h1>
      <div className="flex flex-inline gap-4 items-center">
        {/* <IconRefresh onClick={() => router.refresh()} size="xl" /> */}
        <BtnPrimary
          text="Execute"
          inProgress={bools.inProgress}
          prefix={bools.inProgress && <Spinner fill="#fff"/>}
          onClick={handleInterval}
        />
      </div>
    </div>
  );
}
