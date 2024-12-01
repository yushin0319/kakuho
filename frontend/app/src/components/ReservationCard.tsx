// app/src/components/ReservationCard.tsx
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Collapse,
  Grid2 as Grid,
  Typography,
} from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { ReservationDetail } from "../context/ReservationContext";
import { toJST } from "../services/utils";
import ReservationChange from "./ReservationChange";
import ReservationDelete from "./ReservationDelete";

interface ReservationCardProps {
  reservationDetail: ReservationDetail;
  isExpanded: boolean;
  isNew: boolean;
  onCardClick: () => void;
}

const ReservationCard = ({
  reservationDetail: item,
  isExpanded,
  isNew,
  onCardClick,
}: ReservationCardProps) => {
  const [isChanging, setIsChanging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [highlight, setHighlight] = useState(isNew);
  const { reservation, event, stage, ticketType } = item;

  // 新規予約のハイライトを解除
  useEffect(() => {
    if (isNew) {
      setTimeout(() => {
        setHighlight(false);
      }, 50);
    }
  }, [isNew]);

  // 変更ボタンクリック時の処理
  const handleChangeClick = () => {
    setIsChanging(true);
  };

  // 削除ボタンクリック時の処理
  const handleDeleteClick = () => {
    setIsDeleting(true);
  };

  return (
    <Card
      onClick={onCardClick}
      sx={{
        transition: "background-color 0.5s, box-shadow 0.3s",
        backgroundColor: highlight ? "secondary.main" : "paper",
        p: 2,
        mb: 2,

        "@media (hover: hover)": {
          cursor: "pointer",
          "&:hover": {
            boxShadow: 4,
          },
        },
      }}
    >
      <CardContent>
        <Typography variant="h5" component="div">
          {event.name}
        </Typography>
        <Typography variant="body1" color="secondary">
          {toJST(stage.start_time, "dateTime")}
        </Typography>
      </CardContent>
      <Collapse in={isExpanded}>
        <CardContent>
          <Typography variant="h6" component="div">
            {ticketType.type_name}
          </Typography>
          <Typography variant="caption" color="secondary">
            {ticketType.price} × {reservation.num_attendees}枚
          </Typography>
          <Typography variant="body1">
            {ticketType.price * reservation.num_attendees}円
          </Typography>
          <Grid container justifyContent="center" sx={{ mt: 2 }}>
            <QRCodeSVG value={`Kakuho-${reservation.id}`} size={128} />
          </Grid>
        </CardContent>
        <CardActions
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 4,
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              handleChangeClick();
            }}
          >
            変更
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick();
            }}
          >
            削除
          </Button>
        </CardActions>
      </Collapse>
      {isChanging && (
        <ReservationChange
          reservationDetail={item}
          onClose={() => {
            setIsChanging(false);
          }}
        />
      )}
      {isDeleting && (
        <ReservationDelete
          reservationDetail={item}
          onClose={() => setIsDeleting(false)}
        />
      )}
    </Card>
  );
};

export default ReservationCard;
