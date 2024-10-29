import { Phase } from "./Phases";
import { ActionType } from "./ActionTypes";

export class LiveSlidePresentation {
  title: string;
  slides: Slide[];
  segmentWriteKey: string;

  constructor() {
    this.title = "";
    this.slides = [];
    this.segmentWriteKey = "";
  }
}

export type PresentationMapItem = {
  key: string;
  data: LiveSlidePresentation;
};

export type CurrentState = {
  currentSlideId: string;
};

export class Option {
  primary: boolean = true;
  optionLabel: string = "";
  optionValue: string = "";
  afterSubmitActions: Action[] = [];
}
export class Action {
  type: ActionType = ActionType.Unknown;
}
export class StreamAction extends Action {
  type: ActionType = ActionType.Stream;
  message: string = "";
  properties: { [key: string]: string } = {};
}

export class TrackAction extends Action {
  type: ActionType = ActionType.Track;
  event: string = "";
  properties: { [key: string]: string } = {};
}

export class IdentifyAction extends Action {
  type: ActionType = ActionType.Identify;
  properties: { [key: string]: string } = {};
}

export class SlideAction extends Action {
  type: ActionType = ActionType.Slide;
  slideId: string = "";
}

export class UrlAction extends Action {
  type: ActionType = ActionType.URL;
  url: string = "";
}

export class TallyAction extends Action {
  type: ActionType = ActionType.Tally;
  answer: string = "";
}

export class Slide {
  id: string = "";
  title: string = "";
  description: string = "";
  kind?: Phase;
}

export class WaitSlide extends Slide {
  constructor(id: string, title: string, description: string) {
    super();
    this.id = id;
    this.title = title;
    this.description = description;
    this.kind = Phase.WatchPresenter;
  }
}

export class WebRtcSlide extends Slide {
  constructor(id: string, title: string, description: string) {
    super();
    this.id = id;
    this.title = title;
    this.description = description;
    this.kind = Phase.WebRtc;
  }
}

export class SubmittedSlide extends Slide {
  constructor(id: string, title: string, description: string) {
    super();
    this.id = id;
    this.title = title;
    this.description = description;
    this.kind = Phase.Submitted;
  }
}

export class GateSlide extends Slide {
  afterSubmitActions: Action[];

  constructor(id: string, title: string, description: string) {
    super();
    this.id = id;
    this.title = title;
    this.description = description;
    this.kind = Phase.Identify;
    this.afterSubmitActions = [];
  }
}

export class QuestionSlide extends Slide {
  key: string;
  options: Option[];

  constructor(id: string, title: string, description: string) {
    super();
    this.id = id;
    this.title = title;
    this.description = description;
    this.kind = Phase.Question;
    this.key = "";
    this.options = [];
  }
}

export class CtaSlide extends Slide {
  options: Option[];

  constructor(id: string, title: string, description: string) {
    super();
    this.id = id;
    this.title = title;
    this.description = description;
    this.kind = Phase.DemoCta;
    this.options = [];
  }
}

export class EndedSlide extends Slide {
  options: Option[];

  constructor(id: string, title: string, description: string) {
    super();
    this.id = id;
    this.title = title;
    this.description = description;
    this.kind = Phase.Ended;
    this.options = [];
  }
}
