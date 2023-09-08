"use client";

import BtnDropdown from "@components/btns/btnDropdown";
import { EColors, EExecutionAccountsMethods, EStatuses, IExecutionAccount, IExecutionStep } from "@types";
import React from "react";
import BtnStatusColor from "@components/btns/btnStatusColor";
import { apiMethodRequest } from "@utils/apiRequest";
import { useRouter } from "next/navigation";

enum showTypes {
  ACTIONS = "Actions",
  ARGS = "Args",
  LOGS = "Logs",
}

export default function ExAccountStepCardHeader({
  step,
  setShowInfo,
  setDisplayInfo,
  account,
  setConfirmModal,
}: {
  step: IExecutionStep;
  setShowInfo: any;
  setDisplayInfo: any;
  account: IExecutionAccount;
  setConfirmModal: (newValue: boolean) => any;
}) {
  const stepState = step.states?.[0];
  const router = useRouter();

  return (
    <>
    <div className="relative flex flex-inline justify-between items-center pl-6 ">
      <div
        className={`step-progress circle -translate-x-4 ${stepState?.status}`}
      >
        {step.stepNumber + 1}
      </div>

      <div
        className="relative font-bold text-gray-700 cursor-pointer hover:scale-105"
        onClick={() => setDisplayInfo((oldV: any) => !oldV)}
      >
        {step.stepName}
      </div>

      <div className="flex flex-inline gap-2">
        <BtnStatusColor status={stepState?.status} />
        <BtnDropdown
          text="actions"
          btnType="btn-regular"
          btns={[
            {
              text: "Show Args",
              color: EColors.ORANGE,
              onClick: () => {
                setShowInfo(showTypes.ARGS);
              },
            },
            {
              text: "Show Logs",
              color: EColors.BLUE,
              onClick: () => {
                setShowInfo(showTypes.LOGS);
              },
            },
            {
              text: "Show Actions",
              color: EColors.CYAN,
              onClick: () => {
                setShowInfo(showTypes.ACTIONS);
              },
            },
            {
              text: "Set Account Status",
              color: EColors.PURPLE,
              onClick: () => {
                setConfirmModal(true);
              },
            },
            {
              text: "Restart from first Action",
              color: EColors.RED,
              onClick: () => {
                apiMethodRequest(`/api/executions/accounts/?method=${EExecutionAccountsMethods.RESTART_ACTION}`, "PUT", {accounts: [account], status: EStatuses.PENDING})
                router.refresh()
              },
            },
          ]}
        />
      </div>
    </div>
    </>
  );
}
