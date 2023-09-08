import { IExecutionAccount, IExecutionStep } from "@types";
import { apiGetRequest } from "@utils/apiRequest";
import React from "react";
import { ExAccountHeader } from "@components/execution/account/ExAccountHeader";
import ExAccountStepCard from "@components/execution/account/ExAccountStepCard";
import { ExAccountCardHeader } from "@components/execution/account/ExAccountCardHeader";

async function Executions({
  params,
}: {
  params: { executionId: string; address: string };
}) {
  const {account, steps} = (await apiGetRequest(
    `/api/executions/accounts?executionId=${params.executionId}&address=${params.address}`,
    {
      next: { tags: ["executions"], revalidate: 2 },
    }
  )) as {account: IExecutionAccount, steps: Array<IExecutionStep>};

  return (
    <div className="container">

      <ExAccountHeader account={account} />

      <div className="flex flex-col gap-4">

        <ExAccountCardHeader account={account} />

        {steps.map((step, i: number) => {
          return <ExAccountStepCard step={step} account={account} index={i} key={`STEP-CARD-${i}`} />
        })}
      </div>
    </div>
  );
}

export default Executions;
