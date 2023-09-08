import { useState } from "react";

export interface IuseObjBoolFns {
  [key: string]: (newValue: boolean) => void;
}

export const useObjectBool = (
  initialKeys: Array<[string, boolean]>
): [Record<string, boolean>, IuseObjBoolFns, (key: string) => boolean] => {
  // useState
  const [value, setValue] = useState<Record<string, boolean>>(() => {
    const initialObj: Record<string, boolean> = {};
    initialKeys.forEach(([key, value]): void => {
      initialObj[key] = value;
    });

    // console.log("[initialObj]", initialObj);
    return { ...initialObj };
  });

  const setBool = (key: string) => (newValue: boolean) => {
    setValue((oldValue) => {
      return {
        ...oldValue,
        [key]: newValue,
      };
    });
  };

  const valueObjBoolFn = () => {
    const result: Record<string, (newValue: boolean) => void> = {};
    for (const [key] of initialKeys) {
      result[key] = setBool(key);
    }
    return result;
  };

  const toggle = (key: string) => {
    const oppositeValue = !value[key];
    setValue((oldValue) => {
      return {
        ...oldValue,
        [key]: !oldValue[key]
      }
    })
    return oppositeValue
  }

  return [value, valueObjBoolFn(), toggle];
};
