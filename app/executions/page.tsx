import { ExecutionCard } from "@components/execution/ExecutionCard_";
import { ExecutionHeader } from "@components/execution/ExecutionHeader";
import { IExecution } from "@types";
import { apiGetRequest } from "@utils/apiRequest";
import React from "react";

async function Executions() {
  const executions = (await apiGetRequest("/api/executions", {
    next: { tags: ["executions"], revalidate: 2 },
    // cache: "no-cache"
  })) as Array<IExecution> | undefined;

  return (
    <div className="container">
      <ExecutionHeader />
      <div className="flex flex-col-reverse gap-8">
        {executions?.map((execution, i) => {
          return <ExecutionCard key={i} execution={execution} index={executions.length - i - 1} />;
        })}
      </div>
    </div>
  );
}

export default Executions;
