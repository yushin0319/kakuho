import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAppData } from "../context/AppData";
import { useSnack } from "../context/SnackContext";
import PaidStatusController from "./PaidStatusController";
import QrReader from "./QrReader";

interface ScannerModalProps {
  stageId: number;
  onClose: () => void;
}

const ScannerModal = ({ stageId, onClose }: ScannerModalProps) => {
  const [scanResult, setScanResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const { reservations } = useAppData();
  const { setSnack } = useSnack();

  // 予約情報を取得
  const handleQrScanResult = (result: string) => {
    if (!result.startsWith("Kakuho-")) {
      setSnack({
        message: "このQRコードは有効ではありません",
        severity: "error",
      });
      return;
    }

    const scannedId = result.replace("Kakuho-", "");
    setScanResult(scannedId);

    const reservation = reservations.find(
      (res) => res.reservation.id === parseInt(scannedId, 10)
    );

    if (!reservation) {
      setSnack({
        message: "ご予約が見つかりません",
        severity: "error",
      });
      return;
    }

    if (reservation.stage.id !== stageId) {
      setSnack({
        message: "このQRコードは他のステージのものです",
        severity: "error",
      });
    } else if (reservation.reservation.is_paid) {
      setSnack({
        message: "このご予約はお支払い済です",
        severity: "error",
      });
    } else {
      setIsPaying(true);
    }
  };

  const handleClose = () => {
    setScanResult("");
    onClose();
  };

  return (
    <Dialog open={true} onClose={handleClose}>
      <DialogContent>
        <Typography variant="body1">QRコードをスキャンしてください</Typography>
        <Box
          sx={{
            height: "240px",
            overflow: "hidden",
          }}
        >
          {isLoading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <QrReader
            onResult={handleQrScanResult}
            onReady={() => setIsLoading(false)}
          />
        </Box>
        {/* 支払い処理 */}
        {isPaying && (
          <PaidStatusController
            reservationId={parseInt(scanResult, 10)}
            onClose={() => {
              setIsPaying(false);
              setScanResult("");
            }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleClose}>
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScannerModal;
