import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { SeatGroupResponse, TicketTypeResponse } from "../services/interfaces";

const SeatGroupSelector = ({
  open,
  onClose,
  seatDict,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  seatDict: Record<
    string,
    { seatGroup: SeatGroupResponse; ticketTypes: TicketTypeResponse[] }[]
  >;
  onSelect: (key: string) => void;
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>チケット情報選択</DialogTitle>
      <DialogContent>
        {Object.keys(seatDict).map((key) => (
          <Box display="flex" flexDirection="column" key={key} sx={{ mb: 2 }}>
            <Typography variant="subtitle2">
              パターン {Object.keys(seatDict).indexOf(key) + 1}
            </Typography>
            {seatDict[key].map((group) => (
              <Typography
                key={group.seatGroup.id}
                variant="caption"
                sx={{ ml: 2 }}
              >
                {group.ticketTypes
                  .map((tt) => `${tt.type_name} (${tt.price}円)`)
                  .join(", ")}
              </Typography>
            ))}
            <Button
              variant="outlined"
              size="small"
              onClick={() => onSelect(key)}
              sx={{ mt: 1 }}
            >
              選択
            </Button>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeatGroupSelector;
