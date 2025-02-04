import ChairIcon from "@mui/icons-material/Chair";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid2 as Grid,
  Slider,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAppData } from "../context/AppData";
import { useSnack } from "../context/SnackContext";
import { updateSeatGroup } from "../services/api/seatGroup";
import { EventResponse } from "../services/interfaces";
import { toJST } from "../services/utils";

interface CapacityAdjusterProps {
  event: EventResponse;
}

const CapacityAdjuster = ({ event }: CapacityAdjusterProps) => {
  const [newCapacities, setNewCapacities] = useState<Record<number, number>>(
    {}
  );
  const { stages, seatGroups, seatGroupNames, error, reloadData } =
    useAppData();
  const [changingStage, setChangingStage] = useState<number | null>(null);
  const { setSnack } = useSnack();

  // 席数の初期化
  useEffect(() => {
    setNewCapacities(
      Object.fromEntries(seatGroups.map((sg) => [sg.id, sg.capacity]))
    );
  }, [seatGroups]);

  // 席数の変更処理
  const handleCapacityChange = (id: number, newCapacity: number) => {
    setNewCapacities((prev) => ({ ...prev, [id]: newCapacity }));
  };

  // 席数の保存処理
  const handleSave = async () => {
    try {
      await Promise.all(
        seatGroups
          .filter((sg) => sg.capacity !== newCapacities[sg.id])
          .map((sg) =>
            updateSeatGroup(sg.id, {
              capacity: newCapacities[sg.id],
            })
          )
      );
      setSnack({ message: "正常に保存されました", severity: "success" });
    } catch (e) {
      console.error(e);
      setSnack({ message: "保存中にエラーが発生しました", severity: "error" });
    } finally {
      reloadData();
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" flexDirection="column">
        <Typography variant="body2" sx={{ mb: 2 }}>
          未予約席数の調整
        </Typography>
        <Typography variant="caption" color="text.secondary">
          席数の変更は即時反映されません。
        </Typography>
        <Typography variant="caption" color="text.secondary">
          変更後、保存ボタンを押してください。
        </Typography>
      </Box>

      {error && <Typography color="error">{error}</Typography>}
      {stages
        .filter((stage) => stage.event_id === event.id)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
        .map((stage) => (
          <Box
            key={stage.id}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <Divider
              sx={{
                mb: 1,
                backgroundColor: "primary.main",
                width: "100%",
              }}
            />
            <Box
              display="flex"
              alignItems="center"
              width="80%"
              justifyContent="space-between"
            >
              <Typography variant="h6">
                {toJST(stage.start_time, "dateTime")}
              </Typography>
              <Button
                variant={changingStage === stage.id ? "contained" : "outlined"}
                color="primary"
                onClick={() => {
                  setChangingStage((prev) =>
                    prev === stage.id ? null : stage.id
                  );
                  if (changingStage === stage.id) handleSave();
                }}
              >
                {changingStage === stage.id ? "保存" : "変更"}
              </Button>
            </Box>
            {seatGroups
              .filter((sg) => sg.stage_id === stage.id)
              .map((sg) => (
                <Box key={sg.id} width="100%">
                  <Divider sx={{ my: 1 }} />
                  <Grid key={sg.id} container>
                    <Grid
                      size={2}
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <ChairIcon sx={{ color: "primary.main", mr: 1 }} />
                      <Typography sx={{ mr: 1 }}>
                        {newCapacities[sg.id]}
                      </Typography>
                    </Grid>
                    <Grid size={7} display="flex" alignItems="center">
                      <Slider
                        value={newCapacities[sg.id] || 0}
                        onChange={(_, value) =>
                          handleCapacityChange(sg.id, value as number)
                        }
                        min={0}
                        max={
                          sg.capacity < 35
                            ? 50
                            : Math.min(Math.floor(sg.capacity * 1.5), 1000)
                        }
                        disabled={changingStage !== stage.id}
                      />
                    </Grid>
                    <Grid
                      size={3}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Box mx={1} px={1}>
                        {seatGroupNames[sg.id]?.map((name) => (
                          <Chip key={name} label={name} sx={{ margin: 0.5 }} />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ))}
          </Box>
        ))}
    </Box>
  );
};

export default CapacityAdjuster;
