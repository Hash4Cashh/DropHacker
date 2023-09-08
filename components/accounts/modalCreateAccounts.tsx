"use client";

import { BtnRegular } from "@components/btns/BtnRegular";
import { BtnPrimary } from "@components/btns/btnPrimary";
import { BtnTemplate } from "@components/btns/btnTemplate";
import { InputTextDropDown } from "@components/inputs/inputTextDropDown";
import { ModalCustom } from "@components/modals/customModal";
import { useNestedArrayObject } from "@hooks/useNestedObjectArray";
import { EColors } from "../../types/enums/colors";
import React, { useEffect, useRef, useState } from "react";
import { AccountItem } from "./accountItem";
import { IAccount } from "@types";
import { ethers } from "ethers";
import Spinner from "@components/spinner";
import { useWorker } from "@hooks/useWorker";
import { useRouter } from "next/navigation";
// import worker from 'workerize-loader?inline!./walletCreationWorker'
// import worker from 'workerize-loader!./walletCreationWorker';
// Import the web worker script

interface IProps {
  createGroup?: boolean;
  display: boolean;
  setDisplay: (newValue: boolean) => any;
  inProgress: boolean;
  setInProgress: (newValue: boolean) => any;
  onClickCreate: (accounts: Array<IAccount>, groupName: string) => any;
}
export default function ModalCreateAccounts({
  createGroup,
  display,
  setDisplay,
  inProgress,
  setInProgress,
  onClickCreate,
}: IProps) {
  //   const [isOpen, setIsOpen] = useState(true);
  const [amount, setAmount] = useState(0);
  const [groupName, setGroupName] = useState("Group");
  const [walletPrefix, setWalletPrefix] = useState("Wallet");

  const accountsFns = useNestedArrayObject();
  const options = [5, 10, 25, 50, 100];

  // Create a ref to hold the web worker instance
  const workerRef = useRef<Worker | null>(null);
  const groupNameRef = useRef(groupName);

  // ``Handle the web worker message
  const onWorkerComplete = async (event: MessageEvent) => {
    const { data: accounts } = event;

    if (accounts.error) {
      return console.error("Wallet creation error:", accounts.error);
    }

    await onClickCreate(accounts, groupNameRef.current)
    setInProgress(false);
    setDisplay(false);
    // Set inProgress to false after completion
  };

  // Initialize the web worker on component mount
  useWorker(workerRef, onWorkerComplete);
  
  useEffect(() => {
    groupNameRef.current = groupName;
  }, [groupName])

  return (
    <ModalCustom
      display={display}
      title="Creating Wallets"
      setDisplay={setDisplay}
      btns={[
        <BtnPrimary
          key={0}
          text="CREATE"
          btnClass="md"
          prefix={inProgress && <Spinner color="#FFF1" fill="#000" />}
          inProgress={inProgress}
          color={EColors.GREEN}
          btnStyle={{ padding: "0.5rem 1rem", fontWeight: "900" }}
          //   onClick={handleCreateWallets}
          onClick={async () => {
            // $ CREATING ACCOUNTS
            if(inProgress) return;
            setInProgress(true);
            const startIndex = accountsFns.getValue().length + 1;
            const myAccounts = accountsFns.getValue()

            // * Use worker, in order to not block the main thread
            workerRef.current?.postMessage({
              startIndex,
              amount,
              walletPrefix,
              myAccounts
            });
          }}
        />,
      ]}
    >
      {/* //* NUMBER OF WALLETS */}
      <div className="flex flex-inline items-end gap-2 ">
        <div style={{ flex: 1 }}>
          <InputTextDropDown
            label="Wallets"
            type="number"
            width="100%"
            value={amount}
            setValue={setAmount}
          />
        </div>
        <div className="btn-group" role="group" style={{ flex: 5 }}>
          {options.map((number, i) => {
            return (
              <button
                key={i}
                type="button"
                className="btn btn-regular sm"
                style={{
                  padding: "0.5rem 1rem",
                  background: number == amount ? "rgb(207, 142, 239)" : "",
                  color: number == amount ? "#fff" : "",
                  fontWeight: number == amount ? "700" : "",
                }}
                onClick={() => {
                  setAmount(number);
                }}
              >
                {number}
              </button>
            );
          })}
        </div>
      </div>

      {/* //* GROUP & PREFIX */}
      <div className="flex flex-inline gap-2">
        {createGroup && (
          <div className="flex" style={{ flex: 1 }}>
            <InputTextDropDown
              label="Group Name"
              width="100%"
              value={groupName}
              setValue={setGroupName}
            />
          </div>
        )}

        <div className="flex" style={{ flex: 1 }}>
          <InputTextDropDown
            label="Wallet Prefix"
            width="100%"
            value={walletPrefix}
            setValue={setWalletPrefix}
          />
        </div>
      </div>

      {/* // * MY WALLETS */}
      <hr />
      <div
        className="flex flex-inline items-center"
        style={{ justifyContent: "space-between" }}
      >
        <h3 className="font-bold">My Wallets</h3>
        <BtnPrimary
          text="Add My Wallet"
          btnStyle={{ padding: "0.5rem 1rem" }}
          btnClass="sm"
          onClick={() => {
            const index = accountsFns.getValue().length;
            accountsFns.push({ name: `${walletPrefix} ${index + 1}` });
          }}
        />
      </div>

      {/* //$ ACCOUNT LIST */}
      {accountsFns.getValue().map((account, i: number) => {
        return (
          <AccountItem
            key={i}
            index={i}
            account={account as IAccount}
            setAccount={accountsFns.setIndex(i)}
            onClickDelete={() => accountsFns.remove(i)}
          />
        );
      })}
    </ModalCustom>
  );
}
