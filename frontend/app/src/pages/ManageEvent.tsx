// app/src/pages/ManageEvent.tsx
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  ButtonGroup,
  Card,
  Container,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import CapacityAdjuster from "../components/CapacityAdjuster";
import EventDeleter from "../components/EventDeleter";
import EventDuplicater from "../components/EventDuplicater";
import EventInfoManager from "../components/EventInfoManager";
import LoadingScreen from "../components/LoadingScreen";
import StageManager from "../components/StageManager";
import TicketTypeManager from "../components/TicketTypeManager";
import { useAppData } from "../context/AppData";

const ManageEvent = () => {
  const { futureEvents, pastEvents, loading } = useAppData();
  const [openMenu, setOpenMenu] = useState<{
    id: number | null;
    anchor: HTMLElement | null;
  }>({ id: null, anchor: null });
  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(
    null
  );
  const [activeAction, setActiveAction] = useState<string>("");

  // メニューを開く
  const handleMenuClick = (
    id: number,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setOpenMenu({ id, anchor: event.currentTarget });
  };

  // メニューを閉じる
  const handleMenuClose = () => {
    setOpenMenu({ id: null, anchor: null });
  };

  // アコーディオンを開く
  const handleExpand = (id: number, action: string) => {
    if (openMenu.id === id) {
      setExpandedAccordion(null);
      setActiveAction("");
      setTimeout(() => {
        setExpandedAccordion(id);
        setActiveAction(action);
      }, 0);
    } else if (
      action === activeAction ||
      (action === "" && expandedAccordion === id)
    ) {
      setExpandedAccordion(null);
      setActiveAction("");
    } else {
      setExpandedAccordion(null);
      setActiveAction("");
      setTimeout(() => {
        setExpandedAccordion(id);
        setActiveAction(action);
      }, 0);
    }
    handleMenuClose();
  };

  return (
    <Container>
      {loading && <LoadingScreen />}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        開催中のイベント
      </Typography>
      {futureEvents.map((event) => (
        <Card sx={{ mb: 2 }} key={event.id}>
          <Accordion key={event.id} expanded={expandedAccordion === event.id}>
            <AccordionSummary onClick={() => handleExpand(event.id, "")}>
              <Box
                display="flex"
                flexDirection="column"
                width="100%"
                alignItems="center"
              >
                <Typography variant="h5" sx={{ my: 4 }}>
                  {event.name}
                </Typography>
                <ButtonGroup fullWidth onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleExpand(event.id, "edit")}
                  >
                    情報変更
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleExpand(event.id, "seat")}
                  >
                    残席調整
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={(e) => handleMenuClick(event.id, e)}
                  >
                    その他
                  </Button>
                </ButtonGroup>
              </Box>
              <Menu
                anchorEl={openMenu.anchor}
                open={openMenu.id === event.id}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand(event.id, "manage-stage");
                  }}
                >
                  ステージ編集
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand(event.id, "manage-ticket");
                  }}
                >
                  チケット編集
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand(event.id, "duplicate");
                  }}
                >
                  イベント複製
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand(event.id, "delete");
                  }}
                >
                  イベント全削除
                </MenuItem>
              </Menu>
            </AccordionSummary>
            <AccordionDetails>
              {expandedAccordion === event.id && (
                <Box width="100%">
                  {activeAction === "edit" ? (
                    <EventInfoManager event={event} />
                  ) : activeAction === "seat" ? (
                    <CapacityAdjuster event={event} />
                  ) : activeAction === "manage-stage" ? (
                    <StageManager event={event} />
                  ) : activeAction === "manage-ticket" ? (
                    <TicketTypeManager event={event} />
                  ) : activeAction === "duplicate" ? (
                    <EventDuplicater event={event} />
                  ) : activeAction === "delete" ? (
                    <EventDeleter event={event} />
                  ) : (
                    <Typography>エラーが発生しました</Typography>
                  )}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Card>
      ))}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        過去のイベント
      </Typography>
      {pastEvents.map((event) => (
        <Card sx={{ mb: 2 }} key={event.id}>
          <Accordion key={event.id} expanded={expandedAccordion === event.id}>
            <AccordionSummary onClick={() => handleExpand(event.id, "")}>
              <Box
                display="flex"
                flexDirection="column"
                width="100%"
                alignItems="center"
              >
                <Typography variant="h5" sx={{ my: 4 }}>
                  {event.name}
                </Typography>
                <ButtonGroup fullWidth onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleExpand(event.id, "edit")}
                  >
                    情報変更
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleExpand(event.id, "seat")}
                  >
                    残席調整
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={(e) => handleMenuClick(event.id, e)}
                  >
                    その他
                  </Button>
                </ButtonGroup>
              </Box>
              <Menu
                anchorEl={openMenu.anchor}
                open={openMenu.id === event.id}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand(event.id, "manage-stage");
                  }}
                >
                  ステージ編集
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand(event.id, "manage-ticket");
                  }}
                >
                  チケット編集
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand(event.id, "duplicate");
                  }}
                >
                  イベント複製
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand(event.id, "delete");
                  }}
                >
                  イベント全削除
                </MenuItem>
              </Menu>
            </AccordionSummary>
            <AccordionDetails>
              {expandedAccordion === event.id && (
                <Box width="100%">
                  {activeAction === "edit" ? (
                    <EventInfoManager event={event} />
                  ) : activeAction === "seat" ? (
                    <CapacityAdjuster event={event} />
                  ) : activeAction === "manage-stage" ? (
                    <StageManager event={event} />
                  ) : activeAction === "manage-ticket" ? (
                    <TicketTypeManager event={event} />
                  ) : activeAction === "duplicate" ? (
                    <EventDuplicater event={event} />
                  ) : activeAction === "delete" ? (
                    <EventDeleter event={event} />
                  ) : (
                    <Typography>エラーが発生しました</Typography>
                  )}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Card>
      ))}
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to="/manage-event/create"
      >
        新規イベント作成
      </Button>
    </Container>
  );
};

export default ManageEvent;
