// "use client";

import React from "react";
import { ITask } from "@types";
import { apiGetRequest } from "@utils/apiRequest";
import { TaskContainer } from "@components/tasks/taskContainer";
import AddTaskBtn from "@components/tasks/btnAddTask";

export default async function Tasks() {
  const [tasks, options, groups] = await Promise.all([
    apiGetRequest("/api/tasks", { next: { revalidate: 60, tags: ["tasks"] } }),
    apiGetRequest("/api/tasks/options"),
    apiGetRequest("/api/accounts"),
  ]);

  return (
    <>
      <div className="container">
        <div className="flex flex-inline justify-between items-end overflow-none">
          <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-4xl">
            TASKS
          </h1>
          <AddTaskBtn />
        </div>

        <div className="flex gap-8" style={{ flexDirection: "column-reverse" }}>
          {tasks?.map((task: ITask, i: number) => {
            return (
              <TaskContainer
                key={i}
                task={task}
                options={options}
                groups={groups}
                index={tasks.length - i}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
