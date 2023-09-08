import { JSONFormatter } from "@components/utils/JsonFormater";
import React from "react";

export default function ExAccountStepLogs({
  logs,
}: {
  logs: any;
}) {
  return (
    <div className="flex flex-col pt-2 pl-16">
      <JSONFormatter data={JSON.parse(logs || "{}")} />
    </div>
  );
}
