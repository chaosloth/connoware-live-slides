import React, { FC } from "react";
import { Table, THead, TBody, Tr, Th, Td } from "@twilio-paste/core/table";
import { SkeletonLoader } from "@twilio-paste/core/skeleton-loader";
import { Box } from "@twilio-paste/core/box";
import { MoreIcon } from "@twilio-paste/icons/esm/MoreIcon";
import { Slide } from "../../types/LiveSlides";
import {
  MenuButton,
  MenuItem,
  Menu,
  MenuSeparator,
  useMenuState,
} from "@twilio-paste/core/menu";
import SlideListEmpty from "./SlideListEmpty";
import { Anchor } from "@twilio-paste/core/anchor";

const LoadingRow = () => {
  return (
    <Tr>
      <Td scope="row">
        <SkeletonLoader />
      </Td>
      <Td>
        <SkeletonLoader />
      </Td>
      <Td>
        <SkeletonLoader />
      </Td>
      <Td>
        <SkeletonLoader />
      </Td>
    </Tr>
  );
};

export interface SlideListProps {
  loading: boolean;
  slides: Slide[];
  handleOpenSlide: (slide: Slide) => void;
  handleDeleteSlide: (slide: Slide) => void;
  handleNewSlide: () => void;
}

export interface ActionMenuProps {
  slide: Slide;
}
const SlideList: FC<SlideListProps> = (props) => {
  const ActionMenu: React.FC<ActionMenuProps> = (menuProps) => {
    const menu = useMenuState();
    return (
      <Box display="flex" justifyContent="center">
        <MenuButton {...menu} variant="reset" size="reset">
          <MoreIcon decorative={false} title="More options" />
        </MenuButton>
        <Menu {...menu} aria-label="Preferences">
          <MenuItem
            {...menu}
            onClick={() => props.handleOpenSlide(menuProps.slide)}
          >
            Edit Slide
          </MenuItem>
          <MenuSeparator {...menu} />
          <MenuItem
            variant="destructive"
            {...menu}
            onClick={() => props.handleDeleteSlide(menuProps.slide)}
          >
            Delete
          </MenuItem>
        </Menu>
      </Box>
    );
  };

  return (
    <>
      <Table>
        <THead>
          <Tr>
            <Th width="size10">ID</Th>
            <Th width="size20">Kind</Th>
            <Th width="size60">Title</Th>
            <Th width="size10" textAlign="right">
              Actions
            </Th>
          </Tr>
        </THead>
        <TBody>
          {props.loading && (
            <>
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
            </>
          )}
          {props.slides.map((item, idx) => (
            // Using Box as a click target for the entire row
            <Tr key={`slide-row-${idx}`}>
              <Td>
                <Anchor onClick={() => props.handleOpenSlide(item)} href={"#"}>
                  {item.id}
                </Anchor>
              </Td>
              <Td>{item.kind}</Td>
              <Td>{item.title}</Td>
              <Td>
                <ActionMenu slide={item} />
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
      {!props.loading && props.slides && props.slides.length === 0 && (
        <SlideListEmpty handleNewSlide={props.handleNewSlide} />
      )}
    </>
  );
};

export default SlideList;
