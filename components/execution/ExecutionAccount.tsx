import BtnDropdown from "@components/btns/btnDropdown";
import BtnStatusColor from "@components/btns/btnStatusColor";
import { getStatusColor } from "@providers/utils/getStatusColor";
import {
  EColors,
  EExecutionAccountsMethods,
  EStatuses,
  IExecution,
  IExecutionAccount,
} from "@types";
import { apiGetRequest, apiMethodRequest } from "@utils/apiRequest";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export function ExecutionAccount({
  execution,
  account,
  index,
}: {
  execution: IExecution;
  account: IExecutionAccount;
  index: number;
}) {
  const color = getStatusColor(account.status);
  const totalSteps = execution.steps?.length;
  const currentStep = account.currentStep! + 1;
  const router = useRouter();
  console.log(account.status, account.errorMessage);

  const changeAccountStatus = async (status: EStatuses) => {
    const res = await apiMethodRequest(
      `/api/executions/accounts?method=${EExecutionAccountsMethods.UPDATE_STATUS}`,
      "PUT",
      { accounts: [account], status }
    );
    console.log("res", res);
    router.refresh();
  };
  let accountBtns = [];
  const restartFail = {
    text: "Try Again / Set As Pending",
    color: EColors.RED,
    onClick: () => changeAccountStatus(EStatuses.PENDING),
  };
  const stopPending = {
    text: "Stop",
    color: EColors.BLACK,
    onClick: () => changeAccountStatus(EStatuses.STOPED),
  };
  const startStoped = {
    text: "Start",
    color: EColors.GREEN,
    onClick: () => changeAccountStatus(EStatuses.PENDING),
  };

  switch (account.status) {
    case EStatuses.FAILED:
      accountBtns.push(restartFail);
      break;
    case EStatuses.PENDING:
      accountBtns.push(stopPending);
      break;
    case EStatuses.STOPED:
      accountBtns.push(startStoped);
      break;
  }

  return (
    <div className="step justify-center">
      <div className="flex flex-col ">
        <div className="step-devider" />
        {/* {index !== 0 && <div className={`connector ${execution.status}`} />} */}
        <div className={`step-progress circle ${account.status}`}>
          {index + 1}
        </div>
        <div
          className="flex flex-inline justify-between items-center flex-wrap"
          style={{ flex: 1 }}
        >
          <div className="flex flex-inline gap-4">
            <a
              className="cursor-pointer hover:scale-105"
              target="_blank"
              rel="noopener noreferrer"
              href={`/executions/${execution.id}/account/${account.address}`}
            >
              <div className="text-gray-600 font-bold">
                {account.account?.name}
              </div>
            </a>
            <div className="text-gray-400">
              {account.address?.slice(0, 6)}...
              {account.address?.slice(34, -1)}
              {account.address?.[account.address.length - 1]}
            </div>
          </div>
          {/* <div style={{ maxWidth: "200px" }}>{account.address}</div> */}

          <div className="flex flex-inline gap-2 flex-wrap">
            <BtnStatusColor
              text={
                <span className="flex flex-inline gap-1">
                  <span className="font-bold">
                    {Math.min(currentStep, totalSteps!)}{" "}
                  </span>
                  <span className="opacity-50">/</span>
                  <span className="opacity-50">{execution.steps?.length}</span>
                </span>
              }
              color={color}
            />

            {/* STEP NAME */}
            {account.status !== EStatuses.COMPLETE && (
              <BtnStatusColor
                text={execution.steps?.[account.currentStep || 0]?.stepName}
                color={color}
              />
            )}

            {/* STATUS */}
            <BtnStatusColor
              text={account.status}
              color={color}
              // btnStyle={{ minWidth: "0" }}
            />

            <BtnDropdown
              btnType="btn-regular"
              text="Account Act."
              btns={[
                ...accountBtns,
                {
                  text: "Skip Current Step",
                  color: EColors.BLUE,
                  onClick: async () => {
                    await apiMethodRequest(
                      `/api/executions/accounts?method=${EExecutionAccountsMethods.SKIP_CURRENT_STEP}`,
                      "PUT",
                      { accounts: [account], status: EStatuses.PENDING }
                    );
                    router.refresh()
                  },
                },
              ]}
            />
          </div>
        </div>
        {account.status === EStatuses.FAILED && account.errorMessage && (
          <BtnStatusColor
            text={account.errorMessage}
            color={color}
            btnClass="mt-2"
            btnStyle={{
              justifyContent: "flex-start",
              alignItems: "start",
              overflow: "auto",
              maxHeight: "120px",
            }}
          />
        )}
      </div>
    </div>
  );
}
