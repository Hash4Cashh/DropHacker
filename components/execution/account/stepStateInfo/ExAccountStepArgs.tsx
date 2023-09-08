import { JSONFormatter } from "@components/utils/JsonFormater";
import React from "react";

export default function ExAccountStepArgs({
  args,
}: {
  args: any;
}) {
  console.log("ExAccountStepArgs ARGS:\n", args)
  return (
    <div className="flex flex-col pt-2 pl-16 overflow-x-auto">
      <JSONFormatter data={JSON.parse(args || "{}")} />
    </div>
  );
}
