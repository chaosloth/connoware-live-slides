import { Phase } from "./Phases";

export type LiveSlides = {
  name: string;
  pages: Page[];
};

export type CurrentState = {
  currentPageId: string;
};

export type Page = {
  id: string;
} & (WaitPage | GatePage | QuestionPage | SubmittedPage | CtaPage | WebRtcPage);

export type WaitPage = {
  type: "WatchPresenter";
  title: string;
  description: string;
};

export type WebRtcPage = {
  type: "WebRtc";
  title: string;
  description: string;
};

export type SubmittedPage = {
  type: "Submitted";
  title: string;
  description: string;
};

export type GatePage = {
  type: "Identify";
  title: string;
  description: string;
  afterSubmitPage: string;
};

export type QuestionPage = {
  type: "Question";
  key: string;
  options: Option[];
  title: string;
  description: string;
};

export type Option = {
  optionLabel: string;
  optionValue: string;
  afterSubmitCta: Cta;
};

export type CtaPage = {
  type: "DemoCta";
  title: string;
  description: string;
  cta: Cta[];
};

export type Cta = {
  label: string;
  url: string;
  primary: boolean;
};

export type EndedPage = {
  type: "Ended";
  title: string;
  label: string;
  cta: Cta[];
};
