"use client";
import { BtnPrimary } from "@components/btns/btnPrimary";
import IconRefresh from "@components/icons/iconRefresh";
import Spinner from "@components/spinner";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useObjectBool } from "@hooks/useObjectBool";
import { ExecutionAccount } from "@prisma/client";
import { IExecutionAccount } from "@types";
import { apiGetRequest } from "@utils/apiRequest";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";

export function ExAccountHeader({account}: {account: IExecutionAccount}) {
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
      }, 10000);
    } else {
      clearInterval(intervalRef.current)
      setBools.inProgress(false);
      intervalRef.current = null;
    }
  }
  console.log("bools",bools)
  return (
    <div className="flex flex-inline justify-between">
      <div className="flex flex-inline gap-4">
      <button className="pl-2 hover:scale-125 pt-2" onClick={() => router.push(`/executions`)}>
          <FontAwesomeIcon size="xl" icon={faArrowLeftLong} />
      </button>
      <h1 className="text-4xl font-black ">{account.execution?.name}</h1>
      </div>
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
