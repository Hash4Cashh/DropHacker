"use client";

import { BtnTemplate } from "@components/btns/btnTemplate";
import React, { useEffect, useRef } from "react";
import ModalCreateAccounts from "./modalCreateAccounts";
import { useObjectBool } from "@hooks/useObjectBool";
import { apiPostRequest } from "@utils/apiRequest";
import { useRouter } from "next/navigation";
// import { useRouter } from "next/router";

export default function AccountAddBtn() {
  const router = useRouter();
  const [isBool, setIsBool, toggle] = useObjectBool([
    ["display", false],
    ["inProgress", false],
    ["refreshPage", false],
  ]);
  const toggleRef = useRef((name: any) => {}); // Accounts created via worker, and it doesn't see toggle, so need to store toggle in Ref to update

  useEffect(() => {
    // Not the best solution
    console.log("🔄 Refresh Page");
    router.refresh();
  }, [isBool.refreshPage]);

  useEffect(() => {
    // Accounts created via worker, and it doesn't see toggle, so need to store toggle in Ref to update
    toggleRef.current = toggle;
  }, []);

  return (
    <>
      <div className="flex flex-inline items-center gap-4">
        {/* <IconRefresh onClick={() => toggle("refreshPage")} size="36px" /> */}
        <BtnTemplate
          btnClasses="btn-gradient p-sm"
          onClick={() => {
            toggle("refreshPage");
            setIsBool.display(!isBool.disably);
          }}
        >
          <span>Create Group</span>
        </BtnTemplate>
      </div>
      <ModalCreateAccounts
        createGroup={true}
        display={isBool.display}
        setDisplay={setIsBool.display}
        inProgress={isBool.inProgress}
        setInProgress={setIsBool.inProgress}
        onClickCreate={async (accounts, groupName) => {
          const newGroup = await apiPostRequest(
            "/api/accounts",
            JSON.stringify({ name: groupName, accounts })
          );
          console.log("Accounts to Create", newGroup);

          toggleRef.current("refreshPage");
        }}
      />
    </>
  );
}
