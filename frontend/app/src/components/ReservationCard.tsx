// ReservationCard.tsx
import {
  Box,
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
import { NumComma, toJST } from "../services/utils";
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
  const [highlight, setHighlight] = useState<boolean>(false);
  const { reservation, event, stage, ticketType } = item;

  // 新規予約のハイライトを解除
  useEffect(() => {
    if (isNew) {
      setHighlight(true);
      setTimeout(() => {
        setHighlight(false);
      }, 500);
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
        position: "relative",
        backgroundColor: highlight ? "lightblue" : "white",
        borderRadius: 2,
        p: 2,
        my: 2,
        cursor: "pointer",
        transition: "background-color 0.3s",
      }}
    >
      {/* 点線デザイン */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "3%",
          height: "100%",
          backgroundColor: reservation.is_paid ? "background.default" : "white",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "5%",
            transform: "translateX(-10%)",
            width: "5px",
            height: "90%",
            backgroundImage:
              "radial-gradient(circle, gray 2px, transparent 2px)", // 点線の穴
            backgroundSize: "2px 12px", // 点線間隔
            backgroundRepeat: "repeat-y",
          }}
        />
      </Box>

      {/* メインコンテンツ */}
      <CardContent>
        <Typography variant="h5" component="div">
          {event.name}
        </Typography>
        <Box
          sx={{
            display: "flex",
            width: "100%",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Typography variant="body1" color="secondary">
            {toJST(stage.start_time, "dateTime")}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {new Date(stage.start_time).getTime() < Date.now()
              ? reservation.is_paid
                ? "ご来場ありがとう！"
                : "ステージは終了しました"
              : `あと${Math.ceil(
                  (new Date(stage.start_time).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )}日`}
          </Typography>
        </Box>
      </CardContent>

      {/* 開閉コンテンツ */}
      <Collapse in={isExpanded}>
        <CardContent>
          <Typography variant="h6" component="div">
            {ticketType.type_name}
          </Typography>
          <Typography variant="caption" color="secondary">
            {NumComma(ticketType.price)} × {reservation.num_attendees}枚
          </Typography>
          <Typography variant="body1">
            {NumComma(ticketType.price * reservation.num_attendees)}円
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

      {/* モーダルコンテンツ */}
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
