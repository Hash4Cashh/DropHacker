"use client";

import { InputTextDropDown } from "@components/inputs/inputTextDropDown";
import IconWatch from "@components/icons/iconWatch";
import { UseNestedObject } from "@hooks/useNestedObject";
import { useEffect, useState } from "react";
import { BtnPrimary } from "@components/btns/btnPrimary";
import { UseNestedArrayObject } from "@hooks/useNestedObjectArray";
import BtnDelete from "@components/btns/btnIcons/btnDelete";
import { ethers } from "ethers";
import { IAccount } from "@types";
import { motion, AnimatePresence } from "framer-motion";

export function AccountItem({
  account,
  setAccount,
  index,
  onClickDelete,
  disablePrivateKey = false,
  totalIndex,
}: {
  account: IAccount;
  setAccount: UseNestedObject;
  index: number;
  totalIndex?: number;
  onClickDelete: () => any;
  disablePrivateKey?: boolean;
}) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  useEffect(() => {
    const privateKey = account?.privateKey;
    if (privateKey && privateKey.length === 66) {
      const wallet = new ethers.Wallet(privateKey);
      if (wallet.address !== account?.address) {
        setAccount.setKey("address").setValue(wallet.address);
      }
    } else {
      setAccount.setKey("address").setValue(undefined);
    }
  }, [account?.privateKey]);

  // console.log("animateIndex", totalIndex);
  return (
      <motion.div
        key={account.address}
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{ opacity: 0 }}
        transition={{
          delay: index * 0.1,
          duration: .2,
        }}
        className="row account"
      >
        <div
          className="flex items-center font-bold px-3"
          style={{
            height: "36px",
            borderRadius: "8px",
            border: "1px solid #0002",
          }}
        >
          {totalIndex ? totalIndex + 1 : index + 1}
        </div>
        <div className="row-wrapper account">
          <InputTextDropDown
            label="Name"
            value={account?.name!}
            setValue={setAccount.setKey("name").setValue}
          />
        </div>

        <div className="row-wrapper account" style={{ flex: 1 }}>
          <InputTextDropDown
            label="Private Key"
            type={showPrivateKey ? "test" : "password"}
            inputStyles={{ paddingLeft: "3rem" }}
            placeHolder="0x0123..."
            prefix={
              <IconWatch
                size="18px"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                active={showPrivateKey}
              />
            }
            value={account?.privateKey}
            setValue={setAccount.setKey("privateKey").setValue}
            disabled={disablePrivateKey}
          />
        </div>

        <div className="row-wrapper account">
          <InputTextDropDown
            label="Address"
            placeHolder="0x0123..."
            value={account?.address}
            setValue={setAccount?.setKey("address").setValue}
            disabled={true}
          />
        </div>

        <BtnDelete onClick={onClickDelete} />
        {/* <BtnPrimary text="Delete" /> */}
      </motion.div>
  );
}
