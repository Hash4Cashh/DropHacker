"use client";
import BtnDropdown from "@components/btns/btnDropdown";
import { BtnPrimary } from "@components/btns/btnPrimary";
import BtnStatusColor from "@components/btns/btnStatusColor";
import IconRefresh from "@components/icons/iconRefresh";
import Spinner from "@components/spinner";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useObjectBool } from "@hooks/useObjectBool";
import { ExecutionAccount } from "@prisma/client";
import { EColors, IExecutionAccount } from "@types";
import { apiGetRequest } from "@utils/apiRequest";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";

export function ExAccountCardHeader({
  account,
}: {
  account: IExecutionAccount;
}) {
  const router = useRouter();
  // const [bools, setBools] = useObjectBool([["inProgress", false]]);
  // const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // console.log("bools", bools);
  return (
    <div className="card-container shadow-lg">
      <div className="flex flex-row justify-between items-center">
        <div>
          <span className="font-bold text-lg mr-2 text-gray-700">{account.account?.name}</span>
        </div>
        <div className="flex flex-inline gap-4">
          <BtnStatusColor status={account.status} text={`Current Step: ${account.currentStep ? account.currentStep + 1 : 1}`} />
          <BtnStatusColor status={account.status} />
          <BtnDropdown text="Actions" color={EColors.GREEN} />
        </div>
      </div>
      <div>
          <span className="text-gray-400 text-sm">{account.address}</span>
        </div>
    </div>
  );
}
