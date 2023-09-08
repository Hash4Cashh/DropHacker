import {
  EColors,
  EStatuses,
  EStepType,
  IExecution,
  IExecutionStep,
  IStep,
} from "@types";
import React, { useMemo } from "react";
import { getStepStatus } from "./utils";
import BtnDropdown from "@components/btns/btnDropdown";
import { useObjectBool } from "@hooks/useObjectBool";
import { getStatusColor } from "@providers/utils/getStatusColor";

const ShowStatusProgress = (
  step: IExecutionStep,
  execution: IExecution,
  status: EStatuses
) => {
  "use client";
  const color = getStatusColor(status);
  // console.log(color)
  const amount = getStepStatus(step, status);
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
};

export function ExecutionStep({
  execution,
  step,
  exIndex,
}: {
  execution: IExecution;
  step: IStep;
  exIndex: number;
}) {
  const [bools, setBools] = useObjectBool([["showStep", false]]);
  const totalSteps = execution.accounts?.length;
  const pendings = useMemo(
    () => getStepStatus(step, EStatuses.PENDING),
    [step]
  );
  const inProgress = useMemo(
    () => getStepStatus(step, EStatuses.IN_PROGRESS),
    [step]
  );
  const complete = useMemo(
    () => getStepStatus(step, EStatuses.COMPLETE),
    [step]
  );
  const fail = useMemo(() => getStepStatus(step, EStatuses.FAILED), [step]);
  const stoped = useMemo(() => getStepStatus(step, EStatuses.STOPED), [step]);

  let status: any;
  if (pendings || inProgress) {
    status = EStatuses.IN_PROGRESS;
  } else if (complete === totalSteps) {
    status = EStatuses.COMPLETE;
  } else if (fail === totalSteps) {
    status = EStatuses.FAILED;
  } else if (complete + fail === totalSteps) {
    status = EStatuses.COMPLETE + EStatuses.FAILED;
  } else if (fail) {
    status = EStatuses.PENDING + EStatuses.FAILED;
  } else {
    // console.log(
    //   "Don't met any Status",
    //   pendings,
    //   inProgress,
    //   complete,
    //   fail,
    //   totalSteps
    // );
    status = "";
  }

  return (
    <div className="step justify-center text-gray-700">
      <div className="step-devider" />
      {exIndex !== 0 && <div className={`connector ${status}`} />}
      <div className={`step-progress circle ${status}`}>
        {exIndex + 1}
        {/* {step.stepNumber}  */}
      </div>
      <div className="flex flex-col">
        <div
          className="flex flex-inline justify-between items-center"
          style={{ flex: 1 }}
        >
          <div className="font-bold">{step.stepName}</div>

          {/* STATUSES */}
          <div className="statuses flex flex-inline gap-4 items-center">
            {/* PENDING */}
            {ShowStatusProgress(step, execution, EStatuses.STOPED)}
            {ShowStatusProgress(step, execution, EStatuses.PENDING)}
            {ShowStatusProgress(step, execution, EStatuses.IN_PROGRESS)}
            {ShowStatusProgress(step, execution, EStatuses.FAILED)}
            {ShowStatusProgress(step, execution, EStatuses.COMPLETE)}
            <BtnDropdown
              text="Step Act."
              btnType="btn-regular"
              color={EColors.YELLOW}
              btns={[
                {
                  text: bools.showStep ? "Hide Show Step" : "Show Step",
                  onClick: () => setBools.showStep(!bools.showStep),
                },
              ]}
            />
          </div>
        </div>
        {bools.showStep && (
          <div className="mt-2 flex flex-col ">
            {/* // todo Replace with Separate Component */}
            <div className="mt-2 flex gap-2 flex-wrap">
              <span className="border border-gray-100 py-1 px-4 rounded-md">
                {step.type}
              </span>
              {step.type === EStepType.WEB3 && (
                <span className="border border-gray-100 py-1 px-4 rounded-md">
                  {step.chain}
                </span>
              )}
              {step.type === EStepType.WEB3 && (
                <span className="border border-gray-100 py-1 px-4 rounded-md">
                  {step.protocol}
                </span>
              )}
              {step.type === EStepType.CEX && (
                <span className="border border-gray-100 py-1 px-4 rounded-md">
                  {step.exchange}
                </span>
              )}
              <span className="border border-gray-100 py-1 px-4 rounded-md">
                {step.method}
              </span>
            </div>

            {/* // todo Replace with Separate Component */}
            <div className="mt-2 flex gap-2 flex-wrap	">
              {Object.entries(step.args).map(([title, value], i) => {
                return (
                  <>
                    <div
                      key={i}
                      className="flex border border-gray-100 py-1 px-4 rounded-md gap-1 text-gray-600"
                    >
                      <span className="font-medium ">{title}:</span>
                      <span className="">{value.value}</span>
                      {value.option && <span className="">{value.option}</span>}
                    </div>
                  </>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
