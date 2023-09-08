"use client";

import BtnDropdown from "@components/btns/btnDropdown";
import BtnStatusColor from "@components/btns/btnStatusColor";
import { useObjectBool } from "@hooks/useObjectBool";
import { getStatusColor } from "@providers/utils/getStatusColor";
import { EColors, EStatuses, IExecution } from "@types";
import { apiGetRequest, apiMethodRequest } from "@utils/apiRequest";
import { useRouter } from "next/navigation";
import React from "react";

export function ExecutionCardHeader({
  execution,
}: {
  execution: IExecution;
}) {
    const router = useRouter();
    const [bools, setBools] = useObjectBool([["inProgress", false]])
    const color = getStatusColor(execution.status);
  return (
    <div className="relative card-header flex flex-inline justify-between items-center">
      <h3 className="text-xl font-bold">{execution.name}</h3>
      <BtnStatusColor status={execution.status} btnClass="absolute top-0 left-1/2 transform -translate-x-1/2 "/>
      {/* <span className="font-black text-xl">{execution.status}</span> */}
      <BtnDropdown
        text="Actions"
        inProgress={bools.inProgress}
        color={EColors.GREEN}
        btns={[
          {
            text: "Execute",
            onClick: async () => {
              console.log("Executing");
              setBools.inProgress(true);
              await apiGetRequest("/api/executions/execute");
              setBools.inProgress(false);
              router.refresh()
            },
          },
          {
            text: "Start",
            onClick: async () => {
              setBools.inProgress(true);
              const res = await apiMethodRequest("/api/executions/execute", "POST", {id: execution.id, status: EStatuses.IN_PROGRESS});
              console.log(res)
              setBools.inProgress(false);
              router.refresh()
            },
            color: EColors.GREEN
          },
          // {
          //   text: "Test",
          //   onClick: async () => {
          //     setBools.inProgress(true);
          //     const res = await apiMethodRequest("/api/executions/execute", "PUT", {id: execution.id});
          //     console.log(res)
          //     setBools.inProgress(false);
          //     router.refresh()
          //   },
          //   color: EColors.BLUE
          // },
        ]}
      />
      {/* <BtnPrimary
        text="Start"
        btnClass="sm"
        color={EColors.GREEN}
        onClick={async () => {
          console.log("Executing");
          await apiGetRequest("/api/executions/execute");
        }}
      /> */}
    </div>
  );
}
