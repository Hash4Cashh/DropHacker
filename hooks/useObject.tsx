import { useState } from "react";

export interface IuseObjectFns<T> {
  setValue: (value: T) => unknown;
  editByKey: (key: string) => (newValue: any) => unknown;
}

export const useObject = <T extends {}>(
initialValue: T
): [T, IuseObjectFns<T>] => {
  const [value, setValue] = useState<T>(initialValue);

  const editByKey = (key: string): any => {
    return (newValue: any) => {
      return setValue((oldValue: any) => {
        return { ...oldValue, [key]: newValue };
      });
    };
  };

  return [value, { setValue, editByKey }];
};
