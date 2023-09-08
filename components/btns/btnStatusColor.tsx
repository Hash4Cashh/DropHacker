import Spinner from "@components/spinner";
import { getStatusColor } from "@providers/utils/getStatusColor";
import { EStatuses } from "@types";
import React from "react";

export default function BtnStatusColor({
  text,
  onClick,
  btnClass,
  btnStyle,
  color,
  status,
  inProgress,
}: {
  text?: any;
  onClick?: () => any;
  btnClass?: string;
  btnStyle?: Record<string, any>;
  color?: string,
  status?: EStatuses,
  inProgress?: boolean,
}) {
    if(!color) {
        if(status) {
            color = getStatusColor(status)
        } else {
            color = getStatusColor(EStatuses.PENDING)
        }
    }
  return (
    <div
      onClick={onClick}
      className={`flex flex-inline items-center justify-center font-medium border py-1 px-4 rounded-md ${btnClass}`}
      style={{
        border: `1px solid ${color}66`,
        color: `${color}CC`,
        background: `${color}22`,
        // minWidth: "120px",
        cursor: onClick ? "pointer" : "default",
        ...btnStyle,
      }}
    >
      {inProgress && <Spinner fill={color} color="#0000" />} {text || status}
    </div>
  );
}
