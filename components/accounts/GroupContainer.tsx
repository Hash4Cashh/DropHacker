"use client";

import { useNestedArrayObject } from "@hooks/useNestedObjectArray";
import { AccountItem } from "./accountItem";
import { IAccount, IAccountGroup } from "@types";
import PagePagination from "@components/pagePagination";
import { useEffect, useState } from "react";
import BtnDropdown from "@components/btns/btnDropdown";
import { EColors } from "../../types/enums/colors";
import ModalCreateAccounts from "./modalCreateAccounts";
import { useObjectBool } from "@hooks/useObjectBool";
import { apiMethodRequest } from "@utils/apiRequest";
import { ModalConfirm } from "@components/modals/confirmModal";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ModalGroupName from "./modalGroupName";

export function GroupContainer({ group, index }: { group: IAccountGroup, index: number }) {
  const router = useRouter();
  const accountsFns = useNestedArrayObject(group.accounts);
  const delAccountsFns = useNestedArrayObject([]);
  const createAccountsFns = useNestedArrayObject([]);

  const [bools, setBools] = useObjectBool([
    ["display", false],
    ["confirm", false],
    ["groupName", false],
    ["inProgress", false],
  ]);
  const [page, setPage] = useState(0);
  const [maxPerPage, setMaxPerPage] = useState(5);

  const accounts = accountsFns.getValue();
  const valuesToShow = accounts.slice(
    page * maxPerPage,
    page * maxPerPage + maxPerPage
  );

  useEffect(() => {
    // todo Bad solution. Track previos group
    // If group was changed globally, reset all values.
    // This is needed, due to when one group deleted, all states just move one level up
    accountsFns.setValue(group.accounts || []);
    delAccountsFns.setValue([]);
    createAccountsFns.setValue([]);
  }, [group]);

  const onClickAdd = () => {
    setBools.display(true);
  };

  /* * * * * * * * * *
   *  Page Actions   *
   * * * * * * * * * *
   */

  const handleCreateAccounts = async (
    accounts: Array<IAccount>,
    groupName: string
  ) => {
    console.log("handleCreateAccounts")
    createAccountsFns.pushMany(accounts);
    accountsFns.pushMany(accounts);
  };

  /* * * * * * * * * *
   *  Group Actions  *
   * * * * * * * * * *
   */

  // # # Save Group
  const onClickSave = async () => {
    setBools.inProgress(true);
    // Delete all accounts
    if (delAccountsFns.getValue().length) {
      await apiMethodRequest("/api/accounts/delete", "POST", {
        accounts: delAccountsFns.getValue(),
      });
    }
    // Create all accounts
    if (createAccountsFns.getValue().length) {
      const res = await apiMethodRequest("/api/accounts", "POST", {
        id: group.id,
        accounts: createAccountsFns.getValue(),
      });
      console.log(res);
    }

    setBools.inProgress(false);
    // console.log("Save 123");
  };

  // # # Delete Group
  const onClickDeleteGroupConfirm = async () => {
    setBools.inProgress(true);
    await apiMethodRequest("/api/accounts/delete", "POST", group);
    setBools.inProgress(false);

    router.prefetch("/api/accounts");
    router.refresh();
  };

  // # # Change Group Name
  const onChangeGroupName = async (values: any) => {
    const res = await apiMethodRequest("/api/accounts", "PUT", { id: group.id, name: values.name })
    console.log("UPDATED GROUP", res);

    router.refresh()
  }

  /* * * * * * * * * * *
   *  Account Actions  *
   * * * * * * * * * * *
   */

  // # # Delete Account
  const onClickDeleteAccount = (index: number) => {
    const deletedAccount = accountsFns.setIndex(index).getValue() as IAccount;
    accountsFns.remove(index);
    if (deletedAccount.id) {
      delAccountsFns.push(deletedAccount);
    }
  };

  const handleExport = async () => {
    const dataToCSV = (account: Array<IAccount>) => {
      // Convert data to CSV format
      const csv = account.map((acc) => [acc.name, acc.address, acc.privateKey].join(","));
  
      // Add header row
      const header = ["Name", "Address", "Private Key"].join(",");
      csv.unshift(header);
  
      // Join CSV rows
      return csv.join("\n");
    };
    const saveFile = async (blob: Blob) => {
      const a = document.createElement('a');
      a.download = `${group.name}.csv`;
      a.href = URL.createObjectURL(blob);
      a.addEventListener('click', (e) => {
        setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
      });
      a.click();
    };
  
    const accounts: Array<IAccount> = accountsFns.getValue() as any;
  
    const csvData = dataToCSV(accounts);
    const blob = new Blob([csvData], { type: "text/csv" });
    
    await saveFile(blob);
  };

  return (
    <>
      <motion.div 
        initial={{opacity: 0, y: 60}}
        animate={{opacity: 1, y: 0, transition: {delay: index * 0.2, duration: .3, delayChildren: index * 1}}}
        exit={{opacity: 0, y: -20}}
      className="card-container settings drop-shadow-xl">
        <div
          className="flex flex-inline items-center"
          style={{ justifyContent: "space-between" }}
        >
          <h3 className="font-bold text-2xl">{group.name}</h3>
          <BtnDropdown
            text="Actions"
            color={EColors.DEFAULT}
            inProgress={bools.inProgress}
            btns={[
              {
                text: "Change Name",
                onClick: () => setBools.groupName(true),
                // color: EColors.GREEN,
              },
              { text: "Add", onClick: onClickAdd, color: EColors.CYAN },
              {
                text: "Save",
                onClick: onClickSave,
                color: EColors.GREEN,
              },
              {
                text: "Export CSV",
                onClick: handleExport,
                color: EColors.YELLOW,
              },
              {
                text: "Delete Group",
                onClick: () => setBools.confirm(true),
                color: EColors.RED,
              },
            ]}
          />
        </div>
        {/* <hr style={{ marginTop: "0.5rem" }} /> */}

        <div className="row-wrapper accounts">
        {/* <AnimatePresence mode="" > */}
          {valuesToShow.map((account, i) => {
            return (
              <AccountItem
                key={account.address}
                account={account as IAccount}
                index={i}
                totalIndex={i + page * maxPerPage}
                setAccount={accountsFns.setIndex(i)}
                onClickDelete={() => onClickDeleteAccount(i)}
                disablePrivateKey={true}
              />
            );
          })}
          {/* </AnimatePresence> */}
        </div>

        {/* <hr/> */}
        <div
          className="flex gap-2"
          style={{ marginTop: "1rem", flex: 1, justifyContent: "center" }}
        >
          <PagePagination
            page={page}
            setPage={setPage}
            totalPages={Math.ceil(accounts.length / maxPerPage)}
          />
        </div>
      </motion.div>
      {bools.display && (
        <ModalCreateAccounts
          createGroup={false}
          display={bools.display}
          setDisplay={setBools.display}
          inProgress={bools.inProgress}
          setInProgress={setBools.inProgress}
          onClickCreate={handleCreateAccounts}
        />
      )}

      {bools.confirm && <ModalConfirm
        display={bools.confirm}
        maxWidth="340px"
        content={
          <>
            <span className="text-lg font-semibold">
              Are you sure that you want to delete group of addresses?
            </span>{" "}
            <span>
              Name: <span className="font-black">{group.name}</span>
            </span>
            <span style={{ marginTop: "-1rem" }}>
              Total Accounts:{" "}
              <span className="font-black">
                {accountsFns.getValue().length}
              </span>
            </span>
          </>
        }
        title="Delete Group"
        setDisplay={setBools.confirm}
        onConfirm={onClickDeleteGroupConfirm}
      />}

      {bools.groupName && <ModalGroupName 
        display={bools.groupName}
        setDisplay={setBools.groupName}

        onClick={onChangeGroupName}
        initialValues={group}
      />}
    </>
  );
}
