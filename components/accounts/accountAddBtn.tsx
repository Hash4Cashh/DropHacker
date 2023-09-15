"use client";

import { BtnTemplate } from "@components/btns/btnTemplate";
import React, { useEffect, useRef } from "react";
import ModalCreateAccounts from "./modalCreateAccounts";
import { useObjectBool } from "@hooks/useObjectBool";
import { apiMethodRequest, apiPostRequest } from "@utils/apiRequest";
import { useRouter } from "next/navigation";
import { BtnRegular } from "@components/btns/BtnRegular";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleDown } from "@fortawesome/free-solid-svg-icons";
import Spinner from "@components/spinner";
import { ethers } from "ethers";

export default function AccountAddBtn() {
  const router = useRouter();
  const [isBool, setIsBool, toggle] = useObjectBool([
    ["display", false],
    ["inProgress", false],
    ["importInProgress", false],
    ["refreshPage", false],
  ]);
  const toggleRef = useRef((name: any) => {}); // Accounts created via worker, and it doesn't see toggle, so need to store toggle in Ref to update
  const importInputRef = useRef<HTMLInputElement | null>(null); // Specify the type as HTMLInputElement | null

  useEffect(() => {
    // Not the best solution
    console.log("🔄 Refresh Page");
    router.refresh();
  }, [isBool.refreshPage]);

  useEffect(() => {
    // Accounts created via worker, and it doesn't see toggle, so need to store toggle in Ref to update
    toggleRef.current = toggle;
  }, []);

  function onFileChange(event: any) {
    setIsBool.importInProgress(true);
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const fileReader = new FileReader();

      fileReader.onload = async function (event) {
        const fileContent = event.target?.result;
        const accounts = parseFileContent(fileContent);

        if (accounts?.length) {
          const newGroup = await apiMethodRequest("/api/accounts", "POST", { name: "Default", accounts }); // prettier-ignore
          console.log("Accounts Created", newGroup);

          toggle("refreshPage");
          setIsBool.importInProgress(false);
        }
      };
      fileReader.readAsText(file);
    } catch (e) {
      setIsBool.importInProgress(false);
    } finally {
    }
  }

  function parseFileContent(content: any) {
    // Remove any leading/trailing whitespaces and split the content into lines
    const lines = content.trim().split(/\r?\n/);

    // Function to check if a string is a valid private key (starts with '0x' and has appropriate length)
    function isValidPrivateKey(str: string) {
      return str?.startsWith("0x") && str.length === 66;
    }

    const newAccounts: any = [];
    function addAccount(account: { privateKey: string; name: string }) {
      if (!isValidPrivateKey(account.privateKey)) {
        return alert(`${account.privateKey} is not valid PrivateKey`);
      }

      if (!account.name) {
        Object.assign(account, { name: `Default ${newAccounts.length + 1}` });
      }

      const signer = new ethers.Wallet(account.privateKey);
      newAccounts.push({
        ...account,
        address: signer.address,
      });
    }

    // Loop through each line in the file

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // console.log(line)
      let account = {} as any;
      // Split the line by commas and remove extra spaces
      const values = line.split(",").map((value: any) => value.trim());

      // Check if any of the values in the line are valid private keys
      for (const value of values) {
        if (isValidPrivateKey(value)) {
          // PrivateKeys
          if (account.privateKey) {
            // Several privateKeys in one line
            addAccount(account);
            account = {}
          }
          Object.assign(account, { privateKey: value });
        } else if (value?.startsWith("0x")) {
          // Address
          Object.assign(account, { address: value });
        } else {
          // Random string - should be a name
          Object.assign(account, { name: value });
        }
      }

      if (!isValidPrivateKey(account.privateKey)) {
        if (i === 0) continue; // Only if first line
        return alert(`Line: ${line} \ndoes not contain valid PrivateKey`);
      }

      addAccount(account);
    }
    // console.log(privateKeys);
    console.log(newAccounts);
    return newAccounts;
  }

  return (
    <>
      <div className="flex flex-inline items-center gap-4">
        {/* <IconRefresh onClick={() => toggle("refreshPage")} size="36px" /> */}
        <input
          ref={importInputRef}
          type="file"
          id="fileInput"
          accept=".csv, .txt"
          style={{ display: "none" }}
          onChange={onFileChange}
        />
        <BtnRegular
          text={
            isBool.importInProgress ? (
              <Spinner
                fill="#000"
                color="#0000"
                divStyle={{ marginRight: "-8px" }}
              />
            ) : (
              ((<FontAwesomeIcon icon={faArrowAltCircleDown} />) as any)
            )
          }
          btnClass="p-lg"
          onClick={() => {
            importInputRef.current?.click();
          }}
        />
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
