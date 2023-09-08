"use client";

import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  EColors,
  EExecutionAccountsMethods,
  EStatuses,
  IExecution,
} from "@types";
import React, { useMemo } from "react";
import { getAccountsStatus } from "./utils";
import BtnDropdown from "@components/btns/btnDropdown";
import { getStatusColor } from "@providers/utils/getStatusColor";
import { apiMethodRequest } from "@utils/apiRequest";
import { useRouter } from "next/navigation";

function ShowStatusProgress(execution: IExecution, status: EStatuses) {
  const color = getStatusColor(status);
  const amount = getAccountsStatus(execution.accounts!, status);
  if (amount)
    return (
      <div
        className={`rounded-lg py-1 px-4`}
        style={{
          background: `${color}22`,
          color: color,
          border: `1px solid ${color}99`,
        }}
      >
        <span className={`opacity-70`}>{status}: </span>
        <span>
          <span className="font-bold">{amount} </span>
          {/* <span className="opacity-30">/ {execution.accounts?.length}</span> */}
        </span>
      </div>
    );
}

export function ExecutionAccounts({ execution, setIsStep }: { execution: IExecution, setIsStep: any }) {
  const accounts = execution.accounts;
  const totalSteps = accounts?.length;
  const pendings = //
    useMemo(() => getAccountsStatus(accounts!, EStatuses.PENDING), [accounts]);
  const inProgress = //
    useMemo(
      () => getAccountsStatus(accounts!, EStatuses.IN_PROGRESS),
      [accounts]
    );
  const complete = //
    useMemo(() => getAccountsStatus(accounts!, EStatuses.COMPLETE), [accounts]);
  const fail = //
    useMemo(() => getAccountsStatus(accounts!, EStatuses.FAILED), [accounts]);
  // const stoped = //
  //   useMemo(() => getAccountsStatus(accounts!, EStatuses.STOPED), [accounts]);

  const router = useRouter()

  let status: any;
  if (pendings || inProgress) {
    status = EStatuses.IN_PROGRESS;
  } else if (complete === totalSteps) {
    status = EStatuses.COMPLETE;
  } else if (complete + fail === totalSteps) {
    status = EStatuses.FAILED;
  } else if (fail === totalSteps) {
    status = EStatuses.COMPLETE + EStatuses.FAILED;
  } else {
    status = "";
  }

  return (
    <div className="step text-gray-700">
      <div className="step-devider" />
      <div className={`step-progress circle ${status}`}>
        <FontAwesomeIcon icon={faUser} size="sm" />
      </div>
      <div className="flex flex-inline justify-between items-center">
        <div className="font-bold cursor-pointer hover:scale-105" onClick={() => setIsStep((oldValue: boolean) => !oldValue)}>Accounts</div>

        {/* STATUSES */}
        <div className="statuses flex flex-inline gap-4">
          {/* PENDING */}
          {ShowStatusProgress(execution, EStatuses.STOPED)}
          {ShowStatusProgress(execution, EStatuses.PENDING)}
          {ShowStatusProgress(execution, EStatuses.IN_PROGRESS)}
          {ShowStatusProgress(execution, EStatuses.FAILED)}
          {ShowStatusProgress(execution, EStatuses.COMPLETE)}
          <BtnDropdown
            btnType="btn-regular"
            color={EColors.YELLOW}
            text="Accounts"
            btns={[
              {
                text: "Try Again: Failed Accounts",
                onClick: async () => {
                  console.log(EExecutionAccountsMethods)
                  const failedAccounts = execution.accounts?.filter(acc => acc.status === EStatuses.FAILED)
                  
                  if(failedAccounts?.length) {
                    // "If we have failed accounts
                    const res = await apiMethodRequest(
                      `/api/executions/accounts?method=${EExecutionAccountsMethods.UPDATE_STATUS}`,
                      "PUT",
                      { accounts: failedAccounts, status: EStatuses.PENDING }
                    );
                    console.log("res",res)
                    router.refresh()
                  }
                },
                color: EColors.RED,
              },
              {
                text: "Stop: Uncompleted Accounts",
                onClick: async () => {
                  console.log(EExecutionAccountsMethods)
                  const notStatuses = [EStatuses.COMPLETE, EStatuses.FAILED]
                  const uncompletedAccounts = execution.accounts?.filter(acc => !notStatuses.includes(acc.status))
                  
                  if(uncompletedAccounts?.length) {
                    // "If we have failed accounts
                    const res = await apiMethodRequest(
                      `/api/executions/accounts?method=${EExecutionAccountsMethods.UPDATE_STATUS}`,
                      "PUT",
                      { accounts: uncompletedAccounts, status: EStatuses.STOPED }
                    );
                    console.log("res",res)
                    router.refresh()
                  }
                },
                color: EColors.BLACK,
              },
              {
                text: "Start: Stopped Accounts",
                onClick: async () => {
                  console.log(EExecutionAccountsMethods)
                  const isStatus = [EStatuses.STOPED]
                  const stoppedAccounts = execution.accounts?.filter(acc => isStatus.includes(acc.status))
                  
                  if(stoppedAccounts?.length) {
                    // "If we have failed accounts
                    const res = await apiMethodRequest(
                      `/api/executions/accounts?method=${EExecutionAccountsMethods.UPDATE_STATUS}`,
                      "PUT",
                      { accounts: stoppedAccounts, status: EStatuses.PENDING }
                    );
                    console.log("res",res)
                    router.refresh()
                  }
                },
                color: EColors.GREEN,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
