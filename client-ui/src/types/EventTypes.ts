export type GenericEvent =
  | {
      sid: string;
      client_id: string;
      timestamp: string;
    } & (TallyEvent | StreamEvent);

export type TallyEvent = {
  type: "Tally";
  answer: string;
};

export type StreamEvent = {
  type: "Stream";
  message: string;
};
