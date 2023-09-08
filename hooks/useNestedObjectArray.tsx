import { useState } from "react";
import { NestedObjectMethods, TNestedObject, UseNestedObject } from "./useNestedObject";

export type TNestedObjectArray = Array<TNestedObject>;

export interface UseNestedArrayObject {
  push: (newValue: TNestedObject) => void;
  pushMany: (newValues: TNestedObjectArray) => void;
  remove: (index: number) => void;
  editByIndex: (index: number, newValue: TNestedObject) => void;
  setIndex: (index: number) => UseNestedObject;
  setValue: (value: TNestedObjectArray) => void;
  getValue: () => TNestedObjectArray;
}

export const useNestedArrayObject = (
  initialState: TNestedObjectArray = []
): UseNestedArrayObject => {
  const [state, setState] = useState<TNestedObjectArray>(initialState);

  const push = (newValue: TNestedObject = {}) => {
    setState((oldValue) => [...oldValue, newValue]);
  };
  const pushMany = (newValues: TNestedObjectArray = []) => {
    setState((oldValue) => [...oldValue, ...newValues]);
  };

  const remove = (index: number) => {
    setState((oldValue) => oldValue.filter((_, i) => i !== index));
  };

  const editByIndex = (index: number, newValue: TNestedObject) => {
    setState((oldValue) =>
      oldValue.map((v, i) => {
        if (i !== index) {
          return v;
        }
        return newValue;
      })
    );
  };

  const setIndex = (index: number) => {
    const setKey = (key: string): NestedObjectMethods => {
      const keys = [key]; // run useeNestedKey in the end of the file

      const useeNestedKey = (): NestedObjectMethods => {
        const setNestedKey = (newKey: string): NestedObjectMethods => {
          keys.push(newKey);
          return useeNestedKey();
        };

        const setNestedValue = (value: any): void => {
          const nestedObject: TNestedObject = Object.assign({}, state[index]);
          let updatedObject: TNestedObject = nestedObject;
          
          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];

            // If key does not exist, set to Object
            if (!updatedObject[key]) {
              updatedObject[key] = {};
            }

            // Set next Key
            updatedObject = updatedObject[key];
          }

          const lastKey = keys[keys.length - 1];
          updatedObject[lastKey] = value;

          setState((prevState) =>
            prevState.map((v, i) => {
              if (i !== index) {
                return v;
              }
              return {
                ...v,
                ...nestedObject,
              };
            })
          );
        };

        const getNestedValue = (
          returnObject: boolean = false
        ): TNestedObject | any => {
          let nestedObject: TNestedObject = state[index];

          for (let i = 0; i < keys.length; i++) {
            nestedObject = nestedObject?.[keys[i]];
          }

          if (!nestedObject && returnObject) {
            return {};
          } else {
            return nestedObject;
          }
        };

        return {
          setKey: setNestedKey,
          setValue: setNestedValue,
          getValue: getNestedValue,
        };
      };

      return useeNestedKey();
    };

    const setArrValue = (newValue: TNestedObjectArray): void => {
      setState((oldValue) =>
        oldValue.map((v, i) => {
          if (i !== index) {
            return v;
          }
          return newValue;
        })
      );
    };

    const getArrValue = () => {
      return state[index];
    };

    return { setKey, setValue: setArrValue, getValue: getArrValue };
  };

  const setValue = (value: TNestedObjectArray): void => {
    setState(value);
  };

  const getValue = (): TNestedObject | any => {
    return state;
  };

  return { setValue, getValue, push, pushMany, remove, editByIndex, setIndex };
};
