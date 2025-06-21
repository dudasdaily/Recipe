declare global {
  var ErrorUtils: {
    setGlobalHandler: (handler: ((error: Error, isFatal?: boolean) => void) | null) => void;
  } | undefined;
}

export {}; 