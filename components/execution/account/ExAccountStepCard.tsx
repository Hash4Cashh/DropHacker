"use client";

import {
  EExecutionStepStateMethods,
  EStatuses,
  IExecutionAccount,
  IExecutionStep,
} from "@types";
import React, { useState } from "react";
import ExAccountStepAction from "./stepStateInfo/ExAccountStepAction";
import ExAccountStepLogs from "./stepStateInfo/ExAccountStepLogs";
import ExAccountStepArgs from "./stepStateInfo/ExAccountStepArgs";
import ExAccountStepCardHeader from "./ExAccountStepCardHeader";
import { useObjectBool } from "@hooks/useObjectBool";
import ModalSetStatus from "@components/modals/modalSetStatus";
import { apiMethodRequest } from "@utils/apiRequest";

enum showTypes {
  ACTIONS = "Actions",
  ARGS = "Args",
  LOGS = "Logs",
}

export default function ExAccountStepCard({
  step,
  index,
  account,
}: {
  step: IExecutionStep;
  index: number;
  account: IExecutionAccount;
}) {
  const [bools, setBools] = useObjectBool([
    ["confirmModal", false],
    ["displayInfo", true],
    ["statusInProgress", false],
  ]);

  const [showInfo, setShowInfo] = useState(showTypes.ACTIONS);

  const stepState = step.states?.[0];
  const zIndex = 1000; // Without zIndex, DropDownMenu would hided by next Card

  const displayInfo = bools.displayInfo;

  const onConfirmSetStatus = async (status: EStatuses) => {
    setBools.statusInProgress(true);
    try {
      await apiMethodRequest(
        `/api/executions/stepState/?method=${EExecutionStepStateMethods.UPDATE_STATUS}`,
        "PUT",
        { accounts: [account], stepId: step.id, status }
      );
    } catch(e) {} 
    finally {
      setBools.confirmModal(false);
      setBools.statusInProgress(false);
    }
  };
  return (
    <>
      <div
        className="card-container shadow-lg hover:-translate-y-0.5"
        style={{ zIndex: zIndex - index }}
      >
        <ExAccountStepCardHeader
          step={step}
          setShowInfo={setShowInfo}
          setDisplayInfo={setBools.displayInfo}
          setConfirmModal={setBools.confirmModal}
          account={account}
        />

        {displayInfo && (
          <>
            <div className="relative mt-3 pt-2 pl-10 text-gray-700 font-semibold">
              <div className="card-devider" />
              <span>{showInfo}:</span>
            </div>
            {/* //* ACTIONS */}
            {showInfo === showTypes.ACTIONS && stepState?.actions && (
              <div className="flex flex-col pt-2">
                {stepState?.actions?.map((action, i) => {
                  return <ExAccountStepAction key={i} action={action} />;
                })}
              </div>
            )}

            {/* //* ARGS */}
            {showInfo === showTypes.ARGS && stepState?.args && (
              <ExAccountStepArgs args={stepState?.args} />
            )}

            {/* //* LOGS */}
            {showInfo === showTypes.LOGS && stepState?.logs && (
              <ExAccountStepLogs logs={stepState?.logs} />
            )}
          </>
        )}
      </div>

      <ModalSetStatus
        title={`Set Step Status: ${step.stepName}`}
        initialValue={stepState?.status!}
        display={bools.confirmModal}
        setDisplay={setBools.confirmModal}
        onConfirm={onConfirmSetStatus}
        inProgress={bools.statusInProgress}
      />
    </>
  );
}
