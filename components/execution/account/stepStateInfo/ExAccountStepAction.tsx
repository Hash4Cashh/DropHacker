import BtnDropdown from "@components/btns/btnDropdown";
import BtnStatusColor from "@components/btns/btnStatusColor";
import {
  EStatuses,
  IStepActionState,
} from "@types";
import React from "react";

export default function ExAccountStepAction({
  action,
}: {
  action: IStepActionState;
}) {
  return (
    <div className="relative">
      <div className="card-devider" />
      <div className="pl-6">
        <div className="relative flex flex-inline justify-between items-center py-2 pl-2 border-t border-gray">
          <div className={`action-progress circle ${action.status}`} />
          <div className="text-gray-700 font-semibold text-sm pl-10">
            {action.name}
          </div>
          {/* <div> */}
          {/* <BtnDropdown text='action' btnType='btn-regular' btnClasses='p-xs' /> */}

          {/* </div> */}
        </div>
        {action.status === EStatuses.FAILED && (
          <BtnStatusColor
            status={action.status as EStatuses}
            text={action.errorMessage}
            btnClass="mb-2"
            btnStyle={{ overflow: "auto", justifyContent: "start" }}
          />
        )}
      </div>
    </div>
  );
}
