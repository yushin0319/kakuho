// app/src/pages/ReservationList.tsx
import QrCode2Icon from "@mui/icons-material/QrCode2";
import { Alert, Box, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import LoadingScreen from "../components/LoadingScreen";
import ReservationCard from "../components/ReservationCard";
import { useAppData } from "../context/AppData";
import { useNewItemContext } from "../context/NewItemContext";

const ReservationList = () => {
  const { reservations, loading, error } = useAppData();
  const [expandCardId, setExpandCardId] = useState<number | null>(null);
  const { newItems, clearNewItems } = useNewItemContext();

  // 新規予約がある場合、新規予約の表示を消す
  useEffect(() => {
    if (newItems.length > 0) {
      setTimeout(() => {
        clearNewItems();
      }, 0);
    }
  }, [reservations]);

  // カードクリック時の処理
  const handleCardClick = (id: number) => {
    setExpandCardId((prev) => (prev === id ? null : id));
  };

  if (error) return <div>Error: {error}</div>;

  // Min-KK-11: 過去かつ未払いの予約
  const unpaidPastReservations = reservations.filter(
    (item) =>
      new Date(item.stage.start_time) < new Date() &&
      !item.reservation.is_paid
  );

  return (
    <Container>
      {/* Min-KK-12: データ更新時はインラインスピナー */}
      {loading && <LoadingScreen variant="inline" />}

      {/* Min-KK-11: 過去未払い予約の案内 */}
      {unpaidPastReservations.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          お支払いが完了していない予約があります。詳細については主催者にお問い合わせください。
        </Alert>
      )}

      {reservations.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          予約がありません
        </Typography>
      ) : (
        /* Min-KK-13: QR案内を視覚的に強調 */
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
          <QrCode2Icon color="primary" fontSize="small" />
          <Typography variant="body2" color="primary" fontWeight="bold">
            タップするとQRコードが表示されます
          </Typography>
        </Box>
      )}
      {reservations
        .sort(
          (a, b) =>
            new Date(a.stage.start_time).getTime() -
            new Date(b.stage.start_time).getTime()
        )
        .filter(
          (item) =>
            new Date(item.stage.start_time).getTime() >= new Date().getTime()
        )
        .map((item) => (
          <ReservationCard
            key={item.reservation.id}
            reservationDetail={item}
            isExpanded={expandCardId === item.reservation.id}
            isNew={newItems.includes(item.reservation.id)}
            onCardClick={() => handleCardClick(item.reservation.id)}
          />
        ))}
      {reservations.filter(
        (item) =>
          new Date(item.stage.start_time).getTime() < new Date().getTime()
      ).length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
          過去のイベント
        </Typography>
      )}

      {reservations
        .sort(
          (a, b) =>
            new Date(b.stage.start_time).getTime() -
            new Date(a.stage.start_time).getTime()
        )
        .filter(
          (item) =>
            new Date(item.stage.start_time).getTime() < new Date().getTime()
        )
        .map((item) => (
          <ReservationCard
            key={item.reservation.id}
            reservationDetail={item}
            isExpanded={expandCardId === item.reservation.id}
            isNew={newItems.includes(item.reservation.id)}
            onCardClick={() => handleCardClick(item.reservation.id)}
          />
        ))}
    </Container>
  );
};

export default ReservationList;
