import { Box, Button, Grid2 as Grid, Typography } from "@mui/material";

const CustomToolbar = (toolbar: any) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Grid container justifyContent="space-between">
        <Button
          onClick={() => {
            toolbar.onNavigate("PREV");
          }}
          variant="outlined"
        >
          前月
        </Button>
        <Typography variant="h6">{`${toolbar.date.getFullYear()}年 ${
          toolbar.date.getMonth() + 1
        }月`}</Typography>
        <Button
          onClick={() => {
            toolbar.onNavigate("NEXT");
          }}
          variant="outlined"
        >
          次月
        </Button>
      </Grid>
    </Box>
  );
};

export default CustomToolbar;
