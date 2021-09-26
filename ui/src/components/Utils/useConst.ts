import { useRef } from "react";
export const useConst = <T>(value: T): T => {
  return useRef(value).current;
};
export default useConst;
