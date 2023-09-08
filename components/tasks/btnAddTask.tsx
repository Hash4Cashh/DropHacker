"use client";
import { BtnPrimary } from "@components/btns/btnPrimary";
import React from "react";
import ModalCreateTask from "./modalCreateTask";
import { useObjectBool } from "@hooks/useObjectBool";
import { useRouter } from "next/navigation";

export default function AddTaskBtn() {
  const router = useRouter();
  return (
    <>
      <BtnPrimary
        text="Create Task"
        onClick={() => {
          router.push("/tasks/create");
        }}
      />
    </>
  );
}
