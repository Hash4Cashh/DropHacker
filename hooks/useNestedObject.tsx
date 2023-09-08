import { useState } from "react";

export type TNestedObject = Record<string, any>;

export interface NestedObjectMethods {
  setKey: (key: string) => NestedObjectMethods;
  setValue: (value: any) => void;
  getValue: () => TNestedObject | any;
}

export interface UseNestedObject {
  setValue: (value: any) => void;
  setKey: (key: string) => NestedObjectMethods;
  getValue: () => TNestedObject | any;
}

export const useNestedObject = (
  initialState: TNestedObject = {}
): UseNestedObject => {
  const [state, setState] = useState<TNestedObject>(initialState);

  const setKey = (key: string): NestedObjectMethods => {
    const keys = [key]; // run useeNestedKey in the end of the file

    const useeNestedKey = (): NestedObjectMethods => {
      
        const setNestedKey = (newKey: string): NestedObjectMethods => {
        keys.push(newKey);
        return useeNestedKey();
      };

      const setNestedValue = (value: any): void => {
        const nestedObject: TNestedObject = Object.assign({}, state);
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

        setState((prevState) => ({
          ...prevState,
          [key]: nestedObject[key],
        }));
      };

      const getNestedValue = (returnObject: boolean = false): TNestedObject | any => {
        let nestedObject: TNestedObject = state;

        for (let i = 0; i < keys.length; i++) {
            nestedObject = nestedObject?.[keys[i]];
        }
        
        if(!nestedObject && returnObject) {
            return {}
        } else {
            return nestedObject
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

  const setValue = (value: any): void => {
    setState(value);
  };

  const getValue = (): TNestedObject | any => {
    return state;
  };

  return { setValue, setKey, getValue };
};
