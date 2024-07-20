import React, { FC, useEffect } from "react";
import { Box } from "@twilio-paste/core/box";
import { Separator } from "@twilio-paste/core/separator";
import { Slide } from "../../types/LiveSlides";
import BasicInfo from "./BasicInfo";
import OptionsPanel from "./OptionsPanel";
import { Phase } from "../../types/Phases";
import LiveSlidesService from "@/utils/LiveSlidesService";

export interface WidgetProps {
  slide: Slide;
  onSlideUpdate: (slide: Slide) => void;
}

const Widget: FC<WidgetProps> = (props) => {
  const newSlide = new Slide();
  newSlide.id = LiveSlidesService.generateRandomSlideId();
  const [slide, setSlide] = React.useState<Slide>(props.slide);

  useEffect(() => {
    props.onSlideUpdate(slide);
  }, [slide]);

  return (
    <Box>
      <BasicInfo
        slide={props.slide}
        handleKindChange={(evt) =>
          setSlide((prev) => ({ ...prev, kind: evt.target.value as Phase }))
        }
        handleIdChange={(evt) =>
          setSlide((prev) => ({ ...prev, id: evt.target.value }))
        }
        handleTitleChange={(evt) =>
          setSlide((prev) => ({ ...prev, title: evt.target.value }))
        }
        handleDescriptionChange={(evt) =>
          setSlide((prev) => ({ ...prev, description: evt.target.value }))
        }
      />
      <Box backgroundColor="colorBackgroundBody" padding="space50">
        <Separator orientation="horizontal" verticalSpacing="space50" />
      </Box>
      <OptionsPanel options={[]} />
    </Box>
  );
};

export default Widget;
