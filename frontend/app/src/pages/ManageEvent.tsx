// app/src/pages/ManageEvent.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchEvents } from "../services/api/event";
import { EventResponse } from "../services/interfaces";
import {
  Container,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  ButtonGroup,
  Menu,
  MenuItem,
  Card,
} from "@mui/material";

const ManageEvent = () => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [openMenu, setOpenMenu] = useState<{
    id: number | null;
    anchor: HTMLElement | null;
  }>({ id: null, anchor: null });
  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(
    null
  );
  const [activeAction, setActiveAction] = useState<string>("");

  // イベント一覧を取得
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsData = await fetchEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error("Failed to load events:", error);
      }
    };
    loadEvents();
  }, []);

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
    if (action === activeAction && expandedAccordion === id) {
      setExpandedAccordion(null);
      setActiveAction("");
    } else {
      setExpandedAccordion(id);
      setActiveAction(action);
    }
    handleMenuClose();
  };

  return (
    <Container fixed>
      {events.map((event) => (
        <Card sx={{ mb: 2 }} key={event.id}>
          <Accordion key={event.id} expanded={expandedAccordion === event.id}>
            <AccordionSummary onClick={(e) => e.stopPropagation()}>
              <Box
                display="flex"
                flexDirection="column"
                width="100%"
                alignItems="center"
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {event.name}
                </Typography>
                <ButtonGroup fullWidth>
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
                    席数調整
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
                <MenuItem onClick={() => handleExpand(event.id, "add-stage")}>
                  ステージ追加
                </MenuItem>
                <MenuItem
                  onClick={() => handleExpand(event.id, "delete-stage")}
                >
                  ステージ削除
                </MenuItem>
                <MenuItem onClick={() => handleExpand(event.id, "add-seat")}>
                  特別席追加
                </MenuItem>
                <MenuItem onClick={() => handleExpand(event.id, "duplicate")}>
                  イベント複製
                </MenuItem>
                <MenuItem onClick={() => handleExpand(event.id, "delete")}>
                  イベント全削除
                </MenuItem>
              </Menu>
            </AccordionSummary>
            <AccordionDetails>
              {expandedAccordion === event.id && (
                <Box width="100%">
                  {activeAction === "edit" ? (
                    <Typography>情報変更</Typography>
                  ) : activeAction === "seat" ? (
                    <Typography>席数調整</Typography>
                  ) : activeAction === "add-stage" ? (
                    <Typography>ステージ追加</Typography>
                  ) : activeAction === "delete-stage" ? (
                    <Typography>ステージ削除</Typography>
                  ) : activeAction === "add-seat" ? (
                    <Typography>特別席追加</Typography>
                  ) : activeAction === "duplicate" ? (
                    <Typography>イベント複製</Typography>
                  ) : activeAction === "delete" ? (
                    <Typography>イベント全削除</Typography>
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
