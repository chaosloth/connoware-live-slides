import React, { FC } from "react";
import { Table, THead, TBody, Tr, Th, Td } from "@twilio-paste/core/table";
import { SkeletonLoader } from "@twilio-paste/core/skeleton-loader";
import { Box } from "@twilio-paste/core/box";
import { PresentationMapItem } from "../../types/LiveSlides";
import { MoreIcon } from "@twilio-paste/icons/esm/MoreIcon";
import {
  MenuButton,
  MenuItem,
  Menu,
  MenuSeparator,
  useMenuState,
} from "@twilio-paste/core/menu";

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
    </Tr>
  );
};

export interface PresentationListProps {
  loading: boolean;
  items: PresentationMapItem[];
  handleOpenPresenterView: (presentation: PresentationMapItem) => void;
  handleMonitorPresentation: (presentation: PresentationMapItem) => void;
  handleEditPresentation: (presentation: PresentationMapItem) => void;
  handleVisualDesigner?: (presentation: PresentationMapItem) => void;
  handleDeletePresentation: (presentation: PresentationMapItem) => void;
  handleNewPresentation: () => void;
}

export interface ActionMenuProps {
  presentation: PresentationMapItem;
}

const PresentationList: FC<PresentationListProps> = (props) => {
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
            onClick={() =>
              props.handleOpenPresenterView(menuProps.presentation)
            }
          >
            Presenter View
          </MenuItem>
          <MenuItem
            {...menu}
            onClick={() =>
              props.handleMonitorPresentation(menuProps.presentation)
            }
          >
            Monitor
          </MenuItem>
          <MenuItem
            {...menu}
            onClick={() => props.handleEditPresentation(menuProps.presentation)}
          >
            Edit Presentation (JSON)
          </MenuItem>
          {props.handleVisualDesigner && (
            <MenuItem
              {...menu}
              onClick={() => props.handleVisualDesigner!(menuProps.presentation)}
            >
              Visual Designer
            </MenuItem>
          )}
          <MenuSeparator {...menu} />
          <MenuItem
            variant="destructive"
            {...menu}
            onClick={() =>
              props.handleDeletePresentation(menuProps.presentation)
            }
          >
            Delete
          </MenuItem>
        </Menu>
      </Box>
    );
  };
  return (
    <Table>
      <THead>
        <Tr>
          <Th width="size10">Code</Th>
          <Th width="size40">Presentation Title</Th>
          <Th width="size20">Live Slides</Th>
          <Th width="size10" textAlign="center">
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

        {!props.loading &&
          props.items.map((item, idx) => (
            // Using Box as a click target for the entire row
            <Tr key={`presentation-row-${idx}`}>
              <Td>
                <Anchor
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    props.handleVisualDesigner?.(item);
                  }}
                >
                  {item.key}
                </Anchor>
              </Td>
              <Td>{item.data.title}</Td>
              <Td>{item.data.slides.length}</Td>
              <Td textAlign="right">
                <ActionMenu presentation={item} />
              </Td>
            </Tr>
          ))}
      </TBody>
    </Table>
  );
};

export default PresentationList;
