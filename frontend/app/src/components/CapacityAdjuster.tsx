import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Slider,
  Button,
  Chip,
  Grid2 as Grid,
  Divider,
} from "@mui/material";
import ChairIcon from "@mui/icons-material/Chair";
import { EventResponse } from "../services/interfaces";
import { updateSeatGroup } from "../services/api/seatGroup";
import { useEventData } from "../context/EventDataContext";
import { toJST } from "../services/utils";

interface CapacityAdjusterProps {
  event: EventResponse;
}

const CapacityAdjuster = ({ event }: CapacityAdjusterProps) => {
  const [newCapacities, setNewCapacities] = useState<Record<number, number>>(
    {}
  );
  const {
    stages,
    seatGroups,
    seatGroupNames,
    loading,
    error,
    changeSeatGroup,
  } = useEventData();

  // 席数の初期化
  useEffect(() => {
    setNewCapacities(
      Object.fromEntries(seatGroups.map((sg) => [sg.id, sg.capacity]))
    );
  }, [event, seatGroups]);

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
            }).then(() => changeSeatGroup(sg.id))
          )
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      {error && <Typography color="error">{error}</Typography>}
      {stages
        .filter((stage) => stage.event_id === event.id)
        .map((stage) => (
          <Box key={stage.id}>
            <Divider
              sx={{
                my: 1,
                backgroundColor: "primary.main",
              }}
            />
            <Typography variant="h6">
              {toJST(stage.start_time, "dateTime")}
            </Typography>
            {seatGroups
              .filter((sg) => sg.stage_id === stage.id)
              .map((sg) => (
                <Box key={sg.id}>
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
                          sg.capacity < 70
                            ? 100
                            : Math.min(Math.floor(sg.capacity * 1.5), 1000)
                        }
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

      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? "保存中..." : "保存"}
      </Button>
    </Box>
  );
};

export default CapacityAdjuster;
