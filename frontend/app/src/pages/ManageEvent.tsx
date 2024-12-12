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
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CapacityAdjuster from "../components/CapacityAdjuster";
import EventInfoManager from "../components/EventInfoManager";
import LoadingScreen from "../components/LoadingScreen";
import { useAppData } from "../context/AppData";
import { EventResponse } from "../services/interfaces";

const ManageEvent = () => {
  const { events, stages, loading } = useAppData();
  const [openMenu, setOpenMenu] = useState<{
    id: number | null;
    anchor: HTMLElement | null;
  }>({ id: null, anchor: null });
  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(
    null
  );
  const [activeAction, setActiveAction] = useState<string>("");
  const [startDate, setStartDate] = useState<Record<number, Date>>({});

  // イベントの開始日を取得
  useEffect(() => {
    const newStartDates: Record<number, Date> = {};

    events.forEach((event) => {
      let start_date = new Date(3000, 1, 1);

      stages.forEach((stage) => {
        if (stage.event_id === event.id) {
          const stageStartDate = new Date(stage.start_time);

          if (stageStartDate < start_date) start_date = stageStartDate;
        }
      });

      newStartDates[event.id] = start_date;
    });

    setStartDate(newStartDates);
  }, [loading]);

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
      setExpandedAccordion(null);
      setActiveAction("");
      setTimeout(() => {
        setExpandedAccordion(id);
        setActiveAction(action);
      }, 0);
    }
    handleMenuClose();
  };

  const EventCard = ({ event }: { event: EventResponse }) => {
    return (
      <Card sx={{ mb: 2 }} key={event.id}>
        <Accordion key={event.id} expanded={expandedAccordion === event.id}>
          <AccordionSummary onClick={(e) => e.stopPropagation()}>
            <Box
              display="flex"
              flexDirection="column"
              width="100%"
              alignItems="center"
            >
              <Typography variant="h5" sx={{ my: 4 }}>
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
              <MenuItem onClick={() => handleExpand(event.id, "add-stage")}>
                ステージ追加
              </MenuItem>
              <MenuItem onClick={() => handleExpand(event.id, "delete-stage")}>
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
                  <EventInfoManager event={event} />
                ) : activeAction === "seat" ? (
                  <CapacityAdjuster event={event} />
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
    );
  };

  return (
    <Container>
      {loading && <LoadingScreen />}
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        開催中のイベント
      </Typography>
      {events
        .filter((event) => startDate[event.id] > new Date())
        .map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        過去のイベント
      </Typography>
      {events
        .filter((event) => startDate[event.id] <= new Date())
        .map((event) => (
          <EventCard key={event.id} event={event} />
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
