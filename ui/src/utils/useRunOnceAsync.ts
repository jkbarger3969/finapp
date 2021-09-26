import { useEffect, useRef } from "react";

const defaultCondition = () => true;
const INI_SYMBOL = Symbol();
export const useRunOnceAsync = (
  runOnceFn: () => void,
  condition: () => boolean = defaultCondition
): void => {
  const hasRun = useRef<symbol>(INI_SYMBOL);
  useEffect(() => {
    if (condition()) {
      runOnceFn();
    } else {
      hasRun.current = Symbol();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRun.current]);
};

export default useRunOnceAsync;
