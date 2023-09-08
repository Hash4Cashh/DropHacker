"use client";

// import { } from "react";
import { IAccountGroup, IStep, ITask } from "@types";
import { useNestedArrayObject } from "@hooks/useNestedObjectArray";
import { TaskStep } from "./TaskStep";
import BtnDropdown from "@components/btns/btnDropdown";
import { EColors } from "../../types/enums/colors";
import ModalStepName from "./modalStepName";
import { useObjectBool } from "@hooks/useObjectBool";
import { useEffect, useState } from "react";
import ModalTaskName from "./modalCreateTask";
import { useNestedObject } from "@hooks/useNestedObject";
import { apiMethodRequest } from "@utils/apiRequest";
import { useRouter } from "next/navigation";
import { ModalConfirm } from "@components/modals/confirmModal";
import { Account } from "@prisma/client";
import { motion } from "framer-motion";

export function TaskContainer({
  task,
  options,
  groups,
  index,
}: {
  task: ITask;
  groups: Array<IAccountGroup>;
  options: any;
  index: number;
}) {
  const router = useRouter();
  const taskFns = useNestedObject({ ...task, steps: undefined });
  const stepsFns = useNestedArrayObject(task.steps);
  const deletedStepsFns = useNestedArrayObject();

  const [bools, setBools] = useObjectBool([
    ["displayStep", false],
    ["displayTask", false],
    ["displayConfirm", false],
    ["inProgress", false],
    ["executeInProgress", false],
  ]);
  const [stepModalFn, setStepModalFn] = useState(() => (values: any) => {});
  const [stepModalTittle, setStepModalTittle] = useState("");
  const [initialModalValues, setInitialModalValues] = useState({});

  // Need to update the state of the component
  // Whenever task is changed
  useEffect(() => {
    taskFns.setValue({ ...task, steps: undefined });
    stepsFns.setValue(task.steps);
    deletedStepsFns.setValue([]);
  }, [task]);

  // ## ## EXECUTE TASK
  const onClickExecuteTask = (accounts: Array<Account>) => {
    setInitialModalValues(taskFns.getValue());
    setStepModalTittle("Create Execution");
    setBools.displayTask(true);
    setStepModalFn(() => async (values: any) => {
      const res = await apiMethodRequest("/api/executions", "POST", {
        name: values.name,
        steps: stepsFns.getValue(),
        accounts,
      });
      console.log(res);
      router.push("/executions");
    });
  };

  /* * * * * * * * * *
   *   Task Actions  *
   * * * * * * * * * *
   */

  // # # Save Task
  const onClickSave = async () => {
    setBools.inProgress(true);
    // Delete steps, that was removed from list.
    if (deletedStepsFns.getValue().length) {
      const delStepsJSON = JSON.stringify(deletedStepsFns.getValue());
      await apiMethodRequest(
        `/api/tasks?steps=${delStepsJSON}`,
        "DELETE",
        undefined
      );

      deletedStepsFns.setValue([]);
    }

    // Update task and all steps inside
    const res = await apiMethodRequest("/api/tasks", "PUT", {
      id: task.id,
      name: taskFns.setKey("name").getValue(),
      steps: stepsFns.getValue(),
    });

    console.log("Updated Task :::\n", res);
    taskFns.setValue({ ...res, steps: undefined });
    stepsFns.setValue(res.steps);

    setBools.inProgress(false);
  };

  // # # Save Task
  const onClickDelete = async () => {
    setBools.inProgress(true);
    // Delete steps, that was removed from list.
    await apiMethodRequest(`/api/tasks?id=${task.id}`, "DELETE", undefined);

    router.refresh();

    setBools.inProgress(false);
  };

  // # # Add Step
  const onClickAdd = () => {
    setInitialModalValues({});
    setBools.displayStep(true);
    setStepModalTittle("Create Step");
    setStepModalFn(() => (values: any) => {
      stepsFns.push({
        stepName: values.stepName,
        stepNumber: stepsFns.getValue().length + 1,
      });
    });
  };

  // # # Task Name
  const onClickChangeTaskName = () => {
    setInitialModalValues(taskFns.getValue());
    setStepModalTittle("Change Task Name");
    setBools.displayTask(true);
    setStepModalFn(() => (values: any) => {
      taskFns.setKey("name").setValue(values.name);
    });
  };

  /* * * * * * * * * *
   *   Step Actions  *
   * * * * * * * * * *
   */

  // # # Step Name
  const onClickStepChangeName = (index: number) => {
    setInitialModalValues(stepsFns.setIndex(index).getValue());
    setBools.displayStep(true);
    setStepModalTittle("Change Step Name");
    setStepModalFn(() => (values: any) => {
      stepsFns.setIndex(index).setKey("stepName").setValue(values.stepName);
      // stepsFns.push({ stepName: values.stepName, stepNumber: stepsFns.getValue().length + 1 });
    });
  };

  // # # Step Delete
  const onClickStepDelete = (index: number) => {
    const delStep = stepsFns.setIndex(index).getValue();
    if (delStep.id) {
      deletedStepsFns.push(stepsFns.setIndex(index).getValue());
    }
    stepsFns.remove(index);
  };

  // const item = {
  //   hidden: { y: 20, opacity: 0 },
  //   visible: {
  //     y: -20,
  //     opacity: 1,
  //   },
  // };
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { delay: index * 0.2, duration: 0.4, ease: "linear" },
        }}
        exit={{ opacity: 0, y: -20 }}
        className="card-container task drop-shadow-lg"
      >
        <div className="header">
          <h3 className="text-2xl font-bold mb-2">
            {taskFns.setKey("name").getValue()}
          </h3>
          <div className="flex gap-4 flex-inline items-center">
            {/* <BtnText text="Save" color={EColors.BLACK} onClick={() => {}}/> */}
            <BtnDropdown
              text="Actions"
              color={EColors.CYAN}
              btns={[
                { text: "Save", onClick: onClickSave, color: EColors.GREEN },
                {
                  text: "Add Step",
                  onClick: onClickAdd,
                  color: EColors.BLUE,
                },
                { text: "Change Task Name", onClick: onClickChangeTaskName },
                {
                  text: "Delete Task",
                  onClick: () => setBools.displayConfirm(true),
                  color: EColors.RED,
                },
              ]}
            />
            <BtnDropdown
              text="Create Execution"
              color={EColors.DEFAULT}
              btns={groups.map((group) => {
                return {
                  text: `${group.name} : ${group.accounts?.length}`,
                  onClick: () => onClickExecuteTask(group.accounts!),
                  color: EColors.CYAN,
                };
              })}
            />
          </div>
        </div>

        {!stepsFns.getValue().length ? (
          <></>
        ) : (
          stepsFns.getValue().map((step, i) => {
            return (
              <TaskStep
                key={i}
                step={step as IStep}
                setStep={stepsFns.setIndex(i)}
                index={i}
                options={options}
                onClickDelete={onClickStepDelete}
                onClickMove={(index) => {
                  console.log("Task Container MOVING", index);
                }}
                onClickChangeName={onClickStepChangeName}
              />
            );
          })
        )}
      </motion.div>
      {bools.displayStep && (
        <ModalStepName
          title={stepModalTittle}
          display={bools.displayStep}
          setDisplay={setBools.displayStep}
          onClick={stepModalFn}
          initialValues={initialModalValues}
          // initialValues={ste}
        />
      )}
      {bools.displayTask && (
        <ModalTaskName
          display={bools.displayTask}
          setDisplay={setBools.displayTask}
          title={stepModalTittle}
          onClick={stepModalFn}
          initialValues={initialModalValues}
        />
      )}
      {bools.displayConfirm && (
        <ModalConfirm
          display={bools.displayConfirm}
          title="Delete Task"
          setDisplay={setBools.displayConfirm}
          minWidth="440px"
          content={
            <>
              <div className="text-xl font-bold">
                Are u sure you want to delete:
              </div>
              <div>
                <p>
                  Task Name:{" "}
                  <strong>{taskFns.setKey("name").getValue()}</strong>
                </p>
                <p>
                  Total Steps: <strong>{stepsFns.getValue().length}</strong>
                </p>
              </div>
            </>
          }
          onConfirm={onClickDelete}
        />
      )}
    </>
  );
}
