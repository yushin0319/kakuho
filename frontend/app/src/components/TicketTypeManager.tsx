import {
  Add,
  Delete,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAppData } from "../context/AppData";
import { useSnack } from "../context/SnackContext";
import { createSeatGroup, deleteSeatGroup } from "../services/api/seatGroup";
import {
  createTicketType,
  deleteTicketType,
  updateTicketType,
} from "../services/api/ticketType";
import { EventResponse, TicketTypeResponse } from "../services/interfaces";
import { toJST } from "../services/utils";
import LoadingScreen from "./LoadingScreen";
import ValidatedForm from "./ValidatedForm";

const TicketTypeManager = ({ event }: { event: EventResponse }) => {
  const [openId, setOpenId] = useState<number | null>(null);
  const [hasReservations, setHasReservations] = useState<
    Record<number, boolean>
  >({});
  const {
    stages,
    seatGroups,
    ticketTypes,
    reservations,
    loading,
    error,
    reloadData,
  } = useAppData();
  const methods = useForm<{
    ticketTypes: { [key: number]: TicketTypeResponse };
  }>({
    defaultValues: {
      ticketTypes: {},
    },
  });
  const { watch, setValue } = methods;
  const { setSnack } = useSnack();

  const filteredStages = useMemo(
    () => stages.filter((stage) => stage.event_id === event.id),
    [stages, event.id]
  );

  const filteredSeatGroups = useMemo(
    () =>
      seatGroups.filter((seatGroup) =>
        filteredStages.some((stage) => stage.id === seatGroup.stage_id)
      ),
    [seatGroups, filteredStages]
  );

  const filteredTicketTypes = useMemo(
    () =>
      ticketTypes.filter((ticketType) =>
        filteredSeatGroups.some(
          (seatGroup) => seatGroup.id === ticketType.seat_group_id
        )
      ),
    [ticketTypes, filteredSeatGroups]
  );

  // 予約の存在チェック
  useEffect(() => {
    const hasReservations = filteredTicketTypes.reduce(
      (acc, ticketType) =>
        reservations.some(
          (reservation) => reservation.ticketType.id === ticketType.id
        )
          ? { ...acc, [ticketType.id]: true }
          : acc,
      {}
    );
    setHasReservations(hasReservations);
  }, [filteredTicketTypes, reservations]);

  useMemo(() => {
    const ticketTypeValues = filteredTicketTypes.reduce(
      (acc, type) => ({ ...acc, [type.id]: type }),
      {}
    );
    setValue("ticketTypes", ticketTypeValues);
  }, [filteredSeatGroups, filteredTicketTypes]);

  const watchTicketTypes = watch("ticketTypes");

  // チケットタイプの更新
  const handleSave = async (id: number, data: any) => {
    await updateTicketType(id, data);
    reloadData();
  };

  // チケットタイプの削除
  const handleDelete = async (id: number) => {
    const seatGroupId = ticketTypes.find((tt) => tt.id === id)?.seat_group_id;
    if (!seatGroupId) return;
    await deleteTicketType(id);
    if (
      ticketTypes.filter((tt) => tt.seat_group_id === seatGroupId).length === 1
    ) {
      await deleteSeatGroup(seatGroupId);
    }
    reloadData();
    setSnack({
      message: "券種を削除しました",
      severity: "success",
    });
  };

  // ticketTypeの新規作成
  const handleAddTicketType = async (seatGroupId: number) => {
    await createTicketType(seatGroupId, {
      type_name: "名前を入力して下さい",
      price: 0,
    });
    reloadData();
    setSnack({
      message: "券種を追加しました",
      severity: "success",
    });
  };

  // seatGroup & ticketTypeの新規作成
  const handleAddSeatGroup = async (stageId: number) => {
    const seatGroup = await createSeatGroup(stageId, { capacity: 0 });
    await createTicketType(seatGroup.id, {
      type_name: "名前を入力して下さい",
      price: 0,
    });
    reloadData();
    setSnack({
      message: "特別席を追加しました",
      severity: "success",
    });
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <FormProvider {...methods}>
      <Box display="flex" flexDirection="column" alignItems="center">
        {loading && <LoadingScreen />}
        <Typography variant="body2" sx={{ mb: 2 }}>
          チケット編集
        </Typography>
        <Typography variant="caption" color="text.secondary">
          予約の存在する券種は削除できません。
        </Typography>
        <Typography variant="caption" color="text.secondary">
          予約管理画面からキャンセルしてください。
        </Typography>
        {/* ステージごとのチケットタイプ管理 */}
        {filteredStages
          .sort((a, b) => a.start_time.localeCompare(b.start_time))
          .map((stage) => (
            <Box
              key={stage.id}
              sx={{
                mt: 1,
                mb: 1,
                border: "1px solid #ddd",
                borderRadius: 2,
                p: 1,
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-around"
                onClick={() => setOpenId(openId === stage.id ? null : stage.id)}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: "text.secondary",
                  }}
                >
                  {toJST(stage.start_time, "dateTime")}
                </Typography>
                <IconButton size="small">
                  {openId === stage.id ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </IconButton>
              </Box>
              <Collapse in={openId === stage.id}>
                <Box>
                  {filteredSeatGroups
                    .filter((sg) => sg.stage_id === stage.id)
                    .map((sg) => (
                      <Box
                        key={sg.id}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mt: 2 }}
                      >
                        {filteredTicketTypes
                          .filter((tt) => tt.seat_group_id === sg.id)
                          .map((tt) => (
                            <Box
                              key={tt.id}
                              display="flex"
                              alignItems="center"
                              gap={2}
                              onBlur={() =>
                                handleSave(tt.id, watchTicketTypes[tt.id])
                              }
                              sx={{ mt: 1 }}
                            >
                              <ValidatedForm
                                name={`ticketTypes.${tt.id}.type_name`}
                                label=""
                                size="small"
                                fieldType="title"
                                defaultValue={tt.type_name}
                              />
                              <ValidatedForm
                                name={`ticketTypes.${tt.id}.price`}
                                label=""
                                size="small"
                                fieldType="number"
                                defaultValue={tt.price.toString()}
                              />
                              <Tooltip
                                title={
                                  hasReservations[tt.id]
                                    ? "予約が存在するため削除できません"
                                    : ""
                                }
                              >
                                <span>
                                  <IconButton
                                    onClick={() => handleDelete(tt.id)}
                                    color="error"
                                    disabled={hasReservations[tt.id]}
                                  >
                                    <Delete />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Box>
                          ))}
                        <Box
                          width="100%"
                          display="flex"
                          alignItems="end"
                          justifyContent="space-around"
                          sx={{ mt: 1 }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: "bold",
                              color: "text.secondary",
                            }}
                          >
                            空席：{sg.capacity}席
                          </Typography>
                          <Button
                            variant="text"
                            size="small"
                            startIcon={<Add />}
                            onClick={() => handleAddTicketType(sg.id)}
                            sx={{ mt: 1 }}
                          >
                            券種追加
                          </Button>
                        </Box>
                        <Divider sx={{ width: "100%", mt: 2 }} />
                      </Box>
                    ))}
                </Box>
                {/* 新規追加ボタン */}
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => handleAddSeatGroup(stage.id)}
                  sx={{ mt: 2 }}
                >
                  特別席追加（座席数独立）
                </Button>
              </Collapse>
            </Box>
          ))}
      </Box>
    </FormProvider>
  );
};

export default TicketTypeManager;
