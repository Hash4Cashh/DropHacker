import React from "react";
import { GroupContainer } from "@components/accounts/GroupContainer";
import { IAccountGroup } from "@types";
import { apiGetRequest } from "@utils/apiRequest";
import AccountAddBtn from "@components/accounts/accountAddBtn";

export default async function Accounts() {
  const groups = await apiGetRequest("/api/accounts", {next: { revalidate: 60, tags: ["accounts"]}});

  return (
    <div className="container">
      <div className="flex flex-inline justify-between items-center overflow-none">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Accounts
        </h1>
        <AccountAddBtn />
      </div>

      <div className="flex gap-6 flex-column" style={{flexDirection: "column-reverse"}} >
      {groups?.map((group: IAccountGroup, i: number) => {
        return <GroupContainer key={i} group={group} index={groups.length - i} />;
      })}
      </div>

    </div>
  );
}
